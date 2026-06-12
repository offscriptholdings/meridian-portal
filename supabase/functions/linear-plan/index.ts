import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Content-Type': 'application/json',
}

interface LinearMilestone {
  id: string
  name: string
  targetDate: string | null
  sortOrder: number
}
interface LinearIssue {
  id: string
  title: string
  state: { name: string; type: string }
  milestone: { id: string } | null
  priority: number
}

const PLAN_QUERY = `
  query GetProjectPlan($projectId: String!) {
    project(id: $projectId) {
      id
      name
      milestones {
        nodes {
          id
          name
          targetDate
          sortOrder
        }
      }
      issues(first: 100) {
        nodes {
          id
          title
          state { name type }
          milestone { id }
          priority
        }
      }
    }
  }
`

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: CORS })
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: CORS })
  }
  const jwt = authHeader.replace('Bearer ', '')

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { data: { user }, error: userError } = await supabase.auth.getUser(jwt)
  if (userError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: CORS })
  }

  const { data: membership } = await supabase
    .from('memberships')
    .select('tenant_id, tenants(id, name, linear_project_id)')
    .eq('user_id', user.id)
    .single()

  if (!membership) {
    return new Response(JSON.stringify({ error: 'Membership not found' }), { status: 404, headers: CORS })
  }

  // Supabase join return type is untyped for nested selects
  const tenant = (membership.tenants as unknown as { id: string; name: string; linear_project_id: string | null })
  if (!tenant?.linear_project_id) {
    return new Response(JSON.stringify({ unconfigured: true, milestones: [], issues: [] }), { status: 200, headers: CORS })
  }

  const linearApiKey = Deno.env.get('LINEAR_API_KEY')
  if (!linearApiKey) {
    return new Response(JSON.stringify({ error: 'Linear API not configured' }), { status: 500, headers: CORS })
  }

  const linearRes = await fetch('https://api.linear.app/graphql', {
    method: 'POST',
    headers: {
      'Authorization': linearApiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: PLAN_QUERY, variables: { projectId: tenant.linear_project_id } }),
  })

  if (!linearRes.ok) {
    return new Response(JSON.stringify({ error: 'Linear API error' }), { status: 502, headers: CORS })
  }

  const linearJson = await linearRes.json()
  if (linearJson.errors?.length) {
    return new Response(JSON.stringify({ error: linearJson.errors[0].message }), { status: 502, headers: CORS })
  }

  if (!linearJson.data?.project) {
    return new Response(JSON.stringify({ error: 'Project not found in Linear' }), { status: 404, headers: CORS })
  }

  const project = linearJson.data.project
  return new Response(
    JSON.stringify({
      projectName: project.name,
      milestones: project.milestones.nodes as LinearMilestone[],
      issues: project.issues.nodes as LinearIssue[],
    }),
    { status: 200, headers: CORS },
  )
})
