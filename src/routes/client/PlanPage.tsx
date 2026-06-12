import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { type Membership } from '../../lib/auth'

interface PlanPageProps {
  membership: Membership
}

type LoadState = 'loading' | 'unconfigured' | 'error' | 'ready'

interface PlanData {
  projectName: string
  milestones: Array<{ id: string; name: string; targetDate: string | null; sortOrder: number }>
  issues: Array<{ id: string; title: string; state: { name: string; type: string }; milestone: { id: string } | null; priority: number }>
}

function formatDate(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function PlanPage({ membership: _membership }: PlanPageProps) {
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [planData, setPlanData] = useState<PlanData | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/linear-plan`,
        { method: 'GET', headers: { Authorization: `Bearer ${session?.access_token ?? ''}` } },
      )
      const json = await res.json()
      if (cancelled) return
      if (!res.ok) { setLoadState('error'); return }
      if (json.unconfigured) { setLoadState('unconfigured'); return }
      setPlanData(json)
      setLoadState('ready')
    }
    load()
    return () => { cancelled = true }
  }, [])

  if (loadState === 'loading') {
    return <div data-testid="plan-loading" className="empty-state">Loading project plan…</div>
  }
  if (loadState === 'unconfigured') {
    return <div data-testid="plan-unconfigured" className="empty-state">Project plan not yet configured.</div>
  }
  if (loadState === 'error') {
    return <div data-testid="plan-error" className="empty-state">Could not load project plan.</div>
  }
  if (!planData) return null

  const sortedMilestones = [...planData.milestones].sort((a, b) => a.sortOrder - b.sortOrder)
  const unmilestoned = planData.issues.filter(i => i.milestone === null)

  return (
    <div data-testid="plan-page" className="plan-page">
      <h1 className="pagehead">{planData.projectName}</h1>

      {sortedMilestones.length === 0 && planData.issues.length > 0 ? (
        <div>
          {planData.issues.map(issue => (
            <IssueRow key={issue.id} issue={issue} />
          ))}
        </div>
      ) : (
        <>
          {sortedMilestones.map(m => {
            const mIssues = planData.issues.filter(i => i.milestone?.id === m.id)
            return (
              <section key={m.id} className="plan-milestone">
                <div className="plan-milestone-head">
                  <span className="plan-milestone-name">{m.name}</span>
                  {m.targetDate && (
                    <span className="plan-milestone-date">{formatDate(m.targetDate)}</span>
                  )}
                </div>
                {mIssues.length === 0
                  ? <div className="plan-empty-section">No issues</div>
                  : mIssues.map(issue => <IssueRow key={issue.id} issue={issue} />)
                }
              </section>
            )
          })}

          {unmilestoned.length > 0 && (
            <section className="plan-milestone">
              <div className="plan-milestone-head">
                <span className="plan-milestone-name">Backlog</span>
              </div>
              {unmilestoned.map(issue => <IssueRow key={issue.id} issue={issue} />)}
            </section>
          )}
        </>
      )}
    </div>
  )
}

function IssueRow({ issue }: { issue: PlanData['issues'][number] }) {
  return (
    <div key={issue.id} className="plan-issue">
      <span className={`plan-status plan-status--${issue.state.type}`} aria-label={issue.state.name} />
      <span className="plan-issue-title">{issue.title}</span>
      <span className="plan-issue-state">{issue.state.name}</span>
    </div>
  )
}
