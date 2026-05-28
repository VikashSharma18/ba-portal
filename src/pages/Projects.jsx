import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Topbar from '../components/layout/Topbar'
import { format } from 'date-fns'
import { FolderOpen, Plus, X, Save, Trash2, CheckSquare, Clock, Rocket } from 'lucide-react'

const PROJECT_COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#3b82f6','#8b5cf6','#ec4899','#14b8a6']

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [drawer, setDrawer] = useState(null)
  const [selected, setSelected] = useState(null)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const [{ data: p }, { data: t }] = await Promise.all([
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('tasks').select('id,project_id,status,priority,assigned_role'),
    ])
    setProjects(p || [])
    setTasks(t || [])
    setLoading(false)
    if (p?.length > 0 && !selected) setSelected(p[0].id)
  }

  function getProjectTasks(pid) { return tasks.filter(t => t.project_id === pid) }

  async function handleSave(form) {
    const payload = { ...form, due_date: form.due_date || null }
    delete payload.id; delete payload.created_at; delete payload.updated_at; delete payload.task_counter
    if (drawer?.id) {
      const { data } = await supabase.from('projects').update(payload).eq('id', drawer.id).select().single()
      setProjects(prev => prev.map(p => p.id === data.id ? data : p))
    } else {
      const { data } = await supabase.from('projects').insert(payload).select().single()
      setProjects(prev => [data, ...prev])
    }
    setDrawer(null)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this project? Tasks will become general tasks.')) return
    await supabase.from('projects').delete().eq('id', id)
    setProjects(prev => prev.filter(p => p.id !== id))
    if (selected === id) setSelected(projects.find(p => p.id !== id)?.id || null)
    setDrawer(null)
  }

  if (loading) return <div className="flex-1 flex items-center justify-center"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>

  const selProject = projects.find(p => p.id === selected)
  const selTasks = selected ? getProjectTasks(selected) : []

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <Topbar title="Projects" action={{ label: 'New Project', onClick: () => setDrawer({}) }} />
      <div className="flex-1 flex overflow-hidden">

        {/* Left — project list */}
        <div className="w-72 border-r border-slate-200 bg-white flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">All Projects ({projects.length})</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {projects.map(p => {
              const ptasks = getProjectTasks(p.id)
              const isActive = selected === p.id
              return (
                <div key={p.id} onClick={() => setSelected(p.id)}
                  className={`rounded-xl p-3.5 cursor-pointer border transition-all ${isActive ? 'border-indigo-300 bg-indigo-50/60' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background: p.color }}>
                      {p.code.slice(0,2)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{p.name}</p>
                      <p className="text-[10px] font-mono text-slate-400">{p.code}</p>
                    </div>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1.5">
                    <div className="h-full rounded-full" style={{ width: `${p.progress}%`, background: p.color }} />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{ptasks.length} tasks</span>
                    <span className="font-semibold" style={{ color: p.color }}>{p.progress}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right — project detail */}
        <div className="flex-1 overflow-y-auto p-6">
          {selProject ? (
            <>
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold"
                    style={{ background: selProject.color }}>{selProject.code.slice(0,2)}</div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">{selProject.name}</h2>
                    <p className="text-sm text-slate-500 mt-0.5">{selProject.description || 'No description'}</p>
                    {selProject.due_date && (
                      <p className="text-xs text-slate-400 mt-1">Due {format(new Date(selProject.due_date), 'dd MMM yyyy')}</p>
                    )}
                  </div>
                </div>
                <button onClick={() => setDrawer(selProject)} className="btn-secondary text-xs">Edit Project</button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-3 mb-6">
                {[
                  { label: 'Total Tasks', value: selTasks.length, icon: CheckSquare, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                  { label: 'In Progress', value: selTasks.filter(t => ['In Development','In Analysis','In Discussion'].includes(t.status)).length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
                  { label: 'In Review', value: selTasks.filter(t => t.status === 'In Review').length, icon: FolderOpen, color: 'text-blue-500', bg: 'bg-blue-50' },
                  { label: 'Deployed', value: selTasks.filter(t => t.status === 'Deployed').length, icon: Rocket, color: 'text-green-500', bg: 'bg-green-50' },
                ].map(s => {
                  const Icon = s.icon
                  return (
                    <div key={s.label} className="card p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-500">{s.label}</span>
                        <div className={`w-7 h-7 ${s.bg} rounded-lg flex items-center justify-center`}><Icon size={13} className={s.color} /></div>
                      </div>
                      <p className="text-2xl font-semibold text-slate-800">{s.value}</p>
                    </div>
                  )
                })}
              </div>

              {/* Progress bar */}
              <div className="card p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-slate-700">Overall Progress</span>
                  <span className="text-sm font-bold" style={{ color: selProject.color }}>{selProject.progress}%</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${selProject.progress}%`, background: selProject.color }} />
                </div>
              </div>

              {/* Task breakdown by status */}
              <div className="card overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200">
                  <span className="text-sm font-semibold text-slate-700">Task Breakdown</span>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                      <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Count</th>
                      <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide">By Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['Incoming','In Analysis','In Discussion','In Development','In Review','Deployed','On Hold'].map(st => {
                      const stTasks = selTasks.filter(t => t.status === st)
                      if (stTasks.length === 0) return null
                      const byRole = stTasks.reduce((acc, t) => { acc[t.assigned_role] = (acc[t.assigned_role]||0)+1; return acc }, {})
                      return (
                        <tr key={st} className="border-b border-slate-100">
                          <td className="px-4 py-2.5 text-sm text-slate-700 font-medium">{st}</td>
                          <td className="px-4 py-2.5 font-semibold text-slate-800">{stTasks.length}</td>
                          <td className="px-4 py-2.5">
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(byRole).map(([role, cnt]) => (
                                <span key={role} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{role}: {cnt}</span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">Select a project</div>
          )}
        </div>
      </div>

      {drawer !== null && (
        <ProjectDrawer
          project={drawer?.id ? drawer : null}
          onClose={() => setDrawer(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}

function ProjectDrawer({ project, onClose, onSave, onDelete }) {
  const isNew = !project?.id
  const [form, setForm] = useState({
    name: '', code: '', description: '', status: 'active',
    due_date: '', color: '#6366f1', progress: 0,
    ...project,
    due_date: project?.due_date || '',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="w-[420px] bg-white h-full flex flex-col shadow-2xl">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center">
          <p className="text-sm font-semibold text-slate-800 flex-1">{isNew ? 'New Project' : 'Edit Project'}</p>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400"><X size={15} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div>
            <label className="label">Project Name *</label>
            <input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Onboarding Portal" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Project Code *</label>
              <input className="input font-mono uppercase" value={form.code} onChange={e => set('code', e.target.value.toUpperCase().slice(0,6))} placeholder="ONB" />
              <p className="text-[10px] text-slate-400 mt-1">Used for task IDs e.g. ONB-001</p>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="select" value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input min-h-[80px] resize-none" value={form.description} onChange={e => set('description', e.target.value)} placeholder="What is this project about?" />
          </div>
          <div>
            <label className="label">Due Date</label>
            <input type="date" className="input" value={form.due_date} onChange={e => set('due_date', e.target.value)} />
          </div>
          <div>
            <label className="label">Color</label>
            <div className="flex gap-2 flex-wrap">
              {PROJECT_COLORS.map(c => (
                <button key={c} onClick={() => set('color', c)}
                  className={`w-7 h-7 rounded-lg transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''}`}
                  style={{ background: c }} />
              ))}
            </div>
          </div>
        </div>
        <div className="px-5 py-3.5 border-t border-slate-200 flex items-center gap-2">
          {!isNew && (
            <button onClick={() => onDelete(project.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500">
              <Trash2 size={15} />
            </button>
          )}
          <div className="flex-1" />
          <button onClick={onClose} className="btn-secondary text-xs py-1.5">Cancel</button>
          <button onClick={() => onSave(form)} className="btn-primary text-xs py-1.5">
            <Save size={13} />{isNew ? 'Create Project' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
