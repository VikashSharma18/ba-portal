export const STATUSES = [
  { value: 'Incoming', color: 'bg-blue-50 text-blue-700', dot: 'bg-blue-400' },
  { value: 'In Analysis', color: 'bg-indigo-50 text-indigo-700', dot: 'bg-indigo-400' },
  { value: 'In Discussion', color: 'bg-purple-50 text-purple-700', dot: 'bg-purple-400' },
  { value: 'In Development', color: 'bg-amber-50 text-amber-700', dot: 'bg-amber-400' },
  { value: 'In Review', color: 'bg-cyan-50 text-cyan-700', dot: 'bg-cyan-400' },
  { value: 'Deployed', color: 'bg-green-50 text-green-700', dot: 'bg-green-400' },
  { value: 'On Hold', color: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
  { value: 'Cancelled', color: 'bg-red-50 text-red-600', dot: 'bg-red-400' },
]

export const PRIORITIES = [
  { value: 'Critical', color: 'bg-red-50 text-red-700', dot: 'bg-red-500' },
  { value: 'High', color: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  { value: 'Medium', color: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500' },
  { value: 'Low', color: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
]

export const ROLES = [
  { value: 'BA', color: 'bg-indigo-50 text-indigo-700', avatar: 'bg-indigo-500' },
  { value: 'Backend Dev', color: 'bg-amber-50 text-amber-700', avatar: 'bg-amber-500' },
  { value: 'Frontend Dev', color: 'bg-emerald-50 text-emerald-700', avatar: 'bg-emerald-500' },
  { value: 'Stakeholder', color: 'bg-slate-100 text-slate-600', avatar: 'bg-slate-400' },
  { value: 'Client', color: 'bg-pink-50 text-pink-700', avatar: 'bg-pink-400' },
]

export const TASK_TYPES = [
  'Requirement', 'Bug', 'Change Request', 'Internal', 'Documentation',
  'Compliance Change', 'API Spec', 'Insurer Request', 'Process Update'
]

export const SOURCES = ['Email', 'Meeting', 'Stakeholder Request', 'Internal', 'Client Call']

export const TEAM_MEMBERS = [
  { name: 'Vikash (You)', role: 'BA' },
  { name: 'Rahul', role: 'Frontend Dev' },
  { name: 'Chandan', role: 'Backend Dev' },
  { name: 'Mayank', role: 'Stakeholder' },
  { name: 'Rupal', role: 'Client' },
]

export const getStatus = (value) => STATUSES.find(s => s.value === value) || STATUSES[0]
export const getPriority = (value) => PRIORITIES.find(p => p.value === value) || PRIORITIES[2]
export const getRole = (value) => ROLES.find(r => r.value === value) || ROLES[0]

export const KANBAN_COLUMNS = ['Incoming', 'In Analysis', 'In Discussion', 'In Development', 'In Review', 'Deployed']
