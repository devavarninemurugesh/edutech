import { useEffect, useState } from 'react'
import { Card, Badge, Progress, SkeletonLoader } from '../components/UI'
import { LogoLoader } from '../components/LogoLoader'
import { getWeeklyPlan, completeTask, createWeeklyTask } from '../services/api'
import { 
  Calendar, CheckCircle2, Clock, Sparkles, Filter, PlayCircle, 
  ChevronLeft, ChevronRight, Plus, CalendarDays, LayoutGrid, 
  ListFilter, CheckSquare, X, Flame, AlertCircle, ArrowRight,
  Search, Bell, Globe, Check, Eye
} from 'lucide-react'

type ViewMode = 'MONTH' | 'WEEK' | 'DAY'
type FilterType = 'ALL' | 'PENDING' | 'COMPLETED' | 'learning' | 'practice' | 'assessment' | 'project'

export default function WeeklyPlan() {
  const [weekly, setWeekly] = useState<any>()
  const [loading, setLoading] = useState(true)
  const [weekOffset, setWeekOffset] = useState(0)
  const [viewMode, setViewMode] = useState<ViewMode>('WEEK')
  const [filter, setFilter] = useState<FilterType>('ALL')
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0)
  
  // Custom Event Modal State
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<any>(null)
  
  const [newTitle, setNewTitle] = useState('')
  const [newType, setNewType] = useState('learning')
  const [newDay, setNewDay] = useState('Mon')
  const [newTimeSlot, setNewTimeSlot] = useState('13:00 - 14:00')
  const [newMinutes, setNewMinutes] = useState(60)
  const [newDescription, setNewDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadWeeklyPlan = (offset = weekOffset) => {
    setLoading(true)
    getWeeklyPlan(offset)
      .then(res => {
        setWeekly(res.data)
        const todayItemIdx = res.data?.days?.findIndex((d: any) => d.is_today)
        if (todayItemIdx !== undefined && todayItemIdx >= 0) {
          setSelectedDayIndex(todayItemIdx)
        }
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadWeeklyPlan(weekOffset)
  }, [weekOffset])

  const handleComplete = async (taskId: string) => {
    await completeTask(taskId)
    loadWeeklyPlan(weekOffset)
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    setSubmitting(true)
    try {
      await createWeeklyTask({
        title: newTitle,
        type: newType,
        day: newDay,
        time_slot: newTimeSlot,
        minutes: Number(newMinutes),
        description: newDescription
      })
      setShowAddModal(false)
      setNewTitle('')
      setNewDescription('')
      loadWeeklyPlan(weekOffset)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading && !weekly) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <LogoLoader 
          size="lg"
          text="Loading Task Calendar..." 
          subtext="Structuring day-by-day learning schedule with Gemini AI" 
        />
      </div>
    )
  }

  const tasks = weekly?.tasks || []
  const days = weekly?.days || []
  const focus = weekly?.focus || 'Python'

  const completedCount = tasks.filter((t: any) => t.status === 'COMPLETED').length
  const totalCount = tasks.length
  const percentDone = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  // Calculate current Month and Year label (e.g. OCTOBER 2025 or SEPTEMBER 2026)
  const currentWeekDate = new Date()
  currentWeekDate.setDate(currentWeekDate.getDate() + (weekOffset * 7))
  const monthYearLabel = currentWeekDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()

  // Time slots matching screenshot layout
  const timeSlots = [
    'All-day', '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', 
    '19:00', '20:00', '21:00', '22:00', '23:00'
  ]

  // Helper to map task time slot to hour row
  const getTaskSlotHour = (timeSlotStr: string): string => {
    if (!timeSlotStr || timeSlotStr.toLowerCase().includes('all-day')) return 'All-day'
    if (timeSlotStr.includes('08:')) return '08:00'
    if (timeSlotStr.includes('09:')) return '09:00'
    if (timeSlotStr.includes('10:')) return '10:00'
    if (timeSlotStr.includes('11:')) return '11:00'
    if (timeSlotStr.includes('12:')) return '12:00'
    if (timeSlotStr.includes('01:') || timeSlotStr.includes('13:')) return '13:00'
    if (timeSlotStr.includes('02:') || timeSlotStr.includes('14:')) return '14:00'
    if (timeSlotStr.includes('03:') || timeSlotStr.includes('15:')) return '15:00'
    if (timeSlotStr.includes('04:') || timeSlotStr.includes('16:')) return '16:00'
    if (timeSlotStr.includes('05:') || timeSlotStr.includes('17:')) return '17:00'
    if (timeSlotStr.includes('06:') || timeSlotStr.includes('18:')) return '18:00'
    if (timeSlotStr.includes('07:') || timeSlotStr.includes('19:')) return '19:00'
    if (timeSlotStr.includes('08:') || timeSlotStr.includes('20:')) return '20:00'
    if (timeSlotStr.includes('09:') || timeSlotStr.includes('21:')) return '21:00'
    if (timeSlotStr.includes('10:') || timeSlotStr.includes('22:')) return '22:00'
    if (timeSlotStr.includes('11:') || timeSlotStr.includes('23:')) return '23:00'
    return '12:00'
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-fadeIn pb-12 font-sans">
      
      {/* Top Header & Breadcrumb Bar matching Screenshot */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="text-xs font-semibold text-slate-400 tracking-wide">
            Dashboard &gt; <span className="text-slate-800 font-bold">Task Calendar</span>
          </div>
          <h1 className="font-display text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Task Calendar
          </h1>
        </div>

        {/* Top Controls: Search, Notifications, Language, Profile */}
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              className="pl-9 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-44"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-semibold text-slate-400 bg-slate-200/60 px-1 rounded">⌘ + /</span>
          </div>

          <button className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors">
            <Bell size={18} />
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors">
            <Globe size={15} className="text-slate-500" />
            <span>English</span>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <Plus size={16} /> Add Task
          </button>
        </div>
      </div>

      {/* Main Task Calendar Container Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-6 space-y-6">
        
        {/* Calendar Navigation & View Selector Bar (Screenshot Standard) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-100">
          
          {/* Arrow Navigation & Today Button Group */}
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-xl shadow-sm">
              <button 
                onClick={() => setWeekOffset(prev => prev - 1)}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-l-xl transition-colors flex items-center justify-center border-r border-blue-500"
                title="Previous Week"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                onClick={() => setWeekOffset(prev => prev + 1)}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-r-xl transition-colors flex items-center justify-center"
                title="Next Week"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <button 
              onClick={() => setWeekOffset(0)}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-sm"
            >
              Today
            </button>
          </div>

          {/* Month / Year Center Title */}
          <div className="font-display font-extrabold text-slate-900 text-lg md:text-xl tracking-wider text-center uppercase">
            {monthYearLabel}
          </div>

          {/* View Mode Segmented Switcher: Month | Week | Day */}
          <div className="inline-flex rounded-xl border border-slate-200 p-1 bg-white shadow-sm shrink-0">
            <button
              onClick={() => setViewMode('MONTH')}
              className={`px-5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'MONTH'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('WEEK')}
              className={`px-5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'WEEK'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('DAY')}
              className={`px-5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'DAY'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Day
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* VIEW 1: WEEKLY TIMETABLE GRID (Matching Screenshot)       */}
        {/* ======================================================== */}
        {viewMode === 'WEEK' && (
          <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
            <table className="w-full border-collapse min-w-[900px] text-left">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-700 text-xs font-extrabold uppercase tracking-wider">
                  <th className="p-3 w-28 text-center text-slate-400 font-mono border-r border-slate-200">
                    (GMT-5)
                  </th>
                  {days.map((d: any, idx: number) => {
                    const isSelected = selectedDayIndex === idx
                    const dayParts = (d.date || '').split(' ')
                    const dateNum = dayParts.length > 1 ? dayParts[1] : d.date
                    
                    return (
                      <th 
                        key={d.day}
                        onClick={() => setSelectedDayIndex(idx)}
                        className={`p-3 text-center cursor-pointer border-r border-slate-200 transition-colors ${
                          isSelected ? 'bg-blue-50/80 text-blue-900 font-black' : 'hover:bg-slate-100/60'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1.5 text-sm">
                          <span className="font-bold">{d.day}</span>
                          <span className="font-extrabold text-base">{dateNum}</span>
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </thead>

              <tbody>
                {timeSlots.map((timeSlot) => (
                  <tr key={timeSlot} className="border-b border-slate-100 hover:bg-slate-50/30 transition-colors">
                    {/* Time Slot Label Column */}
                    <td className="p-2 text-center text-xs font-medium text-slate-400 font-mono border-r border-slate-200 bg-slate-50/40 select-none">
                      {timeSlot}
                    </td>

                    {/* Day Slot Cells */}
                    {days.map((d: any, dayIdx: number) => {
                      const isSelectedCol = selectedDayIndex === dayIdx
                      
                      // Filter tasks for this specific day and matching time slot hour
                      const slotTasks = d.tasks?.filter((t: any) => {
                        const taskHour = getTaskSlotHour(t.time_slot)
                        if (timeSlot === 'All-day') return t.time_slot?.toLowerCase().includes('all-day')
                        return taskHour === timeSlot
                      }) || []

                      return (
                        <td 
                          key={`${d.day}-${timeSlot}`}
                          className={`p-1.5 border-r border-slate-100 align-top h-16 min-w-[120px] transition-colors relative ${
                            isSelectedCol ? 'bg-cyan-50/30' : ''
                          }`}
                        >
                          {slotTasks.map((t: any) => (
                            <div
                              key={t.id}
                              onClick={() => setSelectedTaskDetail(t)}
                              className={`p-2.5 rounded-lg border text-xs shadow-sm transition-all cursor-pointer mb-1 ${
                                t.status === 'COMPLETED'
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900 line-through opacity-80'
                                  : isSelectedCol 
                                    ? 'bg-white border-cyan-300 text-slate-900 hover:border-cyan-500 shadow-md ring-1 ring-cyan-400/20'
                                    : 'bg-white border-slate-200 text-slate-800 hover:border-blue-400 hover:shadow-md'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-1 font-bold text-xs">
                                <span>{t.title}</span>
                                {t.status === 'COMPLETED' && <CheckCircle2 size={13} className="text-emerald-600 shrink-0 mt-0.5" />}
                              </div>
                              
                              <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                                <span>{t.time_slot}</span>
                                <span className={`px-1.5 py-0.2 rounded uppercase font-bold text-[9px] ${
                                  t.type === 'practice' ? 'bg-purple-100 text-purple-700' :
                                  t.type === 'assessment' ? 'bg-amber-100 text-amber-800' :
                                  t.type === 'project' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {t.type}
                                </span>
                              </div>
                            </div>
                          ))}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 2: MONTH GRID VIEW                                   */}
        {/* ======================================================== */}
        {viewMode === 'MONTH' && (
          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-extrabold text-slate-500 uppercase tracking-wider py-2 bg-slate-50 rounded-xl">
              <div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div><div>Sun</div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, idx) => {
                const dayNum = (idx % 31) + 1
                const dayCode = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx % 7]
                const dayData = days.find((d: any) => d.day === dayCode)
                const dayTasks = dayData?.tasks || []

                return (
                  <div 
                    key={idx} 
                    className="min-h-[100px] border border-slate-200 rounded-xl p-2 bg-white hover:border-blue-400 transition-all flex flex-col justify-between"
                  >
                    <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                      <span>{dayNum}</span>
                      {dayTasks.length > 0 && (
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                      )}
                    </div>

                    <div className="space-y-1 my-1">
                      {dayTasks.slice(0, 2).map((t: any) => (
                        <div key={t.id} className="text-[10px] font-semibold truncate bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded border border-blue-200">
                          {t.title}
                        </div>
                      ))}
                      {dayTasks.length > 2 && (
                        <div className="text-[9px] font-bold text-slate-400">+{dayTasks.length - 2} more</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 3: DAY SINGLE AGENDA VIEW                             */}
        {/* ======================================================== */}
        {viewMode === 'DAY' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-blue-50 border border-blue-200 p-4 rounded-2xl">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-blue-700">
                  {days[selectedDayIndex]?.full_name || 'Selected Day'} Schedule
                </div>
                <div className="text-lg font-black text-slate-900">
                  {days[selectedDayIndex]?.date || 'Current Date'}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {days.map((d: any, idx: number) => (
                  <button
                    key={d.day}
                    onClick={() => setSelectedDayIndex(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedDayIndex === idx ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {d.day}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {(days[selectedDayIndex]?.tasks || []).length === 0 ? (
                <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Calendar size={32} className="mx-auto mb-2 text-slate-300" />
                  <p className="font-semibold text-sm">No tasks scheduled for this day.</p>
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="mt-3 px-4 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold"
                  >
                    + Add Task
                  </button>
                </div>
              ) : (
                days[selectedDayIndex]?.tasks?.map((t: any) => (
                  <div 
                    key={t.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-white shadow-sm flex items-center justify-between gap-4 hover:border-blue-400 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleComplete(t.id)}
                        className={`h-6 w-6 rounded-lg border flex items-center justify-center transition-colors ${
                          t.status === 'COMPLETED' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 hover:border-blue-500'
                        }`}
                      >
                        {t.status === 'COMPLETED' && <Check size={14} />}
                      </button>

                      <div>
                        <div className={`font-bold text-sm text-slate-900 ${t.status === 'COMPLETED' ? 'line-through text-slate-400' : ''}`}>
                          {t.title}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1"><Clock size={13} /> {t.time_slot}</span>
                          <span>• {t.minutes} mins</span>
                          <span className="capitalize text-blue-600 font-semibold">{t.type}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedTaskDetail(t)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <Eye size={14} /> View Details
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Task Detail Modal */}
      {selectedTaskDetail && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">{selectedTaskDetail.type} Task</span>
                <h3 className="font-display font-extrabold text-xl text-slate-900 mt-0.5">{selectedTaskDetail.title}</h3>
              </div>
              <button onClick={() => setSelectedTaskDetail(null)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Day & Time:</span>
                <span className="font-bold text-slate-800">{selectedTaskDetail.day} ({selectedTaskDetail.time_slot})</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Duration:</span>
                <span className="font-bold text-slate-800">{selectedTaskDetail.minutes} mins</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Status:</span>
                <span className={`font-bold ${selectedTaskDetail.status === 'COMPLETED' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {selectedTaskDetail.status}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {selectedTaskDetail.description || 'Focus on completing this study module and practice exercises.'}
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  handleComplete(selectedTaskDetail.id)
                  setSelectedTaskDetail(null)
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedTaskDetail.status === 'COMPLETED'
                    ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {selectedTaskDetail.status === 'COMPLETED' ? 'Mark Pending' : 'Mark Completed ✓'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-display font-extrabold text-lg text-slate-900">Add New Calendar Task</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Call with Dave / Python Syntax Practice"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="learning">Learning</option>
                    <option value="practice">Practice</option>
                    <option value="assessment">Assessment</option>
                    <option value="project">Project</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Day</label>
                  <select
                    value={newDay}
                    onChange={e => setNewDay(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Mon">Mon</option>
                    <option value="Tue">Tue</option>
                    <option value="Wed">Wed</option>
                    <option value="Thu">Thu</option>
                    <option value="Fri">Fri</option>
                    <option value="Sat">Sat</option>
                    <option value="Sun">Sun</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Time Slot</label>
                  <select
                    value={newTimeSlot}
                    onChange={e => setNewTimeSlot(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="09:00 - 10:00">09:00 - 10:00</option>
                    <option value="10:00 - 11:00">10:00 - 11:00</option>
                    <option value="12:00 - 13:00">12:00 - 13:00</option>
                    <option value="13:00 - 14:00">13:00 - 14:00</option>
                    <option value="14:00 - 15:00">14:00 - 15:00</option>
                    <option value="15:00 - 16:00">15:00 - 16:00</option>
                    <option value="20:00 - 21:00">20:00 - 21:00</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Minutes</label>
                  <input
                    type="number"
                    value={newMinutes}
                    onChange={e => setNewMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  placeholder="Task goals and notes..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm"
                >
                  {submitting ? 'Saving...' : 'Save Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
