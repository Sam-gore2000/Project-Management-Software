import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../utils/api.jsx'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext.jsx'
import './ProjectsPage.css'

export default function ProjectsPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { isManager, isAdmin, user } = useAuth()
  const canCreateProject = isAdmin || isManager
  const [showModal, setShowModal] = useState(false)
  const [editProject, setEditProject] = useState(null)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({ queryKey: ['projects'], queryFn: () => api.get('/projects').then(r => r.data) })
  const { data: usersData } = useQuery({ queryKey: ['users'], queryFn: () => api.get('/auth/users').then(r => r.data), enabled: showModal })

  const projects = (data?.projects || []).filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase())
  )

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/projects/${id}`),
    onSuccess: () => { qc.invalidateQueries(['projects']); toast.success('Project deleted') },
    onError: (err) => toast.error(err.response?.data?.message || 'Delete failed')
  })

  if (isLoading) return <div className="page-loading"><div className="spinner"></div> Loading projects...</div>

  return (
    <div className="projects-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        {canCreateProject && (
          <button className="btn btn-primary" onClick={() => { setEditProject(null); setShowModal(true) }}>
            + Create Project
          </button>
        )}
      </div>

      <div className="projects-toolbar">
        <div className="toolbar-search">
          <span>🔍</span>
          <input placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">◫</div>
          <div className="empty-state-title">No projects found</div>
          <div className="empty-state-desc">
            {canCreateProject ? 'Create your first project to get started' : "You haven't been added to any projects yet. Contact your manager."}
          </div>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(p => (
            <ProjectCard key={p.id} project={p}
              onOpen={() => navigate(`/projects/${p.id}`)}
              onBoard={() => navigate(`/projects/${p.id}/board`)}
              onEdit={() => { setEditProject(p); setShowModal(true) }}
              onDelete={() => { if (window.confirm('Delete this project? All tasks and data will be lost.')) deleteMutation.mutate(p.id) }}
              canManage={canCreateProject}
            />
          ))}
        </div>
      )}

      {showModal && (
        <ProjectModal project={editProject} users={usersData?.users || []}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); qc.invalidateQueries(['projects']) }} />
      )}
    </div>
  )
}

function ProjectCard({ project, onOpen, onBoard, onEdit, onDelete, canManage }) {
  const pct = project.total_tasks > 0 ? Math.round((project.completed_tasks / project.total_tasks) * 100) : 0
  const statusColors = { Active: 'var(--success)', Completed: 'var(--accent)', 'On Hold': 'var(--warning)', Cancelled: 'var(--danger)' }
  return (
    <div className="project-card card" onClick={onOpen}>
      <div className="pc-top">
        <div className="pc-icon">{project.name[0].toUpperCase()}</div>
        {canManage && (
          <div className="pc-actions" onClick={e => e.stopPropagation()}>
            <button className="btn btn-ghost btn-icon" onClick={onEdit} title="Edit">✎</button>
            <button className="btn btn-ghost btn-icon" style={{color:'var(--danger)'}} onClick={onDelete} title="Delete">✕</button>
          </div>
        )}
      </div>
      <h3 className="pc-name">{project.name}</h3>
      <p className="pc-desc">{project.description || 'No description provided'}</p>
      <div className="pc-stats">
        <span>◻ {project.total_tasks || 0} tasks</span>
        <span>👥 {project.member_count || 0} members</span>
        <span className="pc-status" style={{color: statusColors[project.status]}}>{project.status}</span>
      </div>
      <div className="progress-bar pc-bar">
        <div className="progress-fill" style={{width:`${pct}%`, height:'3px', background: pct>=70?'var(--success)':pct>=40?'var(--accent)':'var(--warning)'}}></div>
      </div>
      <div className="pc-footer">
        <span className="pc-creator">by {project.creator_name}</span>
        <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); onBoard() }}>Open Board →</button>
      </div>
    </div>
  )
}

function ProjectModal({ project, users, onClose, onSaved }) {
  const [form, setForm] = useState({ name: project?.name||'', description: project?.description||'', status: project?.status||'Active', memberIds: [] })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Project name required'); return }
    setLoading(true)
    try {
      if (project) { await api.put(`/projects/${project.id}`, form); toast.success('Project updated') }
      else { await api.post('/projects', form); toast.success('Project created') }
      onSaved()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{project ? '✎ Edit Project' : '+ Create Project'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Project Name *</label>
            <input className="form-input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Website Redesign" required autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="What is this project about?" rows={3} />
          </div>
          {project && (
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-input" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                {['Active','Completed','On Hold','Cancelled'].map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
          )}
          {!project && users.length > 0 && (
            <div className="form-group">
              <label className="form-label">Add Team Members</label>
              <div className="members-checkboxes">
                {users.map(u => (
                  <label key={u.id} className="member-checkbox">
                    <input type="checkbox" checked={form.memberIds.includes(u.id)} onChange={e=>setForm({...form,memberIds:e.target.checked?[...form.memberIds,u.id]:form.memberIds.filter(id=>id!==u.id)})} />
                    <span>{u.name} <span style={{color:'var(--text-muted)',fontSize:'11px'}}>({u.role})</span></span>
                  </label>
                ))}
              </div>
            </div>
          )}
          <div style={{display:'flex',gap:'8px',justifyContent:'flex-end',marginTop:'12px'}}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading?<><span className="spinner"></span> Saving...</>:(project?'Update Project':'Create Project')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
