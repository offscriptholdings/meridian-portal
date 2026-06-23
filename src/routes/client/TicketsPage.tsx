import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { type Membership } from '../../lib/auth'

interface Ticket {
  id: string
  subject: string
  status: 'open' | 'closed'
  created_at: string
}

interface TicketsPageProps {
  membership: Membership
  userEmail: string
}

type FormState = 'idle' | 'submitting' | 'success' | 'error'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export default function TicketsPage({ membership, userEmail }: TicketsPageProps) {
  const [formState, setFormState] = useState<FormState>('idle')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [listLoading, setListLoading] = useState(true)

  async function fetchTickets() {
    setListLoading(true)
    const { data } = await supabase
      .from('tickets')
      .select('id, subject, status, created_at')
      .eq('tenant_id', membership.tenant_id)
      .order('created_at', { ascending: false })
    setTickets((data as Ticket[]) ?? [])
    setListLoading(false)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
  useEffect(() => { fetchTickets() }, [])

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
      fetchTickets()
    }
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

      {/* Ticket list — always visible */}
      <div data-testid="tickets-list" className="tickets-list">
        {listLoading ? (
          <p className="tickets-list-loading">Loading…</p>
        ) : tickets.length === 0 ? (
          <p data-testid="tickets-list-empty" className="tickets-list-empty">No tickets yet.</p>
        ) : (
          tickets.map(ticket => (
            <div
              key={ticket.id}
              data-testid="tickets-list-item"
              data-ticket-id={ticket.id}
              className="tickets-list-item"
            >
              <span className="tickets-item-subject">{ticket.subject}</span>
              <span className={`tickets-status tickets-status--${ticket.status}`}>
                {ticket.status}
              </span>
              <span className="tickets-item-date">{formatDate(ticket.created_at)}</span>
            </div>
          ))
        )}
      </div>

      {/* Submit section */}
      {formState === 'success' ? (
        <div className="tickets-submit-section">
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
      ) : (
        <div className="tickets-submit-section">
          <p className="tickets-section-label">Submit a new request</p>
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
      )}
    </div>
  )
}
