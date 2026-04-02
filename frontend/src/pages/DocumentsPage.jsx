import React, { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useDropzone } from 'react-dropzone'
import api from '../utils/api.jsx'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext.jsx'
import './DocumentsPage.css'

const FILE_ICONS = {
  'application/pdf': '📕',
  'application/vnd.ms-excel': '📗',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📗',
  'application/msword': '📘',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📘',
  'text/csv': '📊',
}
const getIcon = (type) => FILE_ICONS[type] || (type?.startsWith('image/') ? '🖼️' : '📄')

const formatBytes = (b) => {
  if (!b) return '—'
  if (b < 1024) return b + ' B'
  if (b < 1048576) return (b/1024).toFixed(1) + ' KB'
  return (b/1048576).toFixed(1) + ' MB'
}

export default function DocumentsPage() {
  const qc = useQueryClient()
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [view, setView] = useState('grid')

  const { data, isLoading } = useQuery({
    queryKey: ['documents', search, typeFilter],
    queryFn: () => api.get(`/documents?search=${search}&type=${typeFilter}`).then(r => r.data)
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/documents/${id}`),
    onSuccess: () => { qc.invalidateQueries(['documents']); toast.success('Document deleted') },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed')
  })

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!acceptedFiles.length) return
    setUploading(true)
    setUploadProgress(0)
    for (const file of acceptedFiles) {
      const fd = new FormData()
      fd.append('file', file)
      try {
        await api.post('/documents/upload', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => setUploadProgress(Math.round((e.loaded * 100) / e.total))
        })
        toast.success(`${file.name} uploaded`)
      } catch (err) { toast.error(`Failed to upload ${file.name}`) }
    }
    qc.invalidateQueries(['documents'])
    setUploading(false)
    setUploadProgress(0)
  }, [qc])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/pdf': [], 'application/vnd.ms-excel': [], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [], 'application/msword': [], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [], 'text/csv': [], 'image/*': [] } })

  const docs = data?.documents || []

  return (
    <div className="documents-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">📂 Documents</h1>
          <p className="page-subtitle">{docs.length} file{docs.length !== 1 ? 's' : ''}</p>
        </div>
        <div style={{display:'flex',gap:'8px'}}>
          <button className={`btn btn-ghost btn-sm ${view==='grid'?'active-view':''}`} onClick={() => setView('grid')}>⊞ Grid</button>
          <button className={`btn btn-ghost btn-sm ${view==='list'?'active-view':''}`} onClick={() => setView('list')}>☰ List</button>
        </div>
      </div>

      {/* Upload Zone */}
      <div {...getRootProps()} className={`upload-zone ${isDragActive ? 'dragging' : ''}`}>
        <input {...getInputProps()} />
        {uploading ? (
          <div className="upload-progress">
            <div className="spinner"></div>
            <span>Uploading... {uploadProgress}%</span>
            <div className="progress-bar" style={{width:'200px',height:'4px'}}>
              <div className="progress-fill" style={{width:`${uploadProgress}%`,height:'4px',background:'var(--accent)'}}></div>
            </div>
          </div>
        ) : (
          <div className="upload-prompt">
            <div className="upload-icon">📂</div>
            <div className="upload-text">{isDragActive ? 'Drop files here' : 'Drag & drop files here, or click to browse'}</div>
            <div className="upload-hint">PDF, Excel, Word, CSV, Images — up to 20MB</div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="docs-toolbar">
        <div className="toolbar-search">
          <span>🔍</span>
          <input placeholder="Search documents..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="toolbar-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          <option value="pdf">PDF</option>
          <option value="spreadsheet">Excel / CSV</option>
          <option value="word">Word</option>
          <option value="image">Images</option>
        </select>
      </div>

      {/* Documents */}
      {isLoading ? <div className="page-loading"><div className="spinner"></div> Loading...</div> :
        docs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📂</div>
            <div className="empty-state-title">No documents yet</div>
            <div className="empty-state-desc">Upload your first file using the drop zone above</div>
          </div>
        ) : view === 'grid' ? (
          <div className="docs-grid">
            {docs.map(doc => (
              <div key={doc.id} className="doc-card card card-hover">
                <div className="doc-icon">{getIcon(doc.file_type)}</div>
                <div className="doc-name" title={doc.original_name}>{doc.original_name}</div>
                <div className="doc-meta">
                  <span>{formatBytes(doc.file_size)}</span>
                  <span>·</span>
                  <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                </div>
                <div className="doc-uploader">{doc.uploader_name}</div>
                {doc.project_name && <div className="doc-project tag">{doc.project_name}</div>}
                <div className="doc-actions">
                  <a href={`http://localhost:5000${doc.file_url}`} target="_blank" className="btn btn-secondary btn-sm">👁 View</a>
                  <a href={`http://localhost:5000${doc.file_url}`} download={doc.original_name} className="btn btn-ghost btn-sm">↓</a>
                  {(doc.uploaded_by === user.id || user.role === 'Admin') && (
                    <button className="btn btn-danger btn-sm" onClick={() => { if(window.confirm('Delete?')) deleteMutation.mutate(doc.id) }}>✕</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="docs-list card">
            <div className="docs-list-header">
              <span>Name</span><span>Type</span><span>Uploaded By</span><span>Project</span><span>Date</span><span>Size</span><span>Actions</span>
            </div>
            {docs.map(doc => (
              <div key={doc.id} className="docs-list-row">
                <span className="doc-list-name"><span className="doc-icon-sm">{getIcon(doc.file_type)}</span>{doc.original_name}</span>
                <span><span className="tag">{doc.file_type?.split('/')[1]?.toUpperCase() || 'FILE'}</span></span>
                <span>{doc.uploader_name}</span>
                <span>{doc.project_name || '—'}</span>
                <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                <span>{formatBytes(doc.file_size)}</span>
                <span style={{display:'flex',gap:'4px'}}>
                  <a href={`http://localhost:5000${doc.file_url}`} target="_blank" className="btn btn-ghost btn-sm">View</a>
                  <a href={`http://localhost:5000${doc.file_url}`} download={doc.original_name} className="btn btn-ghost btn-sm">↓</a>
                  {(doc.uploaded_by === user.id || user.role === 'Admin') && (
                    <button className="btn btn-danger btn-sm" onClick={() => deleteMutation.mutate(doc.id)}>✕</button>
                  )}
                </span>
              </div>
            ))}
          </div>
        )
      }
    </div>
  )
}
