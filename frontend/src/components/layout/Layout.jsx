import React, { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useQuery } from '@tanstack/react-query'
import api from '../../utils/api.jsx'
import './Layout.css'

export default function Layout() {
  const { user, logout, isAdmin, isManager } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 640)

  // Close sidebar on route change on mobile
  useEffect(() => {
    if (window.innerWidth <= 640) setSidebarOpen(false)
  }, [location.pathname])

  // Close sidebar on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 640) setSidebarOpen(true)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/dashboard/notifications').then(r => r.data),
    refetchInterval: 30000,
  })

  const unreadCount = notifData?.notifications?.filter(n => !n.is_read).length || 0
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 640

  return (
    <div className={`layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>

      {/* Mobile overlay - closes sidebar on tap */}
      <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />

      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo" onClick={() => navigate('/dashboard')}>
            <div className="logo-icon">PF</div>
            <span className="logo-text">ProjectFlow</span>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">MAIN</div>

          <NavLink to="/dashboard" className={({isActive}) => `nav-item ${isActive?'active':''}`}>
            <span className="nav-icon">⊞</span><span>Dashboard</span>
          </NavLink>

          <NavLink to="/projects" className={({isActive}) => `nav-item ${isActive?'active':''}`}>
            <span className="nav-icon">◫</span><span>Projects</span>
          </NavLink>

          <NavLink to="/performance" className={({isActive}) => `nav-item ${isActive?'active':''}`}>
            <span className="nav-icon">📊</span><span>Performance</span>
          </NavLink>

          {(isAdmin || isManager) && (
            <>
              <div className="nav-section-label" style={{marginTop:'10px'}}>MANAGEMENT</div>
              <NavLink to="/users" className={({isActive}) => `nav-item ${isActive?'active':''}`}>
                <span className="nav-icon">👥</span><span>Manage Users</span>
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="nav-section-label">ACCOUNT</div>
          <NavLink to="/profile" className={({isActive}) => `nav-item ${isActive?'active':''}`}>
            <div className="avatar avatar-xs">{initials}</div>
            <div className="user-details">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </NavLink>
          <button className="nav-item logout-btn" onClick={() => { logout(); navigate('/login') }}>
            <span className="nav-icon">⊖</span><span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="main-wrapper">
        <header className="topbar">
          <div className="topbar-left">
            <button className="btn btn-ghost btn-icon" onClick={() => setSidebarOpen(o => !o)}>
              ☰
            </button>
            <div className="topbar-search">
              <span className="search-icon">🔍</span>
              <input placeholder="Search tasks, projects..." className="search-input" />
            </div>
          </div>
          <div className="topbar-right">
            <button className="btn btn-ghost btn-icon notif-btn" title="Notifications">
              🔔
              {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
            </button>
            <NavLink to="/profile" className="topbar-user-btn">
              <div className="avatar avatar-sm topbar-avatar">{initials}</div>
              <span className="topbar-username">{user?.name}</span>
            </NavLink>
          </div>
        </header>

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
