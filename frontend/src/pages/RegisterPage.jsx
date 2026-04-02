import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import toast from 'react-hot-toast'
import './AuthPages.css'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Employee' })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      await register(form)
      toast.success('Account created!')
      navigate('/dashboard')
    } catch (err) { toast.error(err.response?.data?.message || 'Registration failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-bg"><div className="auth-grid"></div><div className="auth-glow"></div></div>
      <div className="auth-card">
        <div className="auth-logo"><div className="auth-logo-icon">PF</div><span className="auth-logo-text">ProjectFlow</span></div>
        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Join your team's workspace</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group"><label className="form-label">Full Name</label><input type="text" className="form-input" placeholder="Jane Smith" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
          <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-input" placeholder="you@company.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required /></div>
          <div className="form-group"><label className="form-label">Password</label><input type="password" className="form-input" placeholder="Min. 6 characters" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required /></div>
          <div className="form-group"><label className="form-label">Role</label><select className="form-input" value={form.role} onChange={e => setForm({...form, role: e.target.value})}><option>Employee</option><option>Manager</option><option>Admin</option></select></div>
          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>{loading ? <><span className="spinner"></span> Creating...</> : 'Create Account'}</button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  )
}
