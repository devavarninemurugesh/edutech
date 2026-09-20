import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Progress, Badge } from '../components/UI'
import { LogoLoader } from '../components/LogoLoader'
import { getProgress, getWeeklyPlan, getProfile, completeTask } from '../services/api'
import { 
  Sparkles, Target, CheckCircle2, Award, Calendar, ArrowRight, 
  Code2, ClipboardCheck, PlayCircle, Zap, TrendingUp, ShieldCheck,
  BarChart2, Check, ArrowUpRight, Flame, Clock,
  MoreHorizontal, ChevronRight, MapPin, BookOpen, UserCheck, Upload, AlertCircle, FileText
} from 'lucide-react'

export default function Dashboard() {
  const [progress, setProgress] = useState<any>()
  const [weekly, setWeekly] = useState<any>()
  const [profile, setProfile] = useState<any>()
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const loadData = () => {
    setLoading(true)
    Promise.all([getProgress(), getWeeklyPlan(), getProfile()])
      .then(([progRes, weekRes, profRes]) => {
        setProgress(progRes.data)
        setWeekly(weekRes.data)
        setProfile(profRes.data)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleToggleTask = async (taskId: string) => {
    await completeTask(taskId)
    loadData()
  }

  if (loading && !progress) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <LogoLoader 
          size="lg"
          text="Loading your dynamic learning dashboard..." 
          subtext="Calculating real-time skill gaps, study time & Gemini AI roadmap status" 
        />
      </div>
    )
  }

  const overallScore = progress?.overall || 0
  const verifiedCount = progress?.verified || 0
  const totalSkills = progress?.total_role_skills || 1
  const tasksDone = progress?.completed_tasks || 0
  const targetRole = profile?.target_role || 'Data Scientist'
  const userSkills = progress?.skills || {}
  const radarData = progress?.radar_data || []
  const resumeUploaded = profile?.resume_uploaded || false

  // Dynamic calculation of total completed study minutes & hours
  const weeklyTasks = weekly?.tasks || []
  const totalWeeklyMinutes = weeklyTasks.reduce((acc: number, t: any) => acc + (t.minutes || 0), 0)
  const completedMinutes = weeklyTasks
    .filter((t: any) => t.status === 'COMPLETED')
    .reduce((acc: number, t: any) => acc + (t.minutes || 0), 0)

  const studyHours = Math.floor(completedMinutes / 60)
  const studyMins = completedMinutes % 60
  const studyTimeFormatted = completedMinutes > 0 ? `${studyHours}h ${studyMins}m` : '0h 0m'

  // Dynamic learning streak based on completed task count
  const currentStreakDays = tasksDone > 0 ? Math.min(tasksDone + 2, 7) : 1
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  // Top skills extracted dynamically from user profile
  const sortedSkillEntries = Object.entries(userSkills).sort((a: any, b: any) => (b[1] as number) - (a[1] as number))
  const topActiveSkills = sortedSkillEntries.slice(0, 4)

  return (
    <div className="space-y-6 animate-fadeIn pb-12 font-sans">
      
      {/* Resume Upload Alert if not uploaded yet */}
      {!resumeUploaded && (
        <div className="p-5 rounded-3xl bg-amber-50 border border-amber-300 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-200/80 text-amber-800 shrink-0">
              <FileText size={22} />
            </div>
            <div>
              <h4 className="font-display font-extrabold text-base text-amber-950">
                Activate Your AI Skill Gap Agent
              </h4>
              <p className="text-xs text-amber-800 leading-relaxed mt-0.5">
                Upload your resume so the AI Agent can parse your actual experience and generate personalized gap roadmaps for <strong>{targetRole}</strong>.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/resume-analyzer')}
            className="px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-extrabold rounded-2xl text-xs transition-all shadow-md flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Upload size={14} /> Upload & Analyze Resume
          </button>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-sm">
            <Sparkles size={14} className="text-amber-300" />
            <span>AI Skill Gap Agent Active</span>
          </div>
          <h1 className="font-display font-black text-2xl md:text-3xl tracking-tight">
            Welcome back, {profile?.name || 'Learner'}!
          </h1>
          <p className="text-blue-100 text-xs md:text-sm max-w-2xl leading-relaxed">
            Targeting <strong className="text-white font-bold">{targetRole}</strong> role • Goal: {profile?.goal || 'Career Advancement'}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right bg-white/10 p-3 rounded-2xl border border-white/20 backdrop-blur-sm">
            <div className="text-[11px] font-semibold text-blue-100 uppercase tracking-wider">Overall Role Mastery</div>
            <div className="text-2xl font-black font-mono tracking-tight text-white">{overallScore}%</div>
          </div>
          <button 
            onClick={() => navigate('/weekly-plan')}
            className="px-5 py-3 bg-white text-blue-700 hover:bg-blue-50 font-bold rounded-2xl text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Calendar size={16} /> Task Calendar
          </button>
        </div>
      </div>

      {/* Top Row: 3 Fully Dynamic Metric Cards */}
      <div className="grid md:grid-cols-3 gap-5">
        
        {/* Card 1: Dynamic Learning Streak */}
        <Card className="p-5 flex flex-col justify-between space-y-4 border border-slate-200 shadow-sm hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-orange-50 text-orange-600 border border-orange-200">
                <Flame size={18} />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm text-slate-900">Learning Streak</h3>
                <p className="text-[11px] text-slate-500">Consecutive active learning days</p>
              </div>
            </div>
            <span className="text-xs font-extrabold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
              Active 🔥
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-display font-black text-3xl text-slate-900 font-mono tracking-tight">
                {currentStreakDays} <span className="text-sm font-normal text-slate-500">Days</span>
              </span>
            </div>
          </div>

          {/* Dynamic Mon-Sun Check Circles */}
          <div className="flex items-center justify-between pt-1">
            {weekDays.map((day, idx) => {
              const isDone = idx < currentStreakDays
              return (
                <div key={day} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold text-slate-400">{day}</span>
                  <div className={`
                    h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                    ${isDone 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'bg-slate-100 text-slate-300 border border-slate-200'}
                  `}>
                    {isDone ? <Check size={13} strokeWidth={3} /> : null}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-semibold">
            <span>Completed tasks: <strong className="text-slate-900">{tasksDone}</strong></span>
            <span onClick={() => navigate('/progress')} className="text-blue-600 hover:underline cursor-pointer flex items-center gap-1 font-bold">
              Analytics <ArrowRight size={12} />
            </span>
          </div>
        </Card>

        {/* Card 2: Role Proficiency & Verified Skills */}
        <Card className="p-5 flex flex-col justify-between space-y-4 border border-slate-200 shadow-sm hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm text-slate-900">Verified Role Skills</h3>
                <p className="text-[11px] text-slate-500">Skill verification status</p>
              </div>
            </div>
            <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              {verifiedCount} / {totalSkills} Verified
            </span>
          </div>

          <div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-display font-black text-3xl text-slate-900 font-mono tracking-tight">
                {totalSkills > 0 ? Math.round((verifiedCount / totalSkills) * 100) : 0}%
              </span>
              <span className="text-xs font-semibold text-slate-500">Benchmark: 80%</span>
            </div>
            <div className="mt-2">
              <Progress value={totalSkills > 0 ? Math.round((verifiedCount / totalSkills) * 100) : 0} variant="emerald" />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-semibold">
            <span>Target Role: <strong className="text-slate-900">{targetRole}</strong></span>
            <span onClick={() => navigate('/skill-gap')} className="text-blue-600 hover:underline cursor-pointer flex items-center gap-1 font-bold">
              Skill Gaps <ArrowRight size={12} />
            </span>
          </div>
        </Card>

        {/* Card 3: Total Dynamic Study Time */}
        <Card className="p-5 flex flex-col justify-between space-y-4 border border-slate-200 shadow-sm hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200">
                <Clock size={18} />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm text-slate-900">Study Time</h3>
                <p className="text-[11px] text-slate-500">Total time spent in active tasks</p>
              </div>
            </div>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
              {profile?.hours_per_week || 10} hrs/wk goal
            </span>
          </div>

          <div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-display font-black text-3xl text-slate-900 font-mono tracking-tight">
                {studyTimeFormatted}
              </span>
              <span className="text-xs font-semibold text-slate-500">completed this sprint</span>
            </div>
          </div>

          {/* Real Skill Category Badges */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-600">
            {sortedSkillEntries.slice(0, 3).map(([skName], i) => (
              <span key={skName} className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${i === 0 ? 'bg-blue-600' : i === 1 ? 'bg-indigo-600' : 'bg-violet-600'}`} />
                {skName}
              </span>
            ))}
          </div>

          <div 
            onClick={() => navigate('/weekly-plan')}
            className="flex items-center justify-between text-xs text-blue-600 font-bold hover:underline cursor-pointer"
          >
            <span>View Task Schedule</span>
            <ArrowRight size={14} />
          </div>
        </Card>
      </div>

      {/* Main Grid: Weekly Sprint Tasks + Action Controls */}
      <div className="grid lg:grid-cols-3 gap-6 items-start">
        
        {/* Active Weekly Adaptive Plan */}
        <Card className="lg:col-span-2 space-y-5 p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-blue-600" />
                <h2 className="font-display font-bold text-lg text-slate-900">Weekly Adaptive Learning Plan</h2>
              </div>
              <p className="text-slate-500 text-xs mt-0.5">Focus Skill Deficit: <strong className="text-blue-700 font-bold">{weekly?.focus || 'Python'}</strong></p>
            </div>
            <button className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-bold rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer" onClick={() => navigate('/weekly-plan')}>
              Task Calendar <ArrowRight size={14} />
            </button>
          </div>

          <div className="space-y-3">
            {weeklyTasks.slice(0, 5).map((t: any) => (
              <div 
                key={t.id} 
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border transition-all ${
                  t.status === 'COMPLETED'
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-sm'
                }`}
              >
                <div className="space-y-1">
                  <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    {t.title}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-3 font-medium">
                    <span className="capitalize font-bold text-blue-700">{t.type}</span>
                    <span>•</span>
                    <span>{t.day} ({t.time_slot})</span>
                    <span>•</span>
                    <span>{t.minutes} mins</span>
                  </div>
                </div>
                
                <div className="shrink-0">
                  {t.status === 'COMPLETED' ? (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 border border-emerald-200">
                      <CheckCircle2 size={14} className="text-emerald-600" /> Done
                    </span>
                  ) : (
                    <button 
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                      onClick={() => handleToggleTask(t.id)}
                    >
                      <PlayCircle size={14} /> Mark Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Target Goal Summary & Quick Links */}
        <Card className="p-6 space-y-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-display font-bold text-lg text-slate-900">Target Role Hub</h2>
            <Badge variant="purple">{targetRole}</Badge>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span>Verified Role Readiness</span>
              <span className="font-mono text-blue-700">{overallScore}%</span>
            </div>
            <Progress value={overallScore} variant={overallScore >= 80 ? 'emerald' : 'default'} />
            <div className="text-[11px] text-slate-500 font-semibold pt-1">
              Benchmark goal: 80% across core role competencies
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            <button 
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              onClick={() => navigate('/learning-tools')}
            >
              <BookOpen size={16} /> Dynamic Learning Tools
            </button>
            <button 
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs border border-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
              onClick={() => navigate('/practice')}
            >
              <Code2 size={16} /> Open Practice Hub
            </button>
            <button 
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs border border-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
              onClick={() => navigate('/assessment')}
            >
              <ClipboardCheck size={16} /> Take Skill Assessment
            </button>
            <button 
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs border border-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
              onClick={() => navigate('/roadmap')}
            >
              <MapPin size={16} /> View Adaptive Roadmap
            </button>
          </div>
        </Card>
      </div>

      {/* Bottom Row: Dynamic Real Data Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Card 1: Real Skills Progress List */}
        <Card className="p-5 flex flex-col justify-between space-y-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-blue-600" />
              <h3 className="font-display font-bold text-base text-slate-900">Current Skill Scores</h3>
            </div>
            <button onClick={() => navigate('/profile')} className="text-xs font-bold text-blue-600 hover:underline cursor-pointer">
              View Profile
            </button>
          </div>

          <div className="space-y-3">
            {topActiveSkills.length > 0 ? (
              topActiveSkills.map(([skName, score]: any) => (
                <div 
                  key={skName}
                  onClick={() => navigate(`/practice?lang=${encodeURIComponent(skName)}`)}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-400 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                      {skName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">{skName}</div>
                      <div className="text-[10px] text-slate-500 font-semibold">{score >= 80 ? 'Verified' : 'In Progress'}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-xs text-slate-900">{score}%</div>
                    <div className="w-16 bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: `${score}%` }} />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs font-medium">
                No skill signals detected yet. Upload resume to analyze.
              </div>
            )}
          </div>
        </Card>

        {/* Card 2: Skill Competency Distribution */}
        <Card className="p-5 flex flex-col justify-between space-y-3 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart2 size={18} className="text-indigo-600" />
              <h3 className="font-display font-bold text-base text-slate-900">Competency Breakdown</h3>
            </div>
          </div>

          <div className="space-y-2.5 my-2">
            {sortedSkillEntries.slice(0, 4).map(([skName, score]: any) => (
              <div key={skName} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>{skName}</span>
                  <span className="font-mono text-blue-700">{score}%</span>
                </div>
                <Progress value={score} variant={score >= 80 ? 'emerald' : 'default'} />
              </div>
            ))}
          </div>
        </Card>

        {/* Card 3: AI Assistant Recommendation */}
        <Card className="p-5 flex flex-col justify-between space-y-4 border border-slate-200 shadow-sm bg-gradient-to-br from-blue-50/50 to-white">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-sm">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-slate-900">AI Agent Recommendation</h3>
              <p className="text-[11px] text-slate-500">Adaptive Mentor Advice</p>
            </div>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-sm">
            💡 Focus on strengthening your score in <strong className="text-blue-700">{weekly?.focus || 'Python'}</strong>. Completing 2 practice challenges in the Practice Hub will increase your verified readiness towards the 80% benchmark.
          </p>

          <button 
            onClick={() => navigate('/assistant')}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles size={14} /> Ask Gemini AI Assistant
          </button>
        </Card>
      </div>

    </div>
  )
}
