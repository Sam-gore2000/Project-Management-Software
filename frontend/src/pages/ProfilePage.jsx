import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../utils/api.jsx'
import toast from 'react-hot-toast'
import { useQuery } from '@tanstack/react-query'
import './ProfilePage.css'

export default function ProfilePage() {
  const { user } = useAuth()
  const [form, setForm] = useState({ name: user?.name || '' })
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [saving, setSaving] = useState(false)
  const [changingPass, setChangingPass] = useState(false)
  const [activeTab, setActiveTab] = useState('info')

  const { data: perfData } = useQuery({
    queryKey: ['myPerfProfile'],
    queryFn: () => api.get('/performance/me?period=monthly').then(r => r.data)
  })
  const perf = perfData?.performance

  const handleProfile = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Name required'); return }
    setSaving(true)
    try {
      await api.put('/auth/profile', { name: form.name })
      toast.success('Profile updated! Please re-login to see changes.')
    } catch { toast.error('Failed to update profile') }
    finally { setSaving(false) }
  }

  const handlePassword = async (e) => {
    e.preventDefault()
    if (!passForm.currentPassword) { toast.error('Current password required'); return }
    if (passForm.newPassword.length < 6) { toast.error('New password must be at least 6 characters'); return }
    if (passForm.newPassword !== passForm.confirmPassword) { toast.error('Passwords do not match'); return }
    setChangingPass(true)
    try {
      await api.put('/auth/change-password', { currentPassword: passForm.currentPassword, newPassword: passForm.newPassword })
      toast.success('Password changed successfully!')
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to change password') }
    finally { setChangingPass(false) }
  }

  const initials = user?.name?.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
      </div>

      <div className="profile-grid">
        <div className="profile-main">
          {/* Avatar Card */}
          <div className="card profile-avatar-card">
            <div className="profile-avatar-big">{initials}</div>
            <div className="profile-name-big">{user?.name}</div>
            <div className="profile-email-big">{user?.email}</div>
            <span className="role-badge-big">{user?.role}</span>
          </div>

          {/* Tabs */}
          <div className="profile-tabs">
            <button className={`tab-btn ${activeTab==='info'?'active':''}`} onClick={() => setActiveTab('info')}>Personal Info</button>
            <button className={`tab-btn ${activeTab==='password'?'active':''}`} onClick={() => setActiveTab('password')}>Change Password</button>
          </div>

          {activeTab === 'info' && (
            <div className="card">
              <h3 className="section-title" style={{marginBottom:'16px'}}>Edit Personal Information</h3>
              <form onSubmit={handleProfile}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" value={form.name} onChange={e => setForm({...form,name:e.target.value})} placeholder="Your full name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input className="form-input" value={user?.email} disabled style={{opacity:0.5,cursor:'not-allowed'}} />
                  <span className="form-error" style={{color:'var(--text-muted)'}}>Email cannot be changed</span>
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <input className="form-input" value={user?.role} disabled style={{opacity:0.5,cursor:'not-allowed'}} />
                  <span className="form-error" style={{color:'var(--text-muted)'}}>Role can only be changed by Admin</span>
                </div>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><span className="spinner"></span> Saving...</> : '✓ Save Changes'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="card">
              <h3 className="section-title" style={{marginBottom:'16px'}}>Change Password</h3>
              <form onSubmit={handlePassword}>
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input type="password" className="form-input" value={passForm.currentPassword}
                    onChange={e => setPassForm({...passForm,currentPassword:e.target.value})} placeholder="Enter current password" required />
                </div>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input type="password" className="form-input" value={passForm.newPassword}
                    onChange={e => setPassForm({...passForm,newPassword:e.target.value})} placeholder="Min. 6 characters" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input type="password" className="form-input" value={passForm.confirmPassword}
                    onChange={e => setPassForm({...passForm,confirmPassword:e.target.value})} placeholder="Repeat new password" required />
                </div>
                {passForm.newPassword && passForm.confirmPassword && passForm.newPassword !== passForm.confirmPassword && (
                  <div className="form-error" style={{marginBottom:'12px'}}>Passwords do not match</div>
                )}
                <button type="submit" className="btn btn-primary" disabled={changingPass}>
                  {changingPass ? <><span className="spinner"></span> Changing...</> : '🔐 Change Password'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Sidebar - Performance snapshot */}
        <div className="profile-sidebar">
          {perf && (
            <div className="card perf-snapshot">
              <h3 className="section-title">My Performance (30 days)</h3>
              <div className="snap-score">{perf.performance_score}<span>/10</span></div>
              <div className="snap-stats">
                {[
                  ['Assigned', perf.tasks_assigned, 'var(--text-secondary)'],
                  ['Done', perf.tasks_completed, 'var(--success)'],
                  ['Overdue', perf.overdue_tasks, 'var(--danger)'],
                  ['Rate', `${perf.completion_rate}%`, perf.completion_rate>=70?'var(--success)':'var(--warning)'],
                ].map(([l,v,c]) => (
                  <div key={l} className="snap-stat">
                    <div className="snap-stat-value" style={{color:c}}>{v}</div>
                    <div className="snap-stat-label">{l}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="card">
            <h3 className="section-title">Account Details</h3>
            <div className="info-list">
              <div className="info-row"><span>Account ID</span><span>#{user?.id}</span></div>
              <div className="info-row"><span>Role</span><span>{user?.role}</span></div>
              <div className="info-row"><span>Member since</span><span>{new Date(user?.created_at || Date.now()).toLocaleDateString()}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
