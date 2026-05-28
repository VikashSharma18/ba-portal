import Topbar from '../components/layout/Topbar'
import { Construction } from 'lucide-react'

export default function ComingSoon({ title, description, icon }) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <Topbar title={title} />
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-12">
        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-3xl mb-2">
          {icon || '🔧'}
        </div>
        <h2 className="text-lg font-semibold text-slate-700">{title} — Coming Soon</h2>
        <p className="text-sm text-slate-400 max-w-md">
          {description || `The ${title} module is planned and will be built in the next phase. All data structures are already defined in the database.`}
        </p>
        <div className="flex items-center gap-2 text-xs text-indigo-500 bg-indigo-50 px-4 py-2 rounded-full mt-2">
          <Construction size={13} />
          Module in planning — foundation is ready
        </div>
      </div>
    </div>
  )
}
