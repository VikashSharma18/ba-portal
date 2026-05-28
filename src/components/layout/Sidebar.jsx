import { useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, CheckSquare, FolderOpen, Table2,
  FileText, Users, CalendarDays, Shield, BarChart3,
  BookOpen, Settings, Briefcase, ChevronRight
} from 'lucide-react'

const navItems = [
  { section: 'Main', items: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { label: 'Tasks', icon: CheckSquare, path: '/tasks', badge: null },
    { label: 'Projects', icon: FolderOpen, path: '/projects' },
    { label: 'Tracker', icon: Table2, path: '/tracker' },
  ]},
  { section: 'Work', items: [
    { label: 'BRDs & Docs', icon: FileText, path: '/brds' },
    { label: 'Stakeholders', icon: Users, path: '/stakeholders' },
    { label: 'Meetings', icon: CalendarDays, path: '/meetings' },
    { label: 'Insurance Ops', icon: Shield, path: '/insurance' },
  ]},
  { section: 'Insights', items: [
    { label: 'Reports', icon: BarChart3, path: '/reports' },
    { label: 'Knowledge Base', icon: BookOpen, path: '/knowledge' },
  ]},
]

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div className="w-56 min-w-[224px] bg-slate-900 flex flex-col h-screen sticky top-0">
      {/* Logo -*/}
      <div className="px-4 py-5 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
            <Briefcase size={15} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-100 leading-tight">BA Portal</p>
            <p className="text-[10px] text-slate-500 leading-tight mt-0.5">Across Assist</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-3 px-2">
        {navItems.map(group => (
          <div key={group.section} className="mb-4">
            <p className="px-3 mb-1 text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
              {group.section}
            </p>
            {group.items.map(item => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <div
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`sidebar-item ${isActive ? 'active' : ''}`}
                >
                  <Icon size={16} />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="bg-white/15 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight size={12} className="opacity-60" />}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Bottom user */}
      <div className="p-3 border-t border-white/8">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/5 cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-semibold">
            VS
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-200 font-medium truncate">Vikash Sharma</p>
            <p className="text-[10px] text-slate-500">Business Analyst</p>
          </div>
          <Settings size={13} className="text-slate-600" />
        </div>
      </div>
    </div>
  )
}
