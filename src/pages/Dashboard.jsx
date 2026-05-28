import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Topbar from '../components/layout/Topbar'
import { CheckSquare, Clock, AlertCircle, Rocket, TrendingUp, Calendar } from 'lucide-react'
import { getStatus, getPriority, getRole, KANBAN_COLUMNS } from '../lib/constants'
import { format, isToday, isPast } from 'date-fns'

export default function Dashboard() {
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: t }, { data: p }] = await Promise.all([
        supabase.from('tasks').select('*').order('created_at', { ascending: false }),
        supabase.from('projects').select('*').eq('status', 'active'),
      ])
      setTasks(t || [])
      setProjects(p || [])
      setLoading(false)
    }
    load()
  }, [])

  const total = tasks.length
  const inProgress = tasks.filter(t => ['In Analysis','In Discussion','In Development','In Review'].includes(t.status)).length
  const deployed = tasks.filter(t => t.status === 'Deployed').length
  const overdue = tasks.filter(t => t.due_date && isPast(new Date(t.due_date)) && !['Deployed','Cancelled'].includes(t.status)).length
  const todayTasks = tasks.filter(t => t.due_date && isToday(new Date(t.due_date)) && !['Deployed','Cancelled'].includes(t.status))

  const stats = [
    { label: 'Total Tasks', value: total, icon: CheckSquare, color: 'text-blue-500', bg: 'bg-blue-50', sub: `${todayTasks.length} due today` },
    { label: 'In Progress', value: inProgress, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', sub: `${overdue} overdue` },
    { label: 'Deployed', value: deployed, icon: Rocket, color: 'text-green-500', bg: 'bg-green-50', sub: 'This sprint' },
    { label: 'Overdue', value: overdue, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50', sub: 'Need attention' },
  ]

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <Topbar title="Dashboard" />
      <div className="flex-1 overflow-y-auto p-6">

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {stats.map(s => {
            const Icon = s.icon
            return (
              <div key={s.label} className="card p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-slate-500 font-medium">{s.label}</span>
                  <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                    <Icon size={15} className={s.color} />
                  </div>
                </div>
                <p className="text-2xl font-semibold text-slate-800">{s.value}</p>
                <p className="text-xs text-slate-400 mt-1">{s.sub}</p>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          {/* Today's Tasks */}
          <div className="col-span-2 card">
            <div className="px-4 py-3 border-b border-slate-200/80 flex items-center gap-2">
              <Calendar size={14} className="text-amber-500" />
              <span className="text-sm font-semibold text-slate-700">My Tasks Today</span>
              <span className="ml-auto text-xs text-slate-400">{todayTasks.length} tasks</span>
            </div>
            <div>
              {todayTasks.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-400">No tasks due today 🎉</div>
              ) : todayTasks.slice(0,6).map(task => {
                const priority = getPriority(task.priority)
                const role = getRole(task.assigned_role)
                return (
                  <div key={task.id} className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 truncate">{task.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5 font-mono">{task.task_id}</p>
                    </div>
                    <span className={`badge ${role.color} text-[10px]`}>{task.assigned_role}</span>
                    <span className={`badge ${priority.color} text-[10px]`}>{task.priority}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Projects */}
          <div className="card">
            <div className="px-4 py-3 border-b border-slate-200/80 flex items-center gap-2">
              <TrendingUp size={14} className="text-indigo-500" />
              <span className="text-sm font-semibold text-slate-700">Active Projects</span>
            </div>
            <div className="p-4 space-y-4">
              {projects.map(p => (
                <div key={p.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <p className="text-xs font-semibold text-slate-700">{p.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{p.code}</p>
                    </div>
                    <span className="text-xs font-semibold" style={{ color: p.color }}>{p.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${p.progress}%`, background: p.color }} />
                  </div>
                  {p.due_date && (
                    <p className="text-[10px] text-slate-400 mt-1">Due {format(new Date(p.due_date), 'dd MMM yyyy')}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Kanban Mini */}
        <div className="card">
          <div className="px-4 py-3 border-b border-slate-200/80">
            <span className="text-sm font-semibold text-slate-700">Task Pipeline Overview</span>
          </div>
          <div className="flex gap-3 p-4 overflow-x-auto">
            {KANBAN_COLUMNS.map(col => {
              const colTasks = tasks.filter(t => t.status === col)
              const st = getStatus(col)
              return (
                <div key={col} className="min-w-[160px] flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${st.dot}`} />
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{col}</span>
                    </div>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{colTasks.length}</span>
                  </div>
                  <div className="space-y-1.5">
                    {colTasks.slice(0,3).map(t => {
                      const pr = getPriority(t.priority)
                      return (
                        <div key={t.id} className="bg-slate-50 border border-slate-200 rounded-lg p-2">
                          <p className="text-[10px] font-mono text-slate-400">{t.task_id}</p>
                          <p className="text-[11px] text-slate-700 leading-snug mt-0.5 line-clamp-2">{t.title}</p>
                          <span className={`badge ${pr.color} text-[9px] mt-1`}>{t.priority}</span>
                        </div>
                      )
                    })}
                    {colTasks.length > 3 && (
                      <p className="text-[10px] text-slate-400 text-center">+{colTasks.length - 3} more</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
