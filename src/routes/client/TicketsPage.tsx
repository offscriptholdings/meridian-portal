import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { type Membership } from '../../lib/auth'

interface Ticket {
  id: string
  subject: string
  body: string
  submitted_by: string
  status: 'open' | 'closed'
  created_at: string
}

interface Reply {
  id: string
  sender_email: string
  sender_role: 'client' | 'admin'
  body: string
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
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [replies, setReplies] = useState<Reply[]>([])
  const [repliesLoading, setRepliesLoading] = useState(false)
  const [replyBody, setReplyBody] = useState('')
  const [replySubmitting, setReplySubmitting] = useState(false)
  const [replyError, setReplyError] = useState<string | null>(null)

  async function fetchTickets() {
    setListLoading(true)
    const { data } = await supabase
      .from('tickets')
      .select('id, subject, body, submitted_by, status, created_at')
      .eq('tenant_id', membership.tenant_id)
      .order('created_at', { ascending: false })
    setTickets((data as Ticket[]) ?? [])
    setListLoading(false)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
  useEffect(() => { fetchTickets() }, [])

  async function fetchReplies(ticketId: string) {
    setRepliesLoading(true)
    const { data } = await supabase
      .from('ticket_replies')
      .select('id, sender_email, sender_role, body, created_at')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true })
    setReplies((data as Reply[]) ?? [])
    setRepliesLoading(false)
  }

  function openTicket(ticket: Ticket) {
    setSelectedTicket(ticket)
    setReplies([])
    setReplyBody('')
    setReplyError(null)
    fetchReplies(ticket.id)
  }

  function closeTicket() {
    setSelectedTicket(null)
    setReplies([])
    setReplyBody('')
    setReplyError(null)
  }

  async function handleReplySubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!replyBody.trim() || !selectedTicket) return
    setReplySubmitting(true)
    const { error } = await supabase.from('ticket_replies').insert({
      ticket_id: selectedTicket.id,
      tenant_id: membership.tenant_id,
      sender_email: userEmail,
      sender_role: 'client',
      body: replyBody.trim(),
    })
    if (error) {
      setReplyError('Could not send — try again')
      setReplySubmitting(false)
    } else {
      setReplyBody('')
      setReplyError(null)
      setReplySubmitting(false)
      fetchReplies(selectedTicket.id)
    }
  }

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

  if (selectedTicket) {
    return (
      <div data-testid="tickets-detail-page" className="tickets-page">
        <div className="tickets-head">
          <div className="tickets-detail-nav">
            <button
              data-testid="tickets-back-btn"
              className="btn btn-ghost btn-sm tickets-back-btn"
              onClick={closeTicket}
            >
              ← Back
            </button>
          </div>
          <div>
            <h2 className="tickets-title">{selectedTicket.subject}</h2>
            <p className="tickets-sub">
              <span className={`tickets-status tickets-status--${selectedTicket.status}`}>
                {selectedTicket.status}
              </span>
            </p>
          </div>
        </div>

        <div data-testid="tickets-thread" className="tickets-thread">
          {/* Original ticket body */}
          <div
            data-testid="tickets-thread-original"
            className="tickets-thread-item tickets-thread-item--original"
          >
            <div className="thread-meta">
              <span className="thread-sender">{selectedTicket.submitted_by}</span>
              <span className="thread-date">{formatDate(selectedTicket.created_at)}</span>
            </div>
            <p className="thread-body">{selectedTicket.body}</p>
          </div>

          {/* Replies */}
          {repliesLoading ? (
            <p className="tickets-list-loading">Loading replies…</p>
          ) : (
            replies.map(reply => (
              <div
                key={reply.id}
                data-testid="tickets-thread-reply"
                className={`tickets-thread-item tickets-thread-item--${reply.sender_role}`}
              >
                <div className="thread-meta">
                  <span className="thread-sender">{reply.sender_email}</span>
                  <span className="thread-role">
                    {reply.sender_role === 'admin' ? 'Meridian' : 'Client'}
                  </span>
                  <span className="thread-date">{formatDate(reply.created_at)}</span>
                </div>
                <p className="thread-body">{reply.body}</p>
              </div>
            ))
          )}
        </div>

        {/* Reply form — hidden when ticket is closed */}
        {selectedTicket.status === 'open' && (
          <form
            data-testid="tickets-reply-form"
            className="tickets-reply-form"
            onSubmit={handleReplySubmit}
          >
            <textarea
              data-testid="tickets-reply-body"
              className="tickets-textarea"
              value={replyBody}
              onChange={e => setReplyBody(e.target.value)}
              disabled={replySubmitting}
              placeholder="Add a reply…"
              rows={4}
            />
            <div className="tickets-actions">
              <button
                data-testid="tickets-reply-submit-btn"
                className="btn btn-primary"
                type="submit"
                disabled={replySubmitting || !replyBody.trim()}
              >
                {replySubmitting ? 'Sending…' : 'Send reply'}
              </button>
              {replyError && (
                <span data-testid="tickets-reply-error" className="tickets-err">{replyError}</span>
              )}
            </div>
          </form>
        )}

        {selectedTicket.status === 'closed' && (
          <p data-testid="tickets-closed-note" className="tickets-closed-note">
            This ticket is closed. Contact Meridian to reopen it.
          </p>
        )}
      </div>
    )
  }

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
              role="button"
              tabIndex={0}
              onClick={() => openTicket(ticket)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') openTicket(ticket) }}
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
