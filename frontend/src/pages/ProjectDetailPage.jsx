import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../utils/api.jsx'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext.jsx'
import './ProjectDetailPage.css'

export default function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { isManager, isAdmin, user } = useAuth()
  const [addMemberModal, setAddMemberModal] = useState(false)
  const [sprintModal, setSprintModal] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const { data, isLoading } = useQuery({ queryKey: ['project', id], queryFn: () => api.get(`/projects/${id}`).then(r => r.data) })
  const { data: sprintsData } = useQuery({ queryKey: ['sprints', id], queryFn: () => api.get(`/projects/${id}/sprints`).then(r => r.data) })
  const { data: allUsersData } = useQuery({ queryKey: ['users'], queryFn: () => api.get('/auth/users').then(r => r.data), enabled: addMemberModal })

  const project = data?.project
  const members = project?.members || []
  const sprints = sprintsData?.sprints || []
  const nonMembers = allUsersData?.users?.filter(u => !members.find(m => m.id === u.id)) || []

  const removeMember = useMutation({
    mutationFn: (uid) => api.delete(`/projects/${id}/members/${uid}`),
    onSuccess: () => { qc.invalidateQueries(['project', id]); toast.success('Member removed') }
  })
  const addMember = useMutation({
    mutationFn: (uid) => api.post(`/projects/${id}/members`, { userId: uid }),
    onSuccess: () => { qc.invalidateQueries(['project', id]); toast.success('Member added'); setAddMemberModal(false) }
  })

  if (isLoading) return <div className="page-loading"><div className="spinner"></div> Loading...</div>
  if (!project) return <div className="page-loading">Project not found</div>

  const pct = project.total_tasks > 0 ? Math.round((project.completed_tasks / project.total_tasks) * 100) : 0

  return (
    <div className="project-detail">
      <div className="breadcrumb">
        <Link to="/projects" className="breadcrumb-link">Projects</Link>
        <span>/</span>
        <span>{project.name}</span>
      </div>

      {/* Project Hero */}
      <div className="project-hero card">
        <div className="project-hero-left">
          <div className="project-hero-icon">{project.name[0]}</div>
          <div>
            <h1 className="project-hero-name">{project.name}</h1>
            <p className="project-hero-desc">{project.description || 'No description'}</p>
            <div style={{display:'flex',gap:'8px',marginTop:'8px',flexWrap:'wrap'}}>
              <span className="tag">by {project.creator_name}</span>
              <span className={`badge badge-${project.status==='Active'?'inprogress':project.status==='Completed'?'done':'todo'}`}>{project.status}</span>
            </div>
          </div>
        </div>
        <div className="project-hero-stats">
          {[['Total', project.total_tasks||0,'var(--text-secondary)'],['In Progress', project.in_progress_tasks||0,'var(--accent)'],['Done',project.completed_tasks||0,'var(--success)'],['Progress',`${pct}%`,'var(--purple)']].map(([l,v,c])=>(
            <div key={l} className="hero-stat"><div className="hero-stat-val" style={{color:c}}>{v}</div><div className="hero-stat-lbl">{l}</div></div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="project-quick-actions">
        <button className="btn btn-primary" onClick={() => navigate(`/projects/${id}/board`)}>◫ Kanban Board</button>
        <button className="btn btn-secondary" onClick={() => navigate(`/projects/${id}/chat`)}>💬 Chat</button>
        <button className="btn btn-secondary" onClick={() => navigate(`/documents`)}>📂 Documents</button>
        {isManager && <button className="btn btn-secondary" onClick={() => setSprintModal(true)}>+ New Sprint</button>}
      </div>

      {/* Tabs */}
      <div className="project-tabs">
        {['overview','members','sprints'].map(t => (
          <button key={t} className={`tab-btn ${activeTab===t?'active':''}`} onClick={() => setActiveTab(t)}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="project-detail-grid">
          <div className="card">
            <h3 className="section-title">Progress Overview</h3>
            <div style={{marginBottom:'16px'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:'6px'}}>
                <span style={{fontSize:'13px',color:'var(--text-secondary)'}}>Overall Completion</span>
                <span style={{fontSize:'13px',fontWeight:'700',color:'var(--accent)'}}>{pct}%</span>
              </div>
              <div className="progress-bar" style={{height:'8px'}}>
                <div className="progress-fill" style={{width:`${pct}%`,height:'8px',background:'linear-gradient(90deg,var(--accent),var(--success))'}}></div>
              </div>
            </div>
            {[{l:'To Do',v:project.todo_tasks||0,c:'var(--todo-color)'},{l:'In Progress',v:project.in_progress_tasks||0,c:'var(--inprogress-color)'},{l:'In Review',v:project.inreview_tasks||0,c:'var(--inreview-color)'},{l:'Done',v:project.completed_tasks||0,c:'var(--done-color)'}].map(s=>(
              <div key={s.l} className="breakdown-row">
                <div className="breakdown-dot" style={{background:s.c}}></div>
                <span className="breakdown-label">{s.l}</span>
                <span className="breakdown-value" style={{color:s.c}}>{s.v}</span>
              </div>
            ))}
          </div>
          <div className="card">
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:'12px'}}>
              <h3 className="section-title">Team ({members.length})</h3>
              {isManager && <button className="btn btn-secondary btn-sm" onClick={() => setAddMemberModal(true)}>+ Add Member</button>}
            </div>
            {members.map(m => (
              <div key={m.id} className="member-row">
                <div className="avatar avatar-sm">{m.name.split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
                <div className="member-info"><div className="member-name">{m.name}</div><div className="member-meta">{m.role} · {m.project_role}</div></div>
                {isAdmin && m.project_role !== 'Owner' && (
                  <button className="btn btn-ghost btn-icon" style={{color:'var(--danger)'}} onClick={() => removeMember.mutate(m.id)}>✕</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'members' && (
        <div className="card">
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:'14px'}}>
            <h3 className="section-title">Team Members</h3>
            {isManager && <button className="btn btn-primary btn-sm" onClick={() => setAddMemberModal(true)}>+ Add Member</button>}
          </div>
          <div className="members-table">
            {members.map(m => (
              <div key={m.id} className="member-table-row">
                <div className="avatar avatar-md">{m.name.split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
                <div className="member-info"><div className="member-name">{m.name}</div><div className="member-meta">{m.email}</div></div>
                <span className="tag">{m.role}</span>
                <span className={`badge ${m.project_role==='Owner'?'badge-done':'badge-todo'}`}>{m.project_role}</span>
                {isAdmin && m.project_role !== 'Owner' && (
                  <button className="btn btn-danger btn-sm" onClick={() => removeMember.mutate(m.id)}>Remove</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'sprints' && (
        <div>
          {sprints.length === 0 ? (
            <div className="card empty-state">
              <div className="empty-state-icon">🏃</div>
              <div className="empty-state-title">No sprints yet</div>
              <div className="empty-state-desc">Create a sprint to organize your work</div>
              {isManager && <button className="btn btn-primary" style={{marginTop:'10px'}} onClick={() => setSprintModal(true)}>+ Create Sprint</button>}
            </div>
          ) : sprints.map(s => (
            <div key={s.id} className="card sprint-card">
              <div className="sprint-header">
                <div>
                  <h4 className="sprint-name">{s.name}</h4>
                  {s.goal && <p className="sprint-goal">{s.goal}</p>}
                </div>
                <span className={`badge badge-${s.status==='Active'?'inprogress':s.status==='Completed'?'done':'todo'}`}>{s.status}</span>
              </div>
              <div className="sprint-meta">
                {s.start_date && <span>📅 {new Date(s.start_date).toLocaleDateString()} → {s.end_date ? new Date(s.end_date).toLocaleDateString() : '—'}</span>}
                <span>◻ {s.task_count||0} tasks</span>
                <span>✓ {s.completed_tasks||0} done</span>
              </div>
              <div className="progress-bar" style={{height:'4px',marginTop:'8px'}}>
                <div className="progress-fill" style={{width:`${s.task_count>0?Math.round((s.completed_tasks/s.task_count)*100):0}%`,height:'4px',background:'var(--success)'}}></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Member Modal */}
      {addMemberModal && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setAddMemberModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Add Member</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setAddMemberModal(false)}>✕</button>
            </div>
            {nonMembers.length === 0 ? <div className="empty-state"><div className="empty-state-title">All users already added</div></div>
            : nonMembers.map(u => (
              <div key={u.id} className="member-row" style={{marginBottom:'6px'}}>
                <div className="avatar avatar-sm">{u.name.split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
                <div className="member-info"><div className="member-name">{u.name}</div><div className="member-meta">{u.email} · {u.role}</div></div>
                <button className="btn btn-primary btn-sm" onClick={() => addMember.mutate(u.id)}>Add</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sprint Modal */}
      {sprintModal && <SprintModal projectId={id} onClose={() => setSprintModal(false)} onSaved={() => { setSprintModal(false); qc.invalidateQueries(['sprints',id]) }} />}
    </div>
  )
}

function SprintModal({ projectId, onClose, onSaved }) {
  const [form, setForm] = useState({ name: '', goal: '', start_date: '', end_date: '' })
  const [loading, setLoading] = useState(false)
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Sprint name required'); return }
    setLoading(true)
    try {
      await api.post(`/projects/${projectId}/sprints`, form)
      toast.success('Sprint created')
      onSaved()
    } catch (err) { toast.error('Failed') }
    finally { setLoading(false) }
  }
  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Create Sprint</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label className="form-label">Sprint Name *</label><input className="form-input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Sprint 1" required /></div>
          <div className="form-group"><label className="form-label">Goal</label><textarea className="form-input" value={form.goal} onChange={e=>setForm({...form,goal:e.target.value})} placeholder="What will this sprint achieve?" /></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
            <div className="form-group"><label className="form-label">Start Date</label><input type="date" className="form-input" value={form.start_date} onChange={e=>setForm({...form,start_date:e.target.value})} /></div>
            <div className="form-group"><label className="form-label">End Date</label><input type="date" className="form-input" value={form.end_date} onChange={e=>setForm({...form,end_date:e.target.value})} /></div>
          </div>
          <div style={{display:'flex',gap:'8px',justifyContent:'flex-end',marginTop:'8px'}}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading?<><span className="spinner"></span> Creating...</>:'Create Sprint'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
