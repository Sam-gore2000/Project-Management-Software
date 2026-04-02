import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../utils/api.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import toast from 'react-hot-toast'
import './ChatPage.css'

const API_BASE = 'http://localhost:5000'
const POLL_INTERVAL = 4000

const FILE_ICONS = { 'application/pdf': '📕', 'application/vnd.ms-excel': '📗', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📗', 'application/msword': '📘', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📘' }
const getFileIcon = (type) => FILE_ICONS[type] || (type?.startsWith('image/') ? '🖼' : '📄')
const formatBytes = (b) => { if (!b) return ''; if (b < 1024) return b+'B'; if (b < 1048576) return (b/1024).toFixed(1)+'KB'; return (b/1048576).toFixed(1)+'MB' }

export default function ChatPage() {
  const { id: projectId } = useParams()
  const { user } = useAuth()
  const messagesEndRef = useRef(null)
  const pollRef = useRef(null)
  const lastMsgTimeRef = useRef(null)
  const fileInputRef = useRef(null)
  const docInputRef = useRef(null)

  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [replyTo, setReplyTo] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewFile, setPreviewFile] = useState(null)
  const [activeTab, setActiveTab] = useState('chat') // 'chat' | 'docs'
  const [uploadingDoc, setUploadingDoc] = useState(false)

  const { data: projectData } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => api.get(`/projects/${projectId}`).then(r => r.data),
  })

  // Project documents (only for this project's members)
  const { data: docsData, refetch: refetchDocs } = useQuery({
    queryKey: ['projectDocs', projectId],
    queryFn: () => api.get(`/documents?project_id=${projectId}`).then(r => r.data),
    enabled: activeTab === 'docs',
  })

  const loadMessages = useCallback(async () => {
    try {
      const { data } = await api.get(`/projects/${projectId}/chat?limit=100`)
      setMessages(data.messages || [])
      if (data.messages?.length) lastMsgTimeRef.current = data.messages[data.messages.length - 1].created_at
    } catch { toast.error('Failed to load messages') }
  }, [projectId])

  const pollMessages = useCallback(async () => {
    if (!lastMsgTimeRef.current) return
    try {
      const { data } = await api.get(`/projects/${projectId}/chat/poll?since=${encodeURIComponent(lastMsgTimeRef.current)}`)
      if (data.messages?.length) {
        setMessages(prev => {
          const ids = new Set(prev.map(m => m.id))
          const newMsgs = data.messages.filter(m => !ids.has(m.id))
          if (!newMsgs.length) return prev
          lastMsgTimeRef.current = data.messages[data.messages.length - 1].created_at
          return [...prev, ...newMsgs]
        })
      }
    } catch {}
  }, [projectId])

  useEffect(() => { loadMessages(); return () => clearInterval(pollRef.current) }, [loadMessages])
  useEffect(() => {
    clearInterval(pollRef.current)
    pollRef.current = setInterval(pollMessages, POLL_INTERVAL)
    return () => clearInterval(pollRef.current)
  }, [pollMessages])
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!text.trim() && !selectedFile) return
    setSending(true)
    try {
      const fd = new FormData()
      if (text.trim()) fd.append('message', text.trim())
      if (selectedFile) fd.append('file', selectedFile)
      if (replyTo) fd.append('parentMessageId', replyTo.id)
      const { data } = await api.post(`/projects/${projectId}/chat`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setMessages(prev => { const exists = prev.find(m => m.id === data.message.id); return exists ? prev : [...prev, data.message] })
      lastMsgTimeRef.current = data.message.created_at
      setText(''); setSelectedFile(null); setReplyTo(null)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to send') }
    finally { setSending(false) }
  }

  const deleteMessage = async (msgId) => {
    try {
      await api.delete(`/projects/${projectId}/chat/${msgId}`)
      setMessages(prev => prev.filter(m => m.id !== msgId))
    } catch { toast.error('Failed to delete') }
  }

  const uploadDocument = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingDoc(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('project_id', projectId)
      await api.post('/documents/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success(`${file.name} uploaded`)
      refetchDocs()
    } catch { toast.error('Upload failed') }
    finally { setUploadingDoc(false); e.target.value = '' }
  }

  const deleteDocument = async (docId) => {
    try {
      await api.delete(`/documents/${docId}`)
      toast.success('Document deleted')
      refetchDocs()
    } catch { toast.error('Failed to delete') }
  }

  const project = projectData?.project
  const docs = docsData?.documents || []
  const grouped = groupByDate(messages)

  return (
    <div className="chat-page">
      <div className="chat-header">
        <div className="breadcrumb">
          <Link to="/projects" className="breadcrumb-link">Projects</Link>
          <span>/</span>
          <Link to={`/projects/${projectId}`} className="breadcrumb-link">{project?.name}</Link>
          <span>/</span>
          <span>Chat</span>
        </div>
        <div className="chat-header-row">
          <h2 className="chat-title">💬 {project?.name} — General</h2>
          <span className="chat-members-count">👥 {project?.members?.length || 0} members</span>
        </div>

        {/* Tabs */}
        <div className="chat-tabs">
          <button className={`chat-tab ${activeTab==='chat'?'active':''}`} onClick={() => setActiveTab('chat')}>
            💬 Messages ({messages.length})
          </button>
          <button className={`chat-tab ${activeTab==='docs'?'active':''}`} onClick={() => setActiveTab('docs')}>
            📂 Documents ({docs.length || 0})
          </button>
        </div>
      </div>

      {/* CHAT TAB */}
      {activeTab === 'chat' && (
        <div className="chat-layout">
          <div className="chat-messages-area">
            {messages.length === 0 && (
              <div className="chat-empty">
                <div className="chat-empty-icon">💬</div>
                <div className="chat-empty-title">Start the conversation</div>
                <div className="chat-empty-desc">Say hello to your team!</div>
              </div>
            )}
            {grouped.map(({ date, msgs }) => (
              <div key={date}>
                <div className="chat-date-divider"><span>{date}</span></div>
                {msgs.map((msg, i) => {
                  const isMine = msg.user_id === user.id
                  const showAvatar = i === 0 || msgs[i-1]?.user_id !== msg.user_id
                  return (
                    <MessageBubble key={msg.id} msg={msg} isMine={isMine} showAvatar={showAvatar}
                      onReply={() => setReplyTo(msg)}
                      onDelete={() => deleteMessage(msg.id)}
                      onPreview={() => setPreviewFile(msg)}
                      currentUserId={user.id} />
                  )
                })}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            {replyTo && (
              <div className="reply-preview">
                <div className="reply-bar"></div>
                <div className="reply-content">
                  <span className="reply-name">{replyTo.sender_name}</span>
                  <span className="reply-text">{replyTo.message || '📎 File'}</span>
                </div>
                <button className="btn btn-ghost btn-icon" onClick={() => setReplyTo(null)}>✕</button>
              </div>
            )}
            {selectedFile && (
              <div className="file-preview-bar">
                <span>{getFileIcon(selectedFile.type)}</span>
                <span className="file-preview-name">{selectedFile.name}</span>
                <span className="file-preview-size">({formatBytes(selectedFile.size)})</span>
                <button className="btn btn-ghost btn-icon" onClick={() => setSelectedFile(null)}>✕</button>
              </div>
            )}
            <form onSubmit={sendMessage} className="chat-input-form">
              <button type="button" className="btn btn-ghost attach-btn" title="Attach file" onClick={() => fileInputRef.current?.click()}>📎</button>
              <input ref={fileInputRef} type="file" hidden onChange={e => { if (e.target.files[0]) setSelectedFile(e.target.files[0]); e.target.value='' }} accept="image/*,.pdf,.xlsx,.xls,.doc,.docx,.txt,.zip" />
              <input className="chat-input" value={text} onChange={e => setText(e.target.value)}
                placeholder={`Message ${project?.name || ''}...`}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(e) } }} autoFocus />
              <button type="submit" className="btn btn-primary send-btn" disabled={sending || (!text.trim() && !selectedFile)}>
                {sending ? <span className="spinner"></span> : '➤'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DOCUMENTS TAB */}
      {activeTab === 'docs' && (
        <div className="chat-docs-panel">
          <div className="docs-panel-header">
            <p className="docs-panel-desc">Documents shared in <strong>{project?.name}</strong>. Only project members can see these.</p>
            <div>
              <input ref={docInputRef} type="file" hidden onChange={uploadDocument} accept=".pdf,.xlsx,.xls,.doc,.docx,.csv,.txt,.png,.jpg,.jpeg" />
              <button className="btn btn-primary" onClick={() => docInputRef.current?.click()} disabled={uploadingDoc}>
                {uploadingDoc ? <><span className="spinner"></span> Uploading...</> : '+ Upload Document'}
              </button>
            </div>
          </div>

          {docs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📂</div>
              <div className="empty-state-title">No documents yet</div>
              <div className="empty-state-desc">Upload files to share with your project team</div>
            </div>
          ) : (
            <div className="docs-grid">
              {docs.map(doc => (
                <div key={doc.id} className="doc-card card">
                  <div className="doc-icon">{getFileIcon(doc.file_type)}</div>
                  <div className="doc-name" title={doc.original_name}>{doc.original_name}</div>
                  <div className="doc-meta">
                    <span>{formatBytes(doc.file_size)}</span>
                    <span>·</span>
                    <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="doc-uploader">by {doc.uploader_name}</div>
                  <div className="doc-actions">
                    <a href={`${API_BASE}${doc.file_url}`} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">👁 View</a>
                    <a href={`${API_BASE}${doc.file_url}`} download={doc.original_name} className="btn btn-ghost btn-sm">↓</a>
                    {(doc.uploaded_by === user.id || user.role === 'Admin') && (
                      <button className="btn btn-danger btn-sm" onClick={() => { if (window.confirm('Delete?')) deleteDocument(doc.id) }}>✕</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {previewFile && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setPreviewFile(null)}>
          <div className="file-preview-modal">
            <div className="modal-header">
              <span>{previewFile.file_name}</span>
              <button className="btn btn-ghost btn-icon" onClick={() => setPreviewFile(null)}>✕</button>
            </div>
            {previewFile.file_type?.startsWith('image/') ? (
              <img src={`${API_BASE}${previewFile.file_url}`} alt={previewFile.file_name} style={{maxWidth:'100%',borderRadius:'8px'}} />
            ) : (
              <div style={{padding:'20px',textAlign:'center'}}>
                <div style={{fontSize:'48px',marginBottom:'12px'}}>{getFileIcon(previewFile.file_type)}</div>
                <p style={{marginBottom:'12px',color:'var(--text-secondary)'}}>{previewFile.file_name}</p>
                <a href={`${API_BASE}${previewFile.file_url}`} download={previewFile.file_name} className="btn btn-primary">↓ Download</a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function MessageBubble({ msg, isMine, showAvatar, onReply, onDelete, onPreview, currentUserId }) {
  const [hovered, setHovered] = useState(false)
  const initials = msg.sender_name?.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()
  const isImage = msg.file_type?.startsWith('image/')

  return (
    <div className={`message-row ${isMine ? 'mine' : 'theirs'}`}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      {!isMine && <div className={`avatar avatar-sm msg-avatar ${!showAvatar ? 'invisible' : ''}`}>{initials}</div>}
      <div className="message-wrapper">
        {showAvatar && !isMine && <span className="message-sender-name">{msg.sender_name}</span>}
        {msg.parent_message_id && msg.parent_message && (
          <div className="message-reply-quote">
            <span className="reply-quote-name">{msg.parent_sender_name}</span>
            <span className="reply-quote-text">{msg.parent_message || '📎 File'}</span>
          </div>
        )}
        <div className={`message-bubble ${isMine ? 'bubble-mine' : 'bubble-theirs'}`}>
          {msg.file_url && (
            <div className="message-file" onClick={onPreview} style={{cursor:'pointer'}}>
              {isImage ? (
                <img src={`${API_BASE}${msg.file_url}`} alt={msg.file_name} className="message-image" />
              ) : (
                <div className="message-file-attachment">
                  <span className="file-icon">{getFileIcon(msg.file_type)}</span>
                  <div className="file-info">
                    <span className="file-name">{msg.file_name}</span>
                    <a href={`${API_BASE}${msg.file_url}`} download={msg.file_name} className="file-download" onClick={e => e.stopPropagation()}>↓ Download</a>
                  </div>
                </div>
              )}
            </div>
          )}
          {msg.message && <p className="message-text">{msg.message}</p>}
          <span className="message-time">{formatTime(msg.created_at)}</span>
        </div>
        {hovered && (
          <div className={`message-actions ${isMine ? 'actions-left' : 'actions-right'}`}>
            <button className="msg-action-btn" onClick={onReply} title="Reply">↩</button>
            {msg.user_id === currentUserId && (
              <button className="msg-action-btn danger" onClick={onDelete} title="Delete">✕</button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function groupByDate(messages) {
  const groups = {}
  messages.forEach(m => {
    const d = new Date(m.created_at)
    const today = new Date(); const yesterday = new Date(today); yesterday.setDate(yesterday.getDate()-1)
    let label = d.toDateString() === today.toDateString() ? 'Today' : d.toDateString() === yesterday.toDateString() ? 'Yesterday' : d.toLocaleDateString('en',{weekday:'long',month:'long',day:'numeric'})
    if (!groups[label]) groups[label] = []
    groups[label].push(m)
  })
  return Object.entries(groups).map(([date, msgs]) => ({ date, msgs }))
}

const formatTime = (ts) => new Date(ts).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })
