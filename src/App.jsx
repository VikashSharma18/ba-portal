import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import Projects from './pages/Projects'
import Tracker from './pages/Tracker'
import ComingSoon from './pages/ComingSoon'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/tracker" element={<Tracker />} />
            <Route path="/brds" element={<ComingSoon title="BRDs & Docs" icon="📄" description="BRD management, FRD, SOP, version history and approval flows. Built in Phase 2." />} />
            <Route path="/stakeholders" element={<ComingSoon title="Stakeholders" icon="👥" description="Stakeholder registry, communication logs, and client notes. Built in Phase 3." />} />
            <Route path="/meetings" element={<ComingSoon title="Meetings" icon="📅" description="MOM creation, action items, meeting calendar and follow-up tracker. Built in Phase 3." />} />
            <Route path="/insurance" element={<ComingSoon title="Insurance Ops" icon="🛡️" description="Claim workflow tracking, insurer communication, escalation tracker. Built in Phase 4." />} />
            <Route path="/reports" element={<ComingSoon title="Reports" icon="📊" description="Project health, productivity reports, team performance analytics. Built in Phase 5." />} />
            <Route path="/knowledge" element={<ComingSoon title="Knowledge Base" icon="📚" description="SOP repository, internal documentation, templates and learning resources. Built in Phase 5." />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}
