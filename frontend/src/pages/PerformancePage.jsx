import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../utils/api.jsx'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts'
import './PerformancePage.css'

const PIE_COLORS = ['#8b949e', '#1f6feb', '#bc8cff', '#3fb950']

export default function PerformancePage() {
  const { user } = useAuth()
  const isAdminOrManager = user.role === 'Admin' || user.role === 'Manager'

  const [period, setPeriod]           = useState('weekly')
  const [viewingUserId, setViewingUserId] = useState(null) // null = self
  const [showCoaching, setShowCoaching]   = useState(false)
  const [coachingData, setCoachingData]   = useState(null)
  const [coachingLoading, setCoachingLoading] = useState(false)

  // My own performance (or selected team member)
  const perfUrl = viewingUserId
    ? `/performance/user/${viewingUserId}?period=${period}`
    : `/performance/me?period=${period}`

  const { data: perfData, isLoading: perfLoading } = useQuery({
    queryKey: ['performance', viewingUserId || user.id, period],
    queryFn: () => api.get(perfUrl).then(r => r.data),
  })

  // Team performance (admin/manager only)
  const { data: teamData, isLoading: teamLoading } = useQuery({
    queryKey: ['teamPerformance', period],
    queryFn: () => api.get(`/performance/team?period=${period}`).then(r => r.data),
    enabled: isAdminOrManager,
  })

  const handleCoaching = async () => {
    setCoachingLoading(true)
    setShowCoaching(true)
    setCoachingData(null)
    try {
      const { data } = await api.get(`/performance/coaching?period=${period}`)
      setCoachingData(data.coaching)
    } catch (err) {
      setCoachingData({
        performance_score: 0,
        summary: 'Failed to load coaching data. Please try again.',
        issues: [{ type: 'error', text: err.response?.data?.message || 'Server error' }],
        suggestions: [],
        roadmap: [],
        tasks_assigned: 0,
        tasks_completed: 0,
        completion_rate: 0,
        overdue_tasks: 0,
      })
    } finally {
      setCoachingLoading(false)
    }
  }

  const perf = perfData?.performance
  const team = teamData?.team || []

  // Chart data
  const trendData   = (perf?.trend || []).map(t => ({ day: String(t.day || '').slice(5), completed: parseInt(t.completed) || 0 }))
  const monthlyData = (perf?.weekly_breakdown || []).map(w => ({ week: w.week, completed: parseInt(w.completed) || 0 }))
  const chartData   = period === 'weekly' ? trendData : monthlyData
  const chartKey    = period === 'weekly' ? 'day' : 'week'

  const viewingName = viewingUserId
    ? team.find(m => m.id === viewingUserId)?.name || 'Team Member'
    : user.name

  return (
    <div className="performance-page">

      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">📊 Performance Analytics</h1>
          <p className="page-subtitle">
            Viewing: <strong>{viewingName}</strong> ·{' '}
            {period === 'weekly' ? 'All time (weekly trend)' : 'All time (monthly trend)'}
          </p>
        </div>
        <div style={{ display:'flex', gap:'10px', alignItems:'center', flexWrap:'wrap' }}>
          <div className="period-toggle">
            <button className={`toggle-btn ${period==='weekly'?'active':''}`}  onClick={() => setPeriod('weekly')}>Weekly</button>
            <button className={`toggle-btn ${period==='monthly'?'active':''}`} onClick={() => setPeriod('monthly')}>Monthly</button>
          </div>
          <button className="btn btn-primary ai-btn" onClick={handleCoaching}>
            🚀 Improve My Performance
          </button>
        </div>
      </div>

      {/* ── My Performance Score Card ── */}
      {perfLoading ? (
        <div className="page-loading"><div className="spinner"></div> Loading performance...</div>
      ) : perf ? (
        <>
          <div className="score-hero card">
            <div className="score-circle-wrapper">
              <div className="score-circle" style={{'--pct':`${(perf.performance_score / 10) * 100}%`}}>
                <div className="score-value">{perf.performance_score}</div>
                <div className="score-label">/ 10</div>
              </div>
            </div>
            <div className="score-details">
              <h2 className="score-title">{perf.user?.name} — Performance Score</h2>
              <p className="score-period-label">
                {viewingUserId ? '👆 Click a team member row to switch view' : '👆 Click a team member below to view their report'}
              </p>
              <div className="score-metrics">
                {[
                  ['Assigned',    perf.tasks_assigned,    'var(--text-secondary)'],
                  ['Completed',   perf.tasks_completed,   'var(--success)'],
                  ['In Progress', perf.tasks_in_progress, 'var(--accent)'],
                  ['In Review',   perf.tasks_in_review,   'var(--purple)'],
                  ['To Do',       perf.tasks_to_do,       'var(--text-muted)'],
                  ['Overdue',     perf.overdue_tasks,     'var(--danger)'],
                  ['Rate',        `${perf.completion_rate}%`,
                    perf.completion_rate >= 70 ? 'var(--success)'
                    : perf.completion_rate >= 50 ? 'var(--warning)' : 'var(--danger)'],
                ].map(([l, v, c]) => (
                  <div key={l} className="score-stat">
                    <div className="score-stat-value" style={{color:c}}>{v}</div>
                    <div className="score-stat-label">{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Progress Bars */}
          <div className="perf-bars card">
            <h3 className="section-title">Performance Breakdown</h3>
            <ProgBar label="Completion Rate"   value={perf.completion_rate} color="var(--success)" />
            <ProgBar label="On-Time Delivery"
              value={perf.tasks_assigned > 0
                ? Math.round(((perf.tasks_assigned - perf.overdue_tasks) / perf.tasks_assigned) * 100)
                : 100}
              color="var(--accent)" />
            <ProgBar label="Workload Coverage"
              value={Math.min(100, perf.tasks_assigned * 5)}
              color="var(--purple)" />
            <ProgBar label="Overall Score" value={perf.performance_score * 10} color="var(--warning)" />
          </div>

          {/* Charts Row */}
          <div className="perf-charts">
            <div className="card">
              <h3 className="section-title">
                {period === 'weekly' ? 'Daily Completions (Last 7 Days)' : 'Weekly Completions (Last 30 Days)'}
              </h3>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey={chartKey} tick={{fill:'var(--text-muted)',fontSize:11}} />
                    <YAxis tick={{fill:'var(--text-muted)',fontSize:11}} allowDecimals={false} />
                    <Tooltip contentStyle={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'8px',color:'var(--text-primary)'}} />
                    <Line type="monotone" dataKey="completed" stroke="var(--success)" strokeWidth={2} dot={{fill:'var(--success)',r:4}} name="Tasks Completed" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-state" style={{height:200}}>
                  <div className="empty-state-title">No completion trend yet</div>
                  <div className="empty-state-desc">Complete tasks to see your trend appear here</div>
                </div>
              )}
            </div>

            <div className="card">
              <h3 className="section-title">Task Distribution</h3>
              {perf.task_distribution.some(d => d.value > 0) ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={perf.task_distribution.filter(d=>d.value>0)}
                      cx="50%" cy="50%" outerRadius={75} innerRadius={35}
                      dataKey="value"
                      label={({name,value}) => `${name}: ${value}`}
                      labelLine={false}>
                      {perf.task_distribution.map((e,i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                    </Pie>
                    <Tooltip contentStyle={{background:'var(--bg-card)',border:'1px solid var(--border)',color:'var(--text-primary)'}} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-state" style={{height:200}}>
                  <div className="empty-state-title">No tasks assigned yet</div>
                  <div className="empty-state-desc">Tasks will appear here once assigned to you</div>
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}

      {/* ── Team Performance Table (Admin + Manager) ── */}
      {isAdminOrManager && (
        <div className="card team-perf-card">
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'14px',flexWrap:'wrap',gap:'8px'}}>
            <div>
              <h3 className="section-title">Team Performance Overview</h3>
              <p style={{fontSize:'12px',color:'var(--text-muted)',marginTop:'2px'}}>
                Click any row to view that member's detailed report above ↑
              </p>
            </div>
            {viewingUserId && (
              <button className="btn btn-secondary btn-sm" onClick={() => setViewingUserId(null)}>
                ✕ Back to my report
              </button>
            )}
          </div>

          {teamLoading ? (
            <div className="page-loading"><div className="spinner"></div> Loading team data...</div>
          ) : (
            <>
              <div className="team-perf-table">
                <div className="team-table-header">
                  <span>Member</span>
                  <span>Role</span>
                  <span>Assigned</span>
                  <span>Done</span>
                  <span>Completion</span>
                  <span>Overdue</span>
                  <span>Score</span>
                </div>
                {team.map(m => (
                  <div key={m.id}
                    className={`team-table-row ${viewingUserId === m.id ? 'selected' : ''}`}
                    onClick={() => setViewingUserId(viewingUserId === m.id ? null : m.id)}
                    title="Click to view this member's performance">
                    <span className="team-member-name">
                      <div className="avatar avatar-xs">
                        {m.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
                      </div>
                      {m.name}
                      {m.id === user.id && <span style={{fontSize:'10px',color:'var(--accent)',marginLeft:'4px'}}>(you)</span>}
                    </span>
                    <span><span className="tag">{m.role}</span></span>
                    <span>{m.tasks_assigned}</span>
                    <span style={{color:'var(--success)',fontWeight:600}}>{m.tasks_completed}</span>
                    <span>
                      <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                        <div className="progress-bar" style={{width:50,height:4}}>
                          <div className="progress-fill" style={{
                            width:`${m.completion_rate}%`, height:'4px',
                            background: m.completion_rate>=70?'var(--success)':m.completion_rate>=50?'var(--warning)':'var(--danger)'
                          }}></div>
                        </div>
                        <span style={{fontSize:'12px'}}>{m.completion_rate}%</span>
                      </div>
                    </span>
                    <span style={{color:m.overdue>0?'var(--danger)':'var(--text-muted)'}}>{m.overdue}</span>
                    <span>
                      <span className={`score-pill ${m.score>=8?'score-high':m.score>=6?'score-mid':'score-low'}`}>
                        {m.score}/10
                      </span>
                    </span>
                  </div>
                ))}
                {team.length === 0 && (
                  <div className="empty-state" style={{padding:'24px'}}>
                    <div className="empty-state-title">No team data available</div>
                  </div>
                )}
              </div>

              {/* Team Bar Chart */}
              {team.length > 0 && (
                <div style={{marginTop:'20px'}}>
                  <h3 className="section-title" style={{marginBottom:'12px'}}>Team Completion Comparison</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={team.slice(0,8).map(m=>({
                      name: m.name.split(' ')[0],
                      Assigned: m.tasks_assigned,
                      Done: m.tasks_completed
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
                      <XAxis dataKey="name" tick={{fill:'var(--text-muted)',fontSize:11}} axisLine={false}/>
                      <YAxis tick={{fill:'var(--text-muted)',fontSize:11}} axisLine={false}/>
                      <Tooltip contentStyle={{background:'var(--bg-card)',border:'1px solid var(--border)',color:'var(--text-primary)'}}/>
                      <Bar dataKey="Assigned" fill="#3d444d" radius={[3,3,0,0]} />
                      <Bar dataKey="Done"     fill="var(--success)" radius={[3,3,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── AI Coaching Modal ── */}
      {showCoaching && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setShowCoaching(false)}>
          <div className="modal modal-lg coaching-modal">
            <div className="modal-header">
              <h2 className="modal-title">🤖 AI Performance Coach</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowCoaching(false)}>✕</button>
            </div>

            {coachingLoading ? (
              <div className="page-loading" style={{minHeight:'200px'}}>
                <div className="spinner"></div> Analyzing your performance data...
              </div>
            ) : coachingData ? (
              <div className="coaching-content">
                {/* Score + Summary */}
                <div className="coaching-score-row">
                  <div className={`coaching-score-badge ${coachingData.performance_score>=8?'score-high':coachingData.performance_score>=6?'score-mid':'score-low'}`}>
                    {coachingData.performance_score}/10
                  </div>
                  <p className="coaching-summary">{coachingData.summary}</p>
                </div>

                {/* Stats */}
                <div className="coaching-stats-row">
                  {[
                    ['Tasks Assigned', coachingData.tasks_assigned],
                    ['Tasks Done',     coachingData.tasks_completed],
                    ['Completion',     `${coachingData.completion_rate}%`],
                    ['Overdue',        coachingData.overdue_tasks],
                  ].map(([l,v]) => (
                    <div key={l} className="coaching-stat">
                      <div className="coaching-stat-val">{v}</div>
                      <div className="coaching-stat-lbl">{l}</div>
                    </div>
                  ))}
                </div>

                {/* Issues */}
                <div className="coaching-section">
                  <h4 className="coaching-section-title">🔍 Analysis</h4>
                  <div className="issues-list">
                    {coachingData.issues.map((issue,i) => (
                      <div key={i} className={`issue-item issue-${issue.type}`}>
                        <span>{issue.type==='error'?'❌':issue.type==='warning'?'⚠️':issue.type==='success'?'✅':'ℹ️'}</span>
                        <span>{issue.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Suggestions */}
                {coachingData.suggestions.length > 0 && (
                  <div className="coaching-section">
                    <h4 className="coaching-section-title">💡 Personalized Suggestions</h4>
                    <div className="suggestions-list">
                      {coachingData.suggestions.map((s,i) => (
                        <div key={i} className="suggestion-item">
                          <span className="suggestion-num">{i+1}</span>
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Roadmap */}
                {coachingData.roadmap.length > 0 && (
                  <div className="coaching-section">
                    <h4 className="coaching-section-title">🗓️ 2-Week Improvement Roadmap</h4>
                    <div className="roadmap-list">
                      {coachingData.roadmap.map((r,i) => (
                        <div key={i} className="roadmap-item">
                          <div className="roadmap-week">Week {r.week}</div>
                          <div className="roadmap-action">{r.action}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}

function ProgBar({ label, value, color }) {
  const pct = Math.max(0, Math.min(100, value || 0))
  return (
    <div className="perf-progress-row">
      <div className="perf-progress-label">{label}</div>
      <div className="progress-bar perf-bar">
        <div className="progress-fill" style={{width:`${pct}%`,height:'8px',background:color}}></div>
      </div>
      <div className="perf-progress-value" style={{color}}>{Math.round(pct)}%</div>
    </div>
  )
}
