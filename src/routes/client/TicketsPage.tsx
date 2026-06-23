import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { type Membership } from '../../lib/auth'

interface TicketsPageProps {
  membership: Membership
  userEmail: string
}

type FormState = 'idle' | 'submitting' | 'success' | 'error'

export default function TicketsPage({ membership, userEmail }: TicketsPageProps) {
  const [formState, setFormState] = useState<FormState>('idle')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!subject.trim() || !body.trim()) {
      setFormError('Subject and message are required.')
      return
    }
    setFormError(null)
    setFormState('submitting')
    const { error } = await supabase.from('tickets').insert({
      tenant_id: membership.tenant_id,
      submitted_by: userEmail,
      subject: subject.trim(),
      body: body.trim(),
    })
    if (error) {
      setFormState('error')
      setFormError('Could not submit — try again')
    } else {
      setFormState('success')
      setSubject('')
      setBody('')
    }
  }

  if (formState === 'success') {
    return (
      <div data-testid="tickets-page" className="tickets-page">
        <div data-testid="tickets-success" className="tickets-success">
          Ticket submitted — we'll be in touch.
        </div>
        <button
          className="btn"
          onClick={() => { setFormState('idle'); setFormError(null) }}
        >
          Submit another
        </button>
      </div>
    )
  }

  const isSubmitting = formState === 'submitting'

  return (
    <div data-testid="tickets-page" className="tickets-page">
      <div className="tickets-head">
        <div>
          <h2 className="tickets-title">Tickets</h2>
          <p className="tickets-sub">{membership.tenant_name}</p>
        </div>
      </div>
      <form
        data-testid="tickets-form"
        className="tickets-form"
        onSubmit={handleSubmit}
      >
        <div className="tickets-field">
          <label htmlFor="tickets-subject" className="tickets-label">Subject</label>
          <input
            id="tickets-subject"
            data-testid="tickets-subject"
            className="tickets-input"
            type="text"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            disabled={isSubmitting}
            placeholder="Brief summary of your request"
          />
        </div>
        <div className="tickets-field">
          <label htmlFor="tickets-body" className="tickets-label">Message</label>
          <textarea
            id="tickets-body"
            data-testid="tickets-body"
            className="tickets-textarea"
            value={body}
            onChange={e => setBody(e.target.value)}
            disabled={isSubmitting}
            placeholder="Describe your request in detail"
          />
        </div>
        <div className="tickets-actions">
          <button
            data-testid="tickets-submit-btn"
            className="btn btn-primary"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting…' : 'Submit'}
          </button>
          {formError && (
            <span data-testid="tickets-error" className="tickets-err">{formError}</span>
          )}
        </div>
      </form>
    </div>
  )
}
