import { getStatus, getPriority, getRole } from '../../lib/constants'
import { Calendar, User } from 'lucide-react'
import { format, isPast, isToday } from 'date-fns'

export default function TaskCard({ task, onClick }) {
  const status = getStatus(task.status)
  const priority = getPriority(task.priority)
  const role = getRole(task.assigned_role)

  const isOverdue = task.due_date && isPast(new Date(task.due_date)) && task.status !== 'Deployed' && task.status !== 'Cancelled'
  const isDueToday = task.due_date && isToday(new Date(task.due_date))

  const initials = task.assigned_to?.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase() || '?'

  return (
    <div onClick={() => onClick(task)}
      className="bg-white border border-slate-200/80 rounded-xl p-3.5 cursor-pointer hover:border-indigo-300 hover:shadow-sm transition-all group">
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <span className="text-[10px] font-mono text-slate-400">{task.task_id}</span>
        <span className={`badge ${priority.color} text-[10px]`}>{task.priority}</span>
      </div>

      <p className="text-sm font-medium text-slate-800 leading-snug mb-3 group-hover:text-indigo-700 transition-colors line-clamp-2">
        {task.title}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className={`w-5 h-5 rounded-full ${role.avatar} flex items-center justify-center text-white text-[9px] font-semibold`}>
            {initials}
          </div>
          <span className={`badge ${role.color} text-[10px]`}>{task.assigned_role}</span>
        </div>

        {task.due_date && (
          <div className={`flex items-center gap-1 text-[10px] font-medium ${
            isOverdue ? 'text-red-600' : isDueToday ? 'text-amber-600' : 'text-slate-400'
          }`}>
            <Calendar size={10} />
            {format(new Date(task.due_date), 'dd MMM')}
          </div>
        )}
      </div>

      {task.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2.5">
          {task.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>
      )}

      {task.progress > 0 && (
        <div className="mt-2.5">
          <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-400 rounded-full transition-all" style={{ width: `${task.progress}%` }} />
          </div>
        </div>
      )}
    </div>
  )
}
