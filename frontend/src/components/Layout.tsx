import { useState, useEffect } from 'react'
import { NavLink as RouterNavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, UserRound, FileText, Map, CalendarDays, 
  Code2, ClipboardCheck, BarChart3, Bot, Sparkles, FileSpreadsheet, 
  Settings, Menu, X, BrainCircuit, ChevronRight, Sun, Moon, Search, LogOut, Flame,
  LayoutGrid, BookOpen, Video, Users, Bell, HelpCircle, ArrowUpRight, Wrench, RefreshCw, Upload
} from 'lucide-react'
import { getHealth, getProfile } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [healthy, setHealthy] = useState(true)
  const [profile, setProfile] = useState<any>()
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  useEffect(() => {
    getHealth()
      .then(() => setHealthy(true))
      .catch(() => setHealthy(false))
    getProfile()
      .then(res => setProfile(res.data))
      .catch(() => {})
  }, [user])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  // Format current date matching Mindrift Image 2: e.g. "Thu, Feb 26" or "Saturday, Sep 19"
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })

  return (
    <div className="min-h-screen bg-[#eceeef] text-slate-900 flex flex-col md:flex-row font-sans p-3 sm:p-4 md:p-6 gap-4 sm:gap-6 selection:bg-blue-500/20 selection:text-blue-600">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden animate-fadeIn"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Navigation - Mindrift Floating Card Style */}
      <aside className={`
        fixed md:sticky top-4 inset-y-0 left-0 z-50 w-64 bg-white border border-slate-200/90 p-5 rounded-[24px] md:h-[calc(100vh-32px)]
        transform transition-transform duration-300 ease-in-out shrink-0 flex flex-col justify-between shadow-sm
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex flex-col h-full min-h-0">
          {/* Logo Header */}
          <div className="flex items-center justify-between pb-5 border-b border-slate-100">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/30">
                <BrainCircuit size={22} className="text-white" />
              </div>
              <div className="font-display font-black text-xl tracking-tight text-slate-900 flex items-center gap-1">
                EduPath<span className="text-xs text-blue-600 font-mono font-bold">AI</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button 
                className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100" 
                onClick={() => setMobileOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Nav Scroll Area */}
          <div className="overflow-y-auto flex-1 py-4 pr-1 space-y-6 custom-scrollbar">
            {/* GENERAL section */}
            <div className="space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2 font-mono">
                GENERAL
              </div>
              
              <RouterNavLink
                to="/dashboard"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `
                  flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-150
                  ${isActive 
                    ? 'bg-white text-slate-900 font-bold shadow-md shadow-slate-200/80 border border-slate-100' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard size={18} className="text-slate-700 shrink-0" />
                  <span>Dashboard</span>
                </div>
              </RouterNavLink>

              <RouterNavLink
                to="/resume-analyzer"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `
                  flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-150
                  ${isActive 
                    ? 'bg-white text-slate-900 font-bold shadow-md shadow-slate-200/80 border border-slate-100' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-slate-500 shrink-0" />
                  <span>Resume Analyzer</span>
                </div>
                {profile?.resume_uploaded && (
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                )}
              </RouterNavLink>

              <RouterNavLink
                to="/skill-gap"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `
                  flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-150
                  ${isActive 
                    ? 'bg-white text-slate-900 font-bold shadow-md shadow-slate-200/80 border border-slate-100' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Sparkles size={18} className="text-slate-500 shrink-0" />
                  <span>Skill Gap Agent</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 text-[10px] font-bold">
                  Active
                </span>
              </RouterNavLink>

              <RouterNavLink
                to="/roadmap"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `
                  flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-150
                  ${isActive 
                    ? 'bg-white text-slate-900 font-bold shadow-md shadow-slate-200/80 border border-slate-100' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Map size={18} className="text-slate-500 shrink-0" />
                  <span>Roadmap</span>
                </div>
              </RouterNavLink>

              <RouterNavLink
                to="/weekly-plan"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `
                  flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-150
                  ${isActive 
                    ? 'bg-white text-slate-900 font-bold shadow-md shadow-slate-200/80 border border-slate-100' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <CalendarDays size={18} className="text-slate-500 shrink-0" />
                  <span>Weekly Plan</span>
                </div>
              </RouterNavLink>

              <RouterNavLink
                to="/profile"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `
                  flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-150
                  ${isActive 
                    ? 'bg-white text-slate-900 font-bold shadow-md shadow-slate-200/80 border border-slate-100' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <UserRound size={18} className="text-slate-500 shrink-0" />
                  <span>My Profile</span>
                </div>
              </RouterNavLink>
            </div>

            {/* LEARNING TOOLS section */}
            <div className="space-y-1 pt-2 border-t border-slate-100">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2 font-mono">
                LEARNING TOOLS
              </div>

              <RouterNavLink
                to="/learning-tools"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `
                  flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-150
                  ${isActive 
                    ? 'bg-white text-slate-900 font-bold shadow-md shadow-slate-200/80 border border-slate-100' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <BookOpen size={18} className="text-blue-600 shrink-0" />
                  <span>Learning Tools Hub</span>
                </div>
                <span className="px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold">
                  AI
                </span>
              </RouterNavLink>

              <RouterNavLink
                to="/practice"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `
                  flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-150
                  ${isActive 
                    ? 'bg-white text-slate-900 font-bold shadow-md shadow-slate-200/80 border border-slate-100' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Code2 size={18} className="text-slate-500 shrink-0" />
                  <span>Practice Hub</span>
                </div>
              </RouterNavLink>

              <RouterNavLink
                to="/assessment"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `
                  flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-150
                  ${isActive 
                    ? 'bg-white text-slate-900 font-bold shadow-md shadow-slate-200/80 border border-slate-100' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <ClipboardCheck size={18} className="text-slate-500 shrink-0" />
                  <span>Assessments</span>
                </div>
              </RouterNavLink>

              <RouterNavLink
                to="/progress"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `
                  flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-150
                  ${isActive 
                    ? 'bg-white text-slate-900 font-bold shadow-md shadow-slate-200/80 border border-slate-100' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <BarChart3 size={18} className="text-slate-500 shrink-0" />
                  <span>Analytics</span>
                </div>
              </RouterNavLink>

              <RouterNavLink
                to="/reports"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `
                  flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-150
                  ${isActive 
                    ? 'bg-white text-slate-900 font-bold shadow-md shadow-slate-200/80 border border-slate-100' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <FileSpreadsheet size={18} className="text-slate-500 shrink-0" />
                  <span>Executive Reports</span>
                </div>
              </RouterNavLink>
            </div>

            {/* SETTINGS & SUPPORT section */}
            <div className="space-y-1 pt-2 border-t border-slate-100">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2 font-mono">
                SETTINGS & SUPPORT
              </div>

              <RouterNavLink
                to="/assistant"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `
                  flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-150
                  ${isActive 
                    ? 'bg-white text-slate-900 font-bold shadow-md shadow-slate-200/80 border border-slate-100' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Bot size={18} className="text-slate-500 shrink-0" />
                  <span>AI Assistant</span>
                </div>
              </RouterNavLink>

              <RouterNavLink
                to="/settings"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `
                  flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-150
                  ${isActive 
                    ? 'bg-white text-slate-900 font-bold shadow-md shadow-slate-200/80 border border-slate-100' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Settings size={18} className="text-slate-500 shrink-0" />
                  <span>Settings</span>
                </div>
              </RouterNavLink>
            </div>
          </div>

          {/* User Profile Card Footer */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
              <div 
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black flex items-center justify-center text-xs shadow-sm shrink-0">
                  {profile?.name?.charAt(0) || user?.name?.charAt(0) || 'L'}
                </div>
                <div className="truncate min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 truncate">{profile?.name || user?.name || 'Learner'}</div>
                  <div className="text-[10px] text-blue-700 font-semibold truncate">{profile?.target_role || user?.target_role || 'Data Scientist'}</div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Sign Out / Switch Profile"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Header matching Mindrift Image 2 */}
        <header className="py-2 px-1 flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-xl bg-white border border-slate-200 text-slate-700 cursor-pointer"
            >
              <Menu size={20} />
            </button>
            <div>
              <div className="text-xs text-slate-400 font-medium">Welcome back!</div>
              <h1 className="font-display font-extrabold text-2xl text-slate-900 tracking-tight mt-0.5">
                {formattedDate}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{profile?.target_role || user?.target_role || 'Data Scientist'}</span>
            </div>

            <button
              onClick={() => navigate('/resume-analyzer')}
              className="px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Upload size={13} />
              <span className="hidden sm:inline">Sync Resume</span>
            </button>
          </div>
        </header>

        <div className="flex-1 animate-fadeIn">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
