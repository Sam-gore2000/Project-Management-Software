import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors, useDroppable, useDraggable } from '@dnd-kit/core'
import api from '../utils/api.jsx'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext.jsx'
import './KanbanPage.css'

const COLUMNS = [
  { id: 'To Do',       label: 'TO DO',        color: '#8b949e', icon: '○' },
  { id: 'In Progress', label: 'IN PROGRESS',   color: '#1f6feb', icon: '◑' },
  { id: 'In Review',   label: 'IN REVIEW',     color: '#bc8cff', icon: '◐' },
  { id: 'Done',        label: 'DONE',           color: '#3fb950', icon: '●' },
]

export default function KanbanPage() {
  const { id: projectId } = useParams()
  const qc = useQueryClient()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [activeTask, setActiveTask] = useState(null)
  const [filterUser, setFilterUser] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [search, setSearch] = useState('')
  const [viewTask, setViewTask] = useState(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const { data: projectData } = useQuery({ queryKey: ['project', projectId], queryFn: () => api.get(`/projects/${projectId}`).then(r => r.data) })
  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => api.get(`/projects/${projectId}/tasks`).then(r => r.data),
    refetchInterval: 15000
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/projects/${projectId}/tasks/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries(['tasks', projectId]),
  })
  const deleteTask = useMutation({
    mutationFn: (id) => api.delete(`/projects/${projectId}/tasks/${id}`),
    onSuccess: () => { qc.invalidateQueries(['tasks', projectId]); toast.success('Task deleted') }
  })

  const tasks = tasksData?.tasks || []
  const members = projectData?.project?.members || []

  const filtered = tasks.filter(t => {
    if (filterUser && t.assigned_to !== parseInt(filterUser)) return false
    if (filterPriority && t.priority !== filterPriority) return false
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const getColTasks = (status) => filtered.filter(t => t.status === status)

  const handleDragStart = ({ active }) => setActiveTask(tasks.find(t => t.id === active.id))
  const handleDragEnd = ({ active, over }) => {
    setActiveTask(null)
    if (!over) return
    const task = tasks.find(t => t.id === active.id)
    const newStatus = over.id
    if (task && COLUMNS.find(c => c.id === newStatus) && task.status !== newStatus) {
      updateStatus.mutate({ id: task.id, status: newStatus })
    }
  }

  const project = projectData?.project

  return (
    <div className="kanban-page">
      <div className="kanban-header">
        <div className="breadcrumb">
          <Link to="/projects" className="breadcrumb-link">Projects</Link>
          <span>/</span>
          <Link to={`/projects/${projectId}`} className="breadcrumb-link">{project?.name}</Link>
          <span>/</span>
          <span>Board</span>
        </div>
        <div className="kanban-title-row">
          <h1 className="page-title">Board</h1>
          <div className="kanban-header-actions">
            <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/projects/${projectId}/chat`)}>💬 Chat</button>
            <button className="btn btn-primary" onClick={() => { setEditTask(null); setShowTaskModal(true) }}>+ Create Issue</button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="kanban-toolbar">
        <div className="toolbar-left">
          <div className="avatar-stack">
            {members.slice(0,6).map(m => (
              <button key={m.id}
                className={`avatar avatar-sm avatar-stack-item ${filterUser === String(m.id) ? 'active' : ''}`}
                title={m.name}
                onClick={() => setFilterUser(filterUser === String(m.id) ? '' : String(m.id))}>
                {m.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
              </button>
            ))}
          </div>
          <div className="toolbar-sep"></div>
          <select className="toolbar-select" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
            <option value="">All Priorities</option>
            <option>Low</option><option>Medium</option><option>High</option>
          </select>
          {(filterUser || filterPriority || search) && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setFilterUser(''); setFilterPriority(''); setSearch('') }}>✕ Clear</button>
          )}
        </div>
        <div className="toolbar-right">
          <div className="toolbar-search">
            <span>🔍</span>
            <input placeholder="Search issues..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      {isLoading ? <div className="page-loading"><div className="spinner"></div> Loading board...</div> : (
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="kanban-board">
            {COLUMNS.map(col => (
              <KanbanColumn key={col.id} column={col} tasks={getColTasks(col.id)}
                onEdit={t => { setEditTask(t); setShowTaskModal(true) }}
                onDelete={id => { if (window.confirm('Delete this task?')) deleteTask.mutate(id) }}
                onView={t => setViewTask(t)} />
            ))}
          </div>
          <DragOverlay>{activeTask && <TaskCardOverlay task={activeTask} />}</DragOverlay>
        </DndContext>
      )}

      {showTaskModal && (
        <TaskModal task={editTask} projectId={projectId} members={members}
          onClose={() => setShowTaskModal(false)}
          onSaved={() => { setShowTaskModal(false); qc.invalidateQueries(['tasks', projectId]) }} />
      )}
      {viewTask && (
        <TaskDetailModal task={viewTask} projectId={projectId}
          onClose={() => setViewTask(null)}
          onEdit={() => { setEditTask(viewTask); setViewTask(null); setShowTaskModal(true) }} />
      )}
    </div>
  )
}

function KanbanColumn({ column, tasks, onEdit, onDelete, onView }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })
  return (
    <div className={`kanban-column ${isOver ? 'column-over' : ''}`}>
      <div className="column-header">
        <span className="column-status-dot" style={{color: column.color}}>{column.icon}</span>
        <span className="column-title">{column.label}</span>
        <span className="column-count">{tasks.length}</span>
      </div>
      <div className="column-tasks" ref={setNodeRef}>
        {tasks.map(task => <DraggableCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} onView={onView} />)}
        {tasks.length === 0 && <div className="column-empty">Drop issues here</div>}
      </div>
    </div>
  )
}

function DraggableCard({ task, onEdit, onDelete, onView }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id })
  const style = transform ? { transform: `translate(${transform.x}px,${transform.y}px)` } : {}
  return (
    <div ref={setNodeRef} style={style} className={isDragging ? 'task-dragging' : ''}>
      <TaskCard task={task} onEdit={onEdit} onDelete={onDelete} onView={onView} dragProps={{...attributes,...listeners}} />
    </div>
  )
}

function TaskCardOverlay({ task }) {
  return <div className="task-card overlay"><TaskCardInner task={task} /></div>
}

function TaskCard({ task, onEdit, onDelete, onView, dragProps }) {
  return (
    <div className="task-card" onClick={() => onView(task)}>
      <div className="task-drag-handle" {...dragProps} onClick={e => e.stopPropagation()}>⠿</div>
      <TaskCardInner task={task} onEdit={onEdit} onDelete={onDelete} />
    </div>
  )
}

function TaskCardInner({ task, onEdit, onDelete }) {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'Done'
  return (
    <div className="task-card-body">
      <p className="task-title">{task.title}</p>
      <div className="task-meta">
        <div className="task-meta-left">
          <span className={`badge badge-${task.priority.toLowerCase()}`}>{task.priority}</span>
          <span className="task-id">PF-{task.id}</span>
          {task.comment_count > 0 && <span className="task-comments-count">💬 {task.comment_count}</span>}
        </div>
        <div className="task-meta-right">
          {isOverdue && <span className="task-overdue" title="Overdue">⚠</span>}
          {onEdit && (
            <div className="task-actions" onClick={e => e.stopPropagation()}>
              <button className="btn btn-ghost btn-icon task-action-btn" onClick={() => onEdit(task)} title="Edit">✎</button>
              <button className="btn btn-ghost btn-icon task-action-btn" style={{color:'var(--danger)'}} onClick={() => onDelete(task.id)} title="Delete">✕</button>
            </div>
          )}
          {task.assigned_user_name && (
            <div className="avatar avatar-xs task-avatar" title={task.assigned_user_name}>
              {task.assigned_user_name.split(' ').map(n=>n[0]).join('').slice(0,2)}
            </div>
          )}
        </div>
      </div>
      {task.due_date && (
        <div className={`task-due-date ${isOverdue ? 'overdue' : ''}`}>
          📅 {new Date(task.due_date).toLocaleDateString('en',{month:'short',day:'numeric'})}
        </div>
      )}
    </div>
  )
}

function TaskDetailModal({ task, projectId, onClose, onEdit }) {
  const { data } = useQuery({
    queryKey: ['task', task.id],
    queryFn: () => api.get(`/projects/${projectId}/tasks/${task.id}`).then(r => r.data)
  })
  const fullTask = data?.task || task
  const [comment, setComment] = useState('')
  const qc = useQueryClient()
  const { user } = useAuth()

  const addComment = async () => {
    if (!comment.trim()) return
    try {
      await api.post(`/projects/${projectId}/tasks/${task.id}/comments`, { comment })
      setComment('')
      qc.invalidateQueries(['task', task.id])
      qc.invalidateQueries(['tasks', projectId])
    } catch { toast.error('Failed to add comment') }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg task-detail-modal">
        <div className="modal-header">
          <div className="task-detail-id">PF-{fullTask.id}</div>
          <div style={{display:'flex',gap:'8px'}}>
            <button className="btn btn-secondary btn-sm" onClick={onEdit}>✎ Edit</button>
            <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
          </div>
        </div>
        <div className="task-detail-body">
          <div className="task-detail-main">
            <h2 className="task-detail-title">{fullTask.title}</h2>
            {fullTask.description && <p className="task-detail-desc">{fullTask.description}</p>}
            <div className="task-detail-section">
              <div className="section-title">💬 Activity</div>
              <div className="comments-list">
                {fullTask.comments?.length === 0 && <div style={{color:'var(--text-muted)',fontSize:'13px',padding:'8px 0'}}>No comments yet. Be the first to comment!</div>}
                {fullTask.comments?.map(c => (
                  <div key={c.id} className="comment-item">
                    <div className="avatar avatar-xs">{c.user_name?.split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
                    <div className="comment-content">
                      <div className="comment-header">
                        <span className="comment-author">{c.user_name}</span>
                        <span className="comment-time">{new Date(c.created_at).toLocaleString()}</span>
                      </div>
                      <div className="comment-text">{c.comment}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="comment-input-row">
                <div className="avatar avatar-xs">{user?.name?.split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
                <div className="comment-input-wrapper">
                  <input className="form-input" placeholder="Add a comment..." value={comment}
                    onChange={e => setComment(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addComment()} />
                  <button className="btn btn-primary btn-sm" onClick={addComment}>Save</button>
                </div>
              </div>
            </div>
          </div>
          <div className="task-detail-sidebar">
            {[
              ['Status', <span className={`badge badge-${fullTask.status?.toLowerCase().replace(' ','')}`}>{fullTask.status}</span>],
              ['Priority', <span className={`badge badge-${fullTask.priority?.toLowerCase()}`}>{fullTask.priority}</span>],
              ['Assignee', fullTask.assigned_user_name || 'Unassigned'],
              ['Due Date', fullTask.due_date ? new Date(fullTask.due_date).toLocaleDateString() : '—'],
              ['Created by', fullTask.creator_name || '—'],
            ].map(([k, v]) => (
              <div key={k} className="detail-field">
                <div className="detail-field-label">{k}</div>
                <div className="detail-field-value">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function TaskModal({ task, projectId, members, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    assignedTo: task?.assigned_to || '',
    status: task?.status || 'To Do',
    priority: task?.priority || 'Medium',
    dueDate: task?.due_date ? task.due_date.split('T')[0] : '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) { toast.error('Title required'); return }
    setLoading(true)
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description || null,
        assignedTo: form.assignedTo || null,
        status: form.status,
        priority: form.priority,
        dueDate: form.dueDate || null,
      }
      if (task) {
        await api.put(`/projects/${projectId}/tasks/${task.id}`, payload)
        toast.success('Issue updated')
      } else {
        await api.post(`/projects/${projectId}/tasks`, payload)
        toast.success('Issue created')
      }
      onSaved()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save') }
    finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{task ? '✎ Edit Issue' : '+ Create Issue'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Summary *</label>
            <input className="form-input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="What needs to be done?" required autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Add more details..." rows={3} />
          </div>
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Assignee</label>
              <select className="form-input" value={form.assignedTo} onChange={e => setForm({...form, assignedTo: e.target.value})}>
                <option value="">Unassigned</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-input" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                {['To Do','In Progress','In Review','Done'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-input" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                {['Low','Medium','High'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input type="date" className="form-input" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} />
            </div>
          </div>
          <div style={{display:'flex',gap:'8px',justifyContent:'flex-end',marginTop:'8px'}}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner"></span> Saving...</> : (task ? 'Update Issue' : 'Create Issue')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
