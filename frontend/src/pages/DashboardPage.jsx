import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../utils/api.jsx'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import './DashboardPage.css'

const STATUS_COLORS = { 'To Do': '#8b949e', 'In Progress': '#1f6feb', 'In Review': '#bc8cff', 'Done': '#3fb950' }

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => api.get('/dashboard/stats').then(r => r.data),
    refetchInterval: 30000,
  })

  const stats = data?.stats

  const pieData = stats?.tasks_by_status?.map(s => ({
    name: s.status, value: parseInt(s.count), color: STATUS_COLORS[s.status] || '#8b949e'
  })) || []

  const workloadData = stats?.user_workload?.slice(0, 6).map(u => ({
    name: u.name.split(' ')[0],
    'To Do': parseInt(u.todo) || 0,
    'In Progress': parseInt(u.in_progress) || 0,
    'In Review': parseInt(u.in_review) || 0,
    Done: parseInt(u.done) || 0,
  })) || []

  const totalTasks = pieData.reduce((a, b) => a + b.value, 0)

  if (isLoading) return <div className="page-loading"><div className="spinner"></div> Loading dashboard...</div>

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/projects')}>+ New Project</button>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        {[
          { icon: '◫', label: 'Total Projects', value: stats?.total_projects || 0, color: 'accent', sub: 'Active projects' },
          { icon: '◻', label: 'My Open Tasks', value: stats?.my_tasks || 0, color: 'info', sub: 'Needs attention' },
          { icon: '⏰', label: 'Overdue', value: stats?.overdue_tasks || 0, color: 'danger', sub: 'Past due date' },
          { icon: '✓', label: 'Completed', value: pieData.find(p => p.name === 'Done')?.value || 0, color: 'success', sub: 'Tasks done' },
        ].map(s => (
          <div key={s.label} className={`stat-card card stat-${s.color}`}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* Tasks by Status */}
        <div className="card">
          <div className="card-header-row">
            <h3 className="section-title">Tasks by Status</h3>
            <span className="card-header-meta">{totalTasks} total</span>
          </div>
          {pieData.length > 0 ? (
            <div className="pie-wrapper">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                    {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pie-legend">
                {pieData.map(d => (
                  <div key={d.name} className="pie-legend-item">
                    <div className="pie-legend-dot" style={{ background: d.color }}></div>
                    <span className="pie-legend-label">{d.name}</span>
                    <span className="pie-legend-value">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <div className="empty-state"><div className="empty-state-title">No task data yet</div></div>}
        </div>

        {/* Team Workload */}
        <div className="card">
          <h3 className="section-title">Team Workload</h3>
          {workloadData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={workloadData} barSize={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                <Bar dataKey="To Do" fill="#8b949e" radius={[3, 3, 0, 0]} />
                <Bar dataKey="In Progress" fill="#1f6feb" radius={[3, 3, 0, 0]} />
                <Bar dataKey="In Review" fill="#bc8cff" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Done" fill="#3fb950" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="empty-state"><div className="empty-state-title">No workload data</div></div>}
        </div>

        {/* Projects Progress */}
        <div className="card">
          <div className="card-header-row">
            <h3 className="section-title">Projects Progress</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/projects')}>View all →</button>
          </div>
          <div className="projects-list">
            {stats?.projects_progress?.length > 0 ? stats.projects_progress.map(p => {
              const pct = p.total_tasks > 0 ? Math.round((p.completed_tasks / p.total_tasks) * 100) : 0
              return (
                <div key={p.id} className="project-progress-item" onClick={() => navigate(`/projects/${p.id}`)}>
                  <div className="pp-header">
                    <div className="pp-name-row">
                      <div className="pp-icon">{p.name[0]}</div>
                      <span className="pp-name">{p.name}</span>
                    </div>
                    <span className="pp-pct">{pct}%</span>
                  </div>
                  <div className="progress-bar pp-bar">
                    <div className="progress-fill" style={{ width: `${pct}%`, height: '4px', background: pct >= 75 ? 'var(--success)' : pct >= 40 ? 'var(--accent)' : 'var(--warning)' }}></div>
                  </div>
                  <div className="pp-meta">{p.completed_tasks || 0}/{p.total_tasks || 0} tasks</div>
                </div>
              )
            }) : <div className="empty-state"><div className="empty-state-title">No projects yet</div></div>}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h3 className="section-title">Recent Activity</h3>
          <div className="activity-feed">
            {stats?.recent_activity?.length > 0 ? stats.recent_activity.map(a => (
              <div key={a.id} className="activity-item">
                <div className="activity-avatar">{a.user_name?.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
                <div className="activity-content">
                  <div className="activity-text">
                    <span className="activity-user">{a.user_name}</span>
                    <span className="activity-action"> {a.action.replace(/_/g, ' ')} </span>
                    {a.project_name && <span className="activity-project">in {a.project_name}</span>}
                  </div>
                  <div className="activity-time">{formatTime(a.created_at)}</div>
                </div>
              </div>
            )) : <div className="empty-state"><div className="empty-state-title">No recent activity</div></div>}
          </div>
        </div>
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  return h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening'
}

function formatTime(ts) {
  const diff = Date.now() - new Date(ts).getTime()
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return new Date(ts).toLocaleDateString()
}
