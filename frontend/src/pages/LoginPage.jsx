import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import toast from 'react-hot-toast'
import './AuthPages.css'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) { toast.error(err.response?.data?.message || 'Login failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-bg"><div className="auth-grid"></div><div className="auth-glow"></div></div>
      <div className="auth-card">
        <div className="auth-logo"><div className="auth-logo-icon">PF</div><span className="auth-logo-text">ProjectFlow</span></div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your workspace</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-input" placeholder="you@company.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required /></div>
          <div className="form-group"><label className="form-label">Password</label><input type="password" className="form-input" placeholder="••••••••" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required /></div>
          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>{loading ? <><span className="spinner"></span> Signing in...</> : 'Sign In'}</button>
        </form>
        <p className="auth-switch">Don't have an account? <Link to="/register">Create one</Link></p>
        <div className="auth-demo">
          <p className="auth-demo-label">Demo Accounts</p>
          <div className="auth-demo-row"><span>admin@test.com</span><span>·</span><span>admin123</span><span className="tag">Admin</span></div>
        </div>
      </div>
    </div>
  )
}
