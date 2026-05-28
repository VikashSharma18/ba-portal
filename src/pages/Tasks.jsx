import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Topbar from '../components/layout/Topbar'
import TaskCard from '../components/tasks/TaskCard'
import TaskDrawer from '../components/tasks/TaskDrawer'
import { KANBAN_COLUMNS, getStatus, getPriority, getRole, STATUSES, PRIORITIES, ROLES } from '../lib/constants'
import { format, isPast, isToday } from 'date-fns'
import { LayoutGrid, List, Users, FolderOpen, Filter, ChevronDown } from 'lucide-react'

const VIEWS = [
  { id: 'board', label: 'Board', icon: LayoutGrid },
  { id: 'list', label: 'List', icon: List },
  { id: 'tracker', label: 'Team Tracker', icon: Users },
  { id: 'project', label: 'By Project', icon: FolderOpen },
]

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [view, setView] = useState('board')
  const [drawer, setDrawer] = useState(null)
  const [filters, setFilters] = useState({ role: '', priority: '', status: '', project: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const [{ data: t }, { data: p }] = await Promise.all([
      supabase.from('tasks').select('*, projects(name,code,color)').order('created_at', { ascending: false }),
      supabase.from('projects').select('*').order('name'),
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

  const filtered = applyFilters(tasks)

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

  if (loading) return <div className="flex-1 flex items-center justify-center"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <Topbar title="Tasks" action={{ label: 'New Task', onClick: () => setDrawer({}) }} />

      <div className="px-6 py-3 bg-white border-b border-slate-200/80 flex items-center gap-3">
        {/* View switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          {VIEWS.map(v => {
            const Icon = v.icon
            return (
              <button key={v.id} onClick={() => setView(v.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${view === v.id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                <Icon size={13} />{v.label}
              </button>
            )
          })}
        </div>

        <div className="flex-1" />

        {/* Filters */}
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
          value={filters.project} onChange={e => setFilters(f => ({ ...f, project: e.target.value }))}>
          <option value="">All Projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>

        <button onClick={() => setFilters({ role: '', priority: '', status: '', project: '' })}
          className="text-xs text-slate-400 hover:text-slate-600 px-2">Clear</button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {view === 'board' && <BoardView tasks={filtered} onCardClick={setDrawer} />}
        {view === 'list' && <ListView tasks={filtered} onRowClick={setDrawer} />}
        {view === 'tracker' && <TrackerView tasks={filtered} onRowClick={setDrawer} />}
        {view === 'project' && <ProjectView tasks={filtered} projects={projects} onCardClick={setDrawer} />}
      </div>

      {drawer !== null && (
        <TaskDrawer
          task={drawer?.id ? drawer : null}
          projects={projects}
          onClose={() => setDrawer(null)}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  )
}

function BoardView({ tasks, onCardClick }) {
  return (
    <div className="flex gap-3 p-5 overflow-x-auto min-h-full">
      {KANBAN_COLUMNS.map(col => {
        const colTasks = tasks.filter(t => t.status === col)
        const st = getStatus(col)
        return (
          <div key={col} className="min-w-[240px] w-60 flex-shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-2 h-2 rounded-full ${st.dot}`} />
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{col}</span>
              <span className="ml-auto text-[10px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full">{colTasks.length}</span>
            </div>
            <div className="space-y-2">
              {colTasks.map(task => <TaskCard key={task.id} task={task} onClick={onCardClick} />)}
              {colTasks.length === 0 && (
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center text-xs text-slate-400">Empty</div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ListView({ tasks, onRowClick }) {
  return (
    <div className="p-5">
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Task ID</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Title</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Project</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Priority</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Due</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => {
              const status = getStatus(task.status)
              const priority = getPriority(task.priority)
              const role = getRole(task.assigned_role)
              const isOverdue = task.due_date && isPast(new Date(task.due_date)) && !['Deployed','Cancelled'].includes(task.status)
              return (
                <tr key={task.id} onClick={() => onRowClick(task)}
                  className="border-b border-slate-100 hover:bg-indigo-50/40 cursor-pointer transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{task.task_id}</td>
                  <td className="px-4 py-3 font-medium text-slate-800 max-w-xs">
                    <span className="truncate block">{task.title}</span>
                    {task.tags?.slice(0,2).map(tag => (
                      <span key={tag} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded mr-1 mt-1 inline-block">{tag}</span>
                    ))}
                  </td>
                  <td className="px-4 py-3">
                    {task.projects ? (
                      <span className="text-xs font-mono px-2 py-0.5 rounded-md text-white" style={{ background: task.projects.color }}>
                        {task.projects.code}
                      </span>
                    ) : <span className="text-xs text-slate-400">General</span>}
                  </td>
                  <td className="px-4 py-3"><span className={`role-badge ${role.color}`}>{task.assigned_role}</span></td>
                  <td className="px-4 py-3"><span className={`status-pill ${status.color}`}><span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />{task.status}</span></td>
                  <td className="px-4 py-3"><span className={`badge ${priority.color}`}>{task.priority}</span></td>
                  <td className={`px-4 py-3 text-xs ${isOverdue ? 'text-red-600 font-semibold' : 'text-slate-400'}`}>
                    {task.due_date ? format(new Date(task.due_date), 'dd MMM') : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {tasks.length === 0 && <div className="py-12 text-center text-sm text-slate-400">No tasks found</div>}
      </div>
    </div>
  )
}

function TrackerView({ tasks, onRowClick }) {
  const roleGroups = ['BA', 'Backend Dev', 'Frontend Dev', 'Stakeholder', 'Client']
  return (
    <div className="p-5 space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-5 gap-3">
        {roleGroups.map(role => {
          const r = getRole(role)
          const count = tasks.filter(t => t.assigned_role === role).length
          return (
            <div key={role} className="card p-3 text-center">
              <div className={`w-8 h-8 rounded-full ${r.avatar} flex items-center justify-center text-white text-xs font-semibold mx-auto mb-2`}>
                {role.split(' ').map(w=>w[0]).join('')}
              </div>
              <p className="text-lg font-semibold text-slate-800">{count}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{role}</p>
            </div>
          )
        })}
      </div>

      {/* Grouped table */}
      {roleGroups.map(role => {
        const roleTasks = tasks.filter(t => t.assigned_role === role)
        if (roleTasks.length === 0) return null
        const r = getRole(role)
        return (
          <div key={role} className="card overflow-hidden">
            <div className={`px-4 py-2.5 border-b border-slate-200 flex items-center gap-2.5 bg-slate-50`}>
              <div className={`w-6 h-6 rounded-full ${r.avatar} flex items-center justify-center text-white text-[10px] font-semibold`}>
                {role.split(' ').map(w=>w[0]).join('')}
              </div>
              <span className="text-xs font-semibold text-slate-700">{role}</span>
              <span className="ml-auto text-xs text-slate-400">{roleTasks.length} tasks</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-4 py-2 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Task</th>
                  <th className="px-4 py-2 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Title</th>
                  <th className="px-4 py-2 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Project</th>
                  <th className="px-4 py-2 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Assigned To</th>
                  <th className="px-4 py-2 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-2 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Priority</th>
                  <th className="px-4 py-2 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Due</th>
                </tr>
              </thead>
              <tbody>
                {roleTasks.map(task => {
                  const st = getStatus(task.status)
                  const pr = getPriority(task.priority)
                  const isOverdue = task.due_date && isPast(new Date(task.due_date)) && !['Deployed','Cancelled'].includes(task.status)
                  return (
                    <tr key={task.id} onClick={() => onRowClick(task)} className="border-b border-slate-100 last:border-0 hover:bg-indigo-50/30 cursor-pointer">
                      <td className="px-4 py-2.5 font-mono text-[10px] text-slate-400">{task.task_id}</td>
                      <td className="px-4 py-2.5 text-sm text-slate-700 font-medium max-w-xs"><span className="truncate block">{task.title}</span></td>
                      <td className="px-4 py-2.5">
                        {task.projects ? <span className="text-xs font-mono px-2 py-0.5 rounded text-white" style={{ background: task.projects?.color || '#6366f1' }}>{task.projects.code}</span>
                          : <span className="text-xs text-slate-400">GEN</span>}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-slate-600">{task.assigned_to || '—'}</td>
                      <td className="px-4 py-2.5"><span className={`status-pill ${st.color}`}><span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />{task.status}</span></td>
                      <td className="px-4 py-2.5"><span className={`badge ${pr.color}`}>{task.priority}</span></td>
                      <td className={`px-4 py-2.5 text-xs ${isOverdue ? 'text-red-600 font-semibold' : 'text-slate-400'}`}>
                        {task.due_date ? format(new Date(task.due_date), 'dd MMM') : '—'}
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
  )
}

function ProjectView({ tasks, projects, onCardClick }) {
  const genTasks = tasks.filter(t => !t.project_id)
  return (
    <div className="p-5 space-y-4">
      {projects.map(p => {
        const ptasks = tasks.filter(t => t.project_id === p.id)
        if (ptasks.length === 0) return null
        return (
          <div key={p.id} className="card overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-3" style={{ borderLeftWidth: 3, borderLeftColor: p.color }}>
              <div>
                <p className="text-sm font-semibold text-slate-800">{p.name}</p>
                <p className="text-[10px] font-mono text-slate-400">{p.code} · {ptasks.length} tasks · {p.progress}% complete</p>
              </div>
              <div className="ml-auto w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${p.progress}%`, background: p.color }} />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3 p-4">
              {ptasks.map(task => <TaskCard key={task.id} task={task} onClick={onCardClick} />)}
            </div>
          </div>
        )
      })}
      {genTasks.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200">
            <p className="text-sm font-semibold text-slate-800">General Tasks</p>
            <p className="text-[10px] font-mono text-slate-400">GEN · {genTasks.length} tasks</p>
          </div>
          <div className="grid grid-cols-4 gap-3 p-4">
            {genTasks.map(task => <TaskCard key={task.id} task={task} onClick={onCardClick} />)}
          </div>
        </div>
      )}
    </div>
  )
}
