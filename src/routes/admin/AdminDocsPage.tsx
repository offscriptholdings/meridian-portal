import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'

interface AdminDocsPageProps {
  userEmail: string
}

interface Tenant {
  id: string
  name: string
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

export default function AdminDocsPage({ userEmail }: AdminDocsPageProps) {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [selectedTenantId, setSelectedTenantId] = useState<string>('')
  const [docs, setDocs] = useState<DocRow[]>([])
  const [docsLoading, setDocsLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    supabase.from('tenants').select('id, name').order('name').then(({ data }) => {
      const list = data ?? []
      setTenants(list)
      if (list.length > 0) setSelectedTenantId(list[0].id)
    })
  }, [])

  useEffect(() => {
    if (!selectedTenantId) return
    setDocsLoading(true) // eslint-disable-line react-hooks/set-state-in-effect
    supabase
      .from('documents')
      .select('id, storage_path, name, uploaded_by, size, content_type, created_at')
      .eq('tenant_id', selectedTenantId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setDocs(data ?? [])
        setDocsLoading(false)
      })
  }, [selectedTenantId])

  const handleUpload = async (file: File) => {
    if (!selectedTenantId) return
    if (file.size > MAX_FILE_SIZE) { setUploadError('File too large (max 25 MB)'); return }
    setUploading(true)
    setUploadError(null)

    const fileId = crypto.randomUUID()
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const storagePath = `${selectedTenantId}/${fileId}-${safeName}`

    const { error: uploadErr } = await supabase.storage
      .from('documents')
      .upload(storagePath, file, { contentType: file.type })
    if (uploadErr) { setUploading(false); setUploadError('Upload failed'); return }

    const { error: insertErr } = await supabase.from('documents').insert({
      tenant_id: selectedTenantId,
      storage_path: storagePath,
      name: file.name,
      uploaded_by: userEmail,
      size: file.size,
      content_type: file.type || null,
    })

    if (insertErr) {
      await supabase.storage.from('documents').remove([storagePath])
      setUploadError('Upload failed — metadata error')
    } else {
      const { data } = await supabase
        .from('documents')
        .select('id, storage_path, name, uploaded_by, size, content_type, created_at')
        .eq('tenant_id', selectedTenantId)
        .order('created_at', { ascending: false })
      setDocs(data ?? [])
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

  const selectedTenant = tenants.find(t => t.id === selectedTenantId)

  return (
    <div data-testid="admin-docs-page" className="docs-page">
      {/* Tenant selector */}
      <div className="docs-tenant-bar">
        <label className="docs-tenant-label" htmlFor="admin-tenant-select">Tenant</label>
        <select
          id="admin-tenant-select"
          className="docs-tenant-select"
          data-testid="admin-tenant-select"
          value={selectedTenantId}
          onChange={e => setSelectedTenantId(e.target.value)}
        >
          {tenants.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      {/* Upload bar */}
      <div className="docs-head">
        <div>
          <h2 className="docs-title">Documents</h2>
          {selectedTenant && <p className="docs-sub">{selectedTenant.name}</p>}
        </div>
        <div className="docs-actions">
          {uploadError && <span className="docs-err">{uploadError}</span>}
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES}
            className="docs-file-input"
            onChange={e => {
              const f = e.target.files?.[0]
              if (f) { handleUpload(f); e.target.value = '' }
            }}
          />
          <button
            className="btn btn-primary"
            data-testid="admin-docs-upload-btn"
            disabled={uploading || !selectedTenantId}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? 'Uploading…' : 'Upload file'}
          </button>
        </div>
      </div>

      {/* Docs list */}
      {docsLoading ? (
        <div className="empty-state">Loading…</div>
      ) : docs.length === 0 ? (
        <div data-testid="admin-docs-empty-list" className="docs-empty">
          No documents for this tenant yet.
        </div>
      ) : (
        <div data-testid="admin-docs-list" className="docs-list">
          {docs.map(doc => (
            <div key={doc.id} className="docs-row">
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
