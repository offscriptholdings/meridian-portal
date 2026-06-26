import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { type Membership } from '../../lib/auth'

interface DocsPageProps {
  membership: Membership
  userEmail: string
}

interface DocRow {
  id: string
  storage_path: string
  name: string
  uploaded_by: string
  size: number | null
  content_type: string | null
  created_at: string
}

const MAX_FILE_SIZE = 25 * 1024 * 1024
const ACCEPTED_TYPES = '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png'

type LoadState = 'loading' | 'error' | 'ready'

export default function DocsPage({ membership, userEmail }: DocsPageProps) {
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [docs, setDocs] = useState<DocRow[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadDocs = async () => {
    setLoadState('loading')
    const { data, error } = await supabase
      .from('documents')
      .select('id, storage_path, name, uploaded_by, size, content_type, created_at')
      .eq('tenant_id', membership.tenant_id)
      .order('created_at', { ascending: false })
    if (error) { setLoadState('error'); return }
    setDocs(data ?? [])
    setLoadState('ready')
  }

  useEffect(() => { loadDocs() }, []) // eslint-disable-line react-hooks/set-state-in-effect

  const handleUpload = async (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      setUploadError('File too large (max 25 MB)')
      return
    }
    setUploading(true)
    setUploadError(null)

    const fileId = crypto.randomUUID()
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const storagePath = `${membership.tenant_id}/${fileId}-${safeName}`

    const { error: uploadErr } = await supabase.storage
      .from('documents')
      .upload(storagePath, file, { contentType: file.type })

    if (uploadErr) {
      setUploading(false)
      setUploadError('Upload failed — try again')
      return
    }

    const { error: insertErr } = await supabase.from('documents').insert({
      tenant_id: membership.tenant_id,
      storage_path: storagePath,
      name: file.name,
      uploaded_by: userEmail,
      size: file.size,
      content_type: file.type || null,
    })

    if (insertErr) {
      // Metadata write failed — remove the orphaned storage object
      await supabase.storage.from('documents').remove([storagePath])
      setUploadError('Upload failed — could not save record')
    } else {
      await loadDocs()
    }
    setUploading(false)
  }

  const handleDownload = async (doc: DocRow) => {
    const { data, error } = await supabase.storage
      .from('documents')
      .createSignedUrl(doc.storage_path, 3600)
    if (error || !data?.signedUrl) return
    window.open(data.signedUrl, '_blank')
  }

  const fmtSize = (bytes: number | null) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  if (loadState === 'loading') return <div data-testid="docs-loading" className="empty-state">Loading documents…</div>
  if (loadState === 'error') return <div data-testid="docs-error" className="empty-state">Could not load documents.</div>

  return (
    <div data-testid="docs-page" className="docs-page">
      <div className="docs-head">
        <div>
          <h2 className="docs-title">Documents</h2>
          <p className="docs-sub">{membership.tenant_name}</p>
        </div>
        <div className="docs-actions">
          {uploadError && <span className="docs-err">{uploadError}</span>}
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES}
            className="docs-file-input"
            data-testid="docs-file-input"
            onChange={e => {
              const f = e.target.files?.[0]
              if (f) { handleUpload(f); e.target.value = '' }
            }}
          />
          <button
            className="btn btn-primary"
            data-testid="docs-upload-btn"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? 'Uploading…' : 'Upload file'}
          </button>
        </div>
      </div>

      {docs.length === 0 ? (
        <div data-testid="docs-empty" className="docs-empty">
          No documents yet. Upload your first file above.
        </div>
      ) : (
        <div data-testid="docs-list" className="docs-list">
          {docs.map(doc => (
            <div key={doc.id} className="docs-row" data-testid="docs-row">
              <div className="docs-icon" aria-hidden="true">
                <svg viewBox="0 0 20 20" fill="none">
                  <rect x="3" y="1" width="11" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M14 5l3 3v9a1.5 1.5 0 01-1.5 1.5H14" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M6 7h6M6 10h6M6 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="docs-meta">
                <div className="docs-name">{doc.name}</div>
                <div className="docs-info">
                  {doc.uploaded_by} · {fmtDate(doc.created_at)}{doc.size ? ` · ${fmtSize(doc.size)}` : ''}
                </div>
              </div>
              <button
                className="btn btn-sm docs-dl"
                onClick={() => handleDownload(doc)}
                aria-label={`Download ${doc.name}`}
                data-testid="docs-download-btn"
              >
                Download
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
