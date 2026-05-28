import { useState, useEffect } from 'react'
import { X, Save, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { STATUSES, PRIORITIES, ROLES, TASK_TYPES, SOURCES, TEAM_MEMBERS } from '../../lib/constants'

export default function TaskDrawer({ task, projects, onClose, onSaved, onDeleted }) {
  const isNew = !task?.id
  const [form, setForm] = useState({
    title: '', description: '', type: 'Requirement', status: 'Incoming',
    priority: 'Medium', source: 'Internal', assigned_to: 'Vikash (You)',
    assigned_role: 'BA', stakeholder_name: '', project_id: '',
    due_date: '', reminder_date: '', tags: '', progress: 0,
    ...task,
    tags: task?.tags?.join(', ') || '',
    project_id: task?.project_id || '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function getNextTaskId(projectId) {
    if (!projectId) {
      const { data } = await supabase.from('tasks').select('task_id').like('task_id', 'GEN-%').order('task_id', { ascending: false }).limit(1)
      const last = data?.[0]?.task_id?.split('-')[1] || '000'
      return `GEN-${String(parseInt(last) + 1).padStart(3, '0')}`
    }
    const project = projects.find(p => p.id === projectId)
    const { data } = await supabase.from('tasks').select('task_id').like('task_id', `${project.code}-%`).order('task_id', { ascending: false }).limit(1)
    const last = data?.[0]?.task_id?.split('-')[1] || '000'
    return `${project.code}-${String(parseInt(last) + 1).padStart(3, '0')}`
  }

  async function handleSave() {
    if (!form.title.trim()) { setError('Title is required'); return }
    setSaving(true); setError('')
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        project_id: form.project_id || null,
        due_date: form.due_date || null,
        reminder_date: form.reminder_date || null,
        progress: parseInt(form.progress) || 0,
      }
      delete payload.id; delete payload.task_id; delete payload.created_at; delete payload.updated_at

      if (isNew) {
        payload.task_id = await getNextTaskId(form.project_id)
        const { data, error: err } = await supabase.from('tasks').insert(payload).select().single()
        if (err) throw err
        onSaved(data)
      } else {
        const { data, error: err } = await supabase.from('tasks').update(payload).eq('id', task.id).select().single()
        if (err) throw err
        onSaved(data)
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this task?')) return
    await supabase.from('tasks').delete().eq('id', task.id)
    onDeleted(task.id)
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="w-[480px] bg-white h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-3">
          <div className="flex-1">
            <p className="text-xs text-slate-400 font-mono">{isNew ? 'NEW TASK' : task.task_id}</p>
            <p className="text-sm font-semibold text-slate-800 mt-0.5 truncate">{form.title || 'Untitled Task'}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400">
            <X size={15} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg">{error}</div>}

          <div>
            <label className="label">Title *</label>
            <input className="input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Task title..." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Status</label>
              <select className="select" value={form.status} onChange={e => set('status', e.target.value)}>
                {STATUSES.map(s => <option key={s.value}>{s.value}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select className="select" value={form.priority} onChange={e => set('priority', e.target.value)}>
                {PRIORITIES.map(p => <option key={p.value}>{p.value}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Type</label>
              <select className="select" value={form.type} onChange={e => set('type', e.target.value)}>
                {TASK_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Source</label>
              <select className="select" value={form.source} onChange={e => set('source', e.target.value)}>
                {SOURCES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Assigned To</label>
              <select className="select" value={form.assigned_to} onChange={e => {
                const member = TEAM_MEMBERS.find(m => m.name === e.target.value)
                set('assigned_to', e.target.value)
                if (member) set('assigned_role', member.role)
              }}>
                {TEAM_MEMBERS.map(m => <option key={m.name}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Role</label>
              <select className="select" value={form.assigned_role} onChange={e => set('assigned_role', e.target.value)}>
                {ROLES.map(r => <option key={r.value}>{r.value}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Project</label>
            <select className="select" value={form.project_id} onChange={e => set('project_id', e.target.value)}>
              <option value="">No Project (General)</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
            </select>
          </div>

          <div>
            <label className="label">Stakeholder / Client Name</label>
            <input className="input" value={form.stakeholder_name} onChange={e => set('stakeholder_name', e.target.value)} placeholder="Who raised this?" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Due Date</label>
              <input type="date" className="input" value={form.due_date} onChange={e => set('due_date', e.target.value)} />
            </div>
            <div>
              <label className="label">Reminder Date</label>
              <input type="date" className="input" value={form.reminder_date} onChange={e => set('reminder_date', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="label">Progress ({form.progress}%)</label>
            <input type="range" min="0" max="100" step="5" value={form.progress}
              onChange={e => set('progress', e.target.value)}
              className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-500" />
          </div>

          <div>
            <label className="label">Tags (comma separated)</label>
            <input className="input" value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="kyc, api, brd, frontend..." />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea className="input min-h-[100px] resize-none" value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Paste email content, notes, requirements..." />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-200 flex items-center gap-2">
          {!isNew && (
            <button onClick={handleDelete} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
              <Trash2 size={15} />
            </button>
          )}
          <div className="flex-1" />
          <button onClick={onClose} className="btn-secondary text-xs py-1.5">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary text-xs py-1.5">
            <Save size={13} />
            {saving ? 'Saving...' : 'Save Task'}
          </button>
        </div>
      </div>
    </div>
  )
}
