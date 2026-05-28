import { Bell, Search, Plus } from 'lucide-react'
import { format } from 'date-fns'

export default function Topbar({ title, action }) {
  return (
    <div className="h-14 bg-white border-b border-slate-200/80 px-6 flex items-center gap-4 sticky top-0 z-10">
      <h1 className="text-[15px] font-semibold text-slate-800 flex-1">{title}</h1>

      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        {format(new Date(), 'EEE, dd MMM yyyy')}
      </div>

      <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition-colors relative">
        <Bell size={16} />
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
      </button>

      {action && (
        <button onClick={action.onClick} className="btn-primary text-xs py-1.5 px-3">
          <Plus size={14} />
          {action.label}
        </button>
      )}
    </div>
  )
}
