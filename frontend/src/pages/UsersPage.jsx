import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../utils/api.jsx'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext.jsx'
import './UsersPage.css'

export default function UsersPage() {
  const { isAdmin, isManager } = useAuth()
  const qc = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => api.get('/users').then(r => r.data)
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/users/${id}`),
    onSuccess: () => { qc.invalidateQueries(['allUsers']); toast.success('User deleted') },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed')
  })

  const users = (data?.users || []).filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const roleColor = { Admin: 'var(--danger)', Manager: 'var(--accent)', Employee: 'var(--success)' }

  if (isLoading) return <div className="page-loading"><div className="spinner"></div> Loading users...</div>

  return (
    <div className="users-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">👥 User Management</h1>
          <p className="page-subtitle">{users.length} users registered</p>
        </div>
        {(isAdmin || isManager) && (
          <button className="btn btn-primary" onClick={() => { setEditUser(null); setShowModal(true) }}>
            + Add New User
          </button>
        )}
      </div>

      <div className="users-toolbar">
        <div className="toolbar-search">
          <span>🔍</span>
          <input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="users-table card">
        <div className="users-table-header">
          <span>User</span>
          <span>Email</span>
          <span>Role</span>
          <span>Joined</span>
          <span>Actions</span>
        </div>
        {users.map(u => (
          <div key={u.id} className="users-table-row">
            <div className="user-cell-name">
              <div className="avatar avatar-sm user-table-avatar">{u.name.split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
              <span className="user-cell-text">{u.name}</span>
            </div>
            <span className="user-cell-email">{u.email}</span>
            <span>
              <span className="role-badge" style={{ color: roleColor[u.role], background: `${roleColor[u.role]}20`, border: `1px solid ${roleColor[u.role]}40` }}>
                {u.role}
              </span>
            </span>
            <span className="user-cell-date">{new Date(u.created_at).toLocaleDateString()}</span>
            <span className="user-actions">
              <button className="btn btn-secondary btn-sm" onClick={() => { setEditUser(u); setShowModal(true) }}>✎ Edit</button>
              {isAdmin && (
                <button className="btn btn-danger btn-sm" onClick={() => { if (window.confirm(`Delete ${u.name}?`)) deleteMutation.mutate(u.id) }}>✕</button>
              )}
            </span>
          </div>
        ))}
        {users.length === 0 && (
          <div className="empty-state" style={{padding:'32px'}}>
            <div className="empty-state-title">No users found</div>
          </div>
        )}
      </div>

      {showModal && (
        <UserModal
          user={editUser}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); qc.invalidateQueries(['allUsers']); qc.invalidateQueries(['users']) }}
        />
      )}
    </div>
  )
}

function UserModal({ user, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'Employee'
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) { toast.error('Name and email required'); return }
    if (!user && !form.password) { toast.error('Password required for new user'); return }
    setLoading(true)
    try {
      if (user) {
        await api.put(`/users/${user.id}`, { name: form.name, role: form.role })
        toast.success('User updated')
      } else {
        await api.post('/users', form)
        toast.success('User created successfully')
      }
      onSaved()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save') }
    finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{user ? '✎ Edit User' : '+ Add New User'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. John Smith" required />
          </div>
          {!user && (
            <>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input type="email" className="form-input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="john@company.com" required />
              </div>
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input type="password" className="form-input" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Min. 6 characters" required />
              </div>
            </>
          )}
          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="form-input" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
              <option>Employee</option>
              <option>Manager</option>
              <option>Admin</option>
            </select>
          </div>
          <div className="user-modal-info">
            <span>📌</span>
            <span>{user ? 'Editing name and role only. Password change available in profile settings.' : 'User will be able to log in immediately after creation.'}</span>
          </div>
          <div style={{display:'flex', gap:'8px', justifyContent:'flex-end', marginTop:'16px'}}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner"></span> Saving...</> : (user ? 'Update User' : 'Create User')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
