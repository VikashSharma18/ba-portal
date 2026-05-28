import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Topbar from '../components/layout/Topbar'
import TaskDrawer from '../components/tasks/TaskDrawer'
import { getStatus, getPriority, getRole, ROLES, PRIORITIES, STATUSES } from '../lib/constants'
import { format, isPast } from 'date-fns'
import { Download } from 'lucide-react'

export default function Tracker() {
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [drawer, setDrawer] = useState(null)
  const [filters, setFilters] = useState({ role: '', priority: '', status: '', project: '' })
  const [groupBy, setGroupBy] = useState('role')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const [{ data: t }, { data: p }] = await Promise.all([
      supabase.from('tasks').select('*, projects(name,code,color)').order('priority').order('due_date'),
      supabase.from('projects').select('*'),
    ])
    setTasks(t || [])
    setProjects(p || [])
    setLoading(false)
  }

  function applyFilters(list) {
    return list.filter(t => {
      if (filters.role && t.assigned_role !== filters.role) return false
      if (filters.priority && t.priority !== filters.priority) return false
      if (filters.status && t.status !== filters.status) return false
      if (filters.project && t.project_id !== filters.project) return false
      return true
    })
  }

  function handleSaved(task) {
    setTasks(prev => {
      const idx = prev.findIndex(t => t.id === task.id)
      if (idx >= 0) { const next = [...prev]; next[idx] = task; return next }
      return [task, ...prev]
    })
    setDrawer(null)
  }

  function handleDeleted(id) {
    setTasks(prev => prev.filter(t => t.id !== id))
    setDrawer(null)
  }

  const filtered = applyFilters(tasks)
  const groups = groupBy === 'role'
    ? ['BA', 'Backend Dev', 'Frontend Dev', 'Stakeholder', 'Client']
    : groupBy === 'status'
    ? ['Incoming','In Analysis','In Discussion','In Development','In Review','Deployed','On Hold','Cancelled']
    : groupBy === 'priority'
    ? ['Critical','High','Medium','Low']
    : []

  if (loading) return <div className="flex-1 flex items-center justify-center"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <Topbar title="Team Tracker" />

      {/* Filters bar */}
      <div className="px-6 py-3 bg-white border-b border-slate-200/80 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          Group by:
          {['role','status','priority'].map(g => (
            <button key={g} onClick={() => setGroupBy(g)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all ${groupBy === g ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {g}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-slate-200 mx-1" />

        <select className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          value={filters.role} onChange={e => setFilters(f => ({ ...f, role: e.target.value }))}>
          <option value="">All Roles</option>
          {ROLES.map(r => <option key={r.value}>{r.value}</option>)}
        </select>

        <select className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          value={filters.priority} onChange={e => setFilters(f => ({ ...f, priority: e.target.value }))}>
          <option value="">All Priorities</option>
          {PRIORITIES.map(p => <option key={p.value}>{p.value}</option>)}
        </select>

        <select className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s.value}>{s.value}</option>)}
        </select>

        <select className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          value={filters.project} onChange={e => setFilters(f => ({ ...f, project: e.target.value }))}>
          <option value="">All Projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>

        <button onClick={() => setFilters({ role:'', priority:'', status:'', project:'' })}
          className="text-xs text-slate-400 hover:text-slate-600 px-2">Clear</button>

        <div className="flex-1" />
        <span className="text-xs text-slate-400">{filtered.length} tasks</span>
      </div>

      {/* Summary cards */}
      <div className="px-6 pt-4 pb-0">
        <div className="grid grid-cols-5 gap-3">
          {ROLES.map(r => {
            const count = tasks.filter(t => t.assigned_role === r.value).length
            const open = tasks.filter(t => t.assigned_role === r.value && !['Deployed','Cancelled'].includes(t.status)).length
            return (
              <div key={r.value} className="card px-4 py-3 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${r.avatar} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                  {r.value.split(' ').map(w=>w[0]).join('')}
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-800 leading-none">{open}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{r.value}</p>
                  <p className="text-[10px] text-slate-300">{count} total</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Grouped tables */}
      <div className="flex-1 overflow-y-auto p-6 pt-4 space-y-4">
        {groups.map(group => {
          const key = groupBy === 'role' ? 'assigned_role' : groupBy === 'status' ? 'status' : 'priority'
          const groupTasks = filtered.filter(t => t[key] === group)
          if (groupTasks.length === 0) return null

          let headerColor = 'bg-slate-50'
          let dot = 'bg-slate-400'
          if (groupBy === 'role') {
            const r = getRole(group)
            dot = r.avatar
          } else if (groupBy === 'status') {
            const s = getStatus(group)
            dot = s.dot
          } else {
            const p = getPriority(group)
            dot = p.dot
          }

          return (
            <div key={group} className="card overflow-hidden">
              <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50 flex items-center gap-2.5">
                <div className={`w-2.5 h-2.5 rounded-full ${dot}`} />
                <span className="text-xs font-semibold text-slate-700">{group}</span>
                <span className="ml-auto text-xs text-slate-400">{groupTasks.length} tasks</span>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['Task ID','Title','Project','Assigned To','Role','Status','Priority','Due Date'].map(h => (
                      <th key={h} className="px-4 py-2 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {groupTasks.map(task => {
                    const st = getStatus(task.status)
                    const pr = getPriority(task.priority)
                    const ro = getRole(task.assigned_role)
                    const isOverdue = task.due_date && isPast(new Date(task.due_date)) && !['Deployed','Cancelled'].includes(task.status)
                    return (
                      <tr key={task.id} onClick={() => setDrawer(task)}
                        className="border-b border-slate-100 last:border-0 hover:bg-indigo-50/30 cursor-pointer transition-colors">
                        <td className="px-4 py-2.5 font-mono text-[10px] text-slate-400 whitespace-nowrap">{task.task_id}</td>
                        <td className="px-4 py-2.5 font-medium text-slate-800 max-w-[200px]">
                          <span className="truncate block text-sm">{task.title}</span>
                          {task.tags?.slice(0,2).map(tag => (
                            <span key={tag} className="text-[9px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded mr-1 inline-block mt-0.5">{tag}</span>
                          ))}
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          {task.projects
                            ? <span className="text-[10px] font-mono px-2 py-0.5 rounded text-white font-semibold" style={{ background: task.projects.color }}>{task.projects.code}</span>
                            : <span className="text-[10px] text-slate-400 font-mono">GEN</span>}
                        </td>
                        <td className="px-4 py-2.5 text-xs text-slate-600 whitespace-nowrap">{task.assigned_to || '—'}</td>
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          <span className={`role-badge ${ro.color}`}>{task.assigned_role}</span>
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          <span className={`status-pill ${st.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${st.dot}`} />
                            {task.status}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          <span className={`badge ${pr.color}`}>{task.priority}</span>
                        </td>
                        <td className={`px-4 py-2.5 text-xs whitespace-nowrap font-medium ${isOverdue ? 'text-red-600' : 'text-slate-400'}`}>
                          {task.due_date ? format(new Date(task.due_date), 'dd MMM yyyy') : '—'}
                          {isOverdue && <span className="ml-1 text-[9px] bg-red-100 text-red-600 px-1 rounded">OVERDUE</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )
        })}
      </div>

      {drawer !== null && (
        <TaskDrawer task={drawer?.id ? drawer : null} projects={projects}
          onClose={() => setDrawer(null)} onSaved={handleSaved} onDeleted={handleDeleted} />
      )}
    </div>
  )
}
