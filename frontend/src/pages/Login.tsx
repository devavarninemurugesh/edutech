import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getRoles, analyzeResume } from '../services/api'
import { 
  BrainCircuit, Sparkles, Upload, FileText, CheckCircle2, ArrowRight, 
  Lock, Mail, User, ShieldCheck, Target, Zap, Bot, Star, Play, Check, ChevronRight
} from 'lucide-react'
import { LogoLoader } from '../components/LogoLoader'

const SAMPLE_RESUMES: Record<string, string> = {
  'Data Scientist': `ALICE CHEN
Email: alice.chen@example.com | San Francisco, CA

PROFESSIONAL SUMMARY
Data Analyst with 2 years of experience analyzing customer behavior, building relational SQL queries, and creating automated dashboards in Tableau and Python. Looking to transition into a Full Data Scientist role.

TECHNICAL SKILLS
- Programming: Python (Pandas, NumPy, Matplotlib, basic Scikit-Learn)
- Databases & Querying: SQL (PostgreSQL, MySQL, Window Functions, CTEs)
- Statistics: Hypothesis Testing, A/B Testing, Descriptive Analysis, Confidence Intervals
- Tools: Git, Jupyter Notebooks, Excel (Advanced Pivot Tables, VLOOKUP)

EXPERIENCE
Data Analyst — RetailTech Corp (2024 - Present)
- Developed automated SQL ETL scripts to aggregate 1.2M daily transactional records.
- Built exploratory data analysis (EDA) pipelines in Python (Pandas) to analyze customer churn factors.
- Evaluated regression models with Scikit-Learn to predict promotional coupon redemption.`,

  'AI/ML Engineer': `MARCUS JOHNSON
Email: marcus.j@example.com | Seattle, WA

SUMMARY
Software Engineer with strong Python programming fundamentals seeking an AI/ML Engineer role. Experience developing REST APIs and training baseline PyTorch deep learning models.

CORE SKILLS
- Languages: Python, JavaScript, C++
- AI / ML: PyTorch, NumPy, Scikit-Learn, Neural Networks, Computer Vision (OpenCV)
- Tools: Docker, Git, FastAPI, Linux, AWS S3

PROJECTS
- Object Detection Pipeline: Built a YOLO and PyTorch computer vision script achieving 84% mAP on real-time video frames.
- Image Classification: Trained a Convolutional Neural Network (CNN) in PyTorch with custom data augmentation.`,

  'Full Stack Developer': `SARAH PATEL
Email: sarah.patel@example.com | Austin, TX

SUMMARY
Frontend Developer with 2 years of experience in React and JavaScript, aiming to transition to Full Stack Developer.

TECHNICAL SKILLS
- Frontend: JavaScript (ES6+), TypeScript, React, HTML5, CSS3, TailwindCSS
- Backend: Node.js, Express, REST APIs, JSON Web Tokens (JWT)
- Databases & Tools: SQL (PostgreSQL), Git, GitHub Actions, Docker basics

EXPERIENCE
Frontend Developer — CloudApp Studios (2024 - Present)
- Built interactive single-page applications using React and TypeScript.
- Integrated RESTful APIs with Axios and handled global state using Context API.`
}

export default function Login() {
  const { login, register, onboardWithResume, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState<'signin' | 'register'>('register')
  const [step, setStep] = useState<number>(1) // 1: Details, 2: Resume, 3: AI Scan
  const [availableRoles, setAvailableRoles] = useState<string[]>([
    'Data Scientist', 'AI/ML Engineer', 'Full Stack Developer', 'Backend Developer', 
    'Data Analyst', 'Cloud & DevOps Engineer', 'Cybersecurity Analyst', 'Software Engineer'
  ])

  // Form State
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [targetRole, setTargetRole] = useState('Data Scientist')
  const [goal, setGoal] = useState('Land a Data Science role in 3 months')
  const [hoursPerWeek, setHoursPerWeek] = useState(10)
  
  // Resume Input State
  const [resumeText, setResumeText] = useState('')
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [scanStep, setScanStep] = useState(0)

  useEffect(() => {
    getRoles().then(res => {
      if (res.data?.roles) setAvailableRoles(res.data.roles)
    }).catch(() => {})
  }, [])

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setErrorMsg('Please enter your email address')
      return
    }
    setLoading(true)
    setErrorMsg('')
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Sign in failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleLoadSampleResume = (roleKey: string) => {
    const text = SAMPLE_RESUMES[roleKey] || SAMPLE_RESUMES['Data Scientist']
    setResumeText(text)
    setResumeFile(null)
  }

  const handleStartAIScanAndOnboard = async () => {
    if (!name.trim() || !email.trim()) {
      setErrorMsg('Please enter your full name and email address')
      setStep(1)
      return
    }

    setLoading(true)
    setErrorMsg('')
    setStep(3)

    // Animated scan progression
    setScanStep(1)
    setTimeout(() => setScanStep(2), 700)
    setTimeout(() => setScanStep(3), 1400)
    setTimeout(() => setScanStep(4), 2100)

    try {
      let finalResumeText = resumeText

      // If file uploaded, analyze it first
      if (resumeFile) {
        const fileRes = await analyzeResume(resumeFile)
        if (fileRes.data?.text) {
          finalResumeText = fileRes.data.text
        }
      }

      await onboardWithResume({
        name,
        email,
        target_role: targetRole,
        goal,
        hours_per_week: hoursPerWeek,
        resume_text: finalResumeText || `Candidate targeting ${targetRole} with foundational knowledge.`
      })

      setTimeout(() => {
        setLoading(false)
        navigate('/dashboard')
      }, 2600)
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'AI Skill Gap Agent analysis failed. Please try again.')
      setLoading(false)
      setStep(2)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      
      {/* Decorative background glow spheres */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-4xl w-full mx-auto relative z-10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-400/30 text-xs font-bold text-indigo-300 backdrop-blur-md">
            <Sparkles size={14} className="text-amber-400 animate-spin" />
            <span>AI Skill Gap Agent Platform</span>
          </div>
          <div className="flex items-center justify-center gap-3 pt-1">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <BrainCircuit size={28} />
            </div>
            <h1 className="font-display font-black text-3xl sm:text-4xl tracking-tight text-white">
              EduPath<span className="text-indigo-400 font-mono text-sm font-bold ml-1">AI</span>
            </h1>
          </div>
          <p className="text-slate-300 text-xs sm:text-sm max-w-lg mx-auto">
            Autonomous Skill Gap Agent that analyzes your resume, detects exact competency deficits, and creates adaptive learning roadmaps.
          </p>
        </div>

        {/* Card Box */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8">
          
          {/* Mode Switch Tabs */}
          <div className="flex bg-slate-900/60 p-1 rounded-2xl max-w-md mx-auto mb-6 border border-white/10">
            <button
              onClick={() => { setMode('register'); setErrorMsg('') }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                mode === 'register'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles size={14} /> Get Started & Analyze Resume
            </button>
            <button
              onClick={() => { setMode('signin'); setErrorMsg('') }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                mode === 'signin'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User size={14} /> Sign In
            </button>
          </div>

          {errorMsg && (
            <div className="mb-5 p-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <span className="h-2 w-2 rounded-full bg-rose-400 animate-ping" />
              {errorMsg}
            </div>
          )}

          {/* SIGN IN TAB */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="max-w-md mx-auto space-y-4 animate-fadeIn">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-slate-900/70 border border-white/15 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:border-indigo-400 focus:bg-slate-900 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-slate-900/70 border border-white/15 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:border-indigo-400 focus:bg-slate-900 outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-extrabold rounded-2xl text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {loading ? <LogoLoader size="sm" /> : <><ShieldCheck size={18} /> Sign In to EduPath</>}
              </button>

              <div className="pt-3 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('demo.learner@edupath.ai')
                    setName('Demo Learner')
                    setTargetRole('Data Scientist')
                  }}
                  className="text-xs text-indigo-300 hover:text-indigo-200 underline font-semibold cursor-pointer"
                >
                  Quick Fill Demo Credentials
                </button>
              </div>
            </form>
          )}

          {/* REGISTER & RESUME ONBOARDING FLOW */}
          {mode === 'register' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Stepper Header */}
              <div className="flex items-center justify-center gap-3 pb-2">
                {[
                  { num: 1, label: 'Profile & Goal' },
                  { num: 2, label: 'Resume Upload' },
                  { num: 3, label: 'AI Skill Gap Scan' }
                ].map(s => (
                  <div key={s.num} className="flex items-center gap-2">
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                      step === s.num
                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/40 ring-2 ring-indigo-300'
                        : step > s.num
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-800 text-slate-400 border border-white/10'
                    }`}>
                      {step > s.num ? <Check size={14} /> : s.num}
                    </div>
                    <span className={`text-xs font-bold hidden sm:inline ${step === s.num ? 'text-white' : 'text-slate-400'}`}>
                      {s.label}
                    </span>
                    {s.num < 3 && <div className="h-0.5 w-6 bg-white/20 mx-1 hidden sm:block" />}
                  </div>
                ))}
              </div>

              {/* STEP 1: Details & Target Role */}
              {step === 1 && (
                <div className="grid md:grid-cols-2 gap-5 max-w-2xl mx-auto">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Full Name</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Alex Mercer"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full bg-slate-900/70 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-400 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Email Address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        required
                        placeholder="alex@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-slate-900/70 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-400 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Target Career Role</label>
                    <div className="relative">
                      <Target size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <select
                        value={targetRole}
                        onChange={e => setTargetRole(e.target.value)}
                        className="w-full bg-slate-900/90 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-indigo-300 font-bold focus:border-indigo-400 outline-none cursor-pointer"
                      >
                        {availableRoles.map(r => (
                          <option key={r} value={r} className="bg-slate-900 text-white">{r}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Career Goal / Timeline</label>
                    <input
                      type="text"
                      placeholder="e.g. Master role competencies and land a job in 3 months"
                      value={goal}
                      onChange={e => setGoal(e.target.value)}
                      className="w-full bg-slate-900/70 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-400 outline-none"
                    />
                  </div>

                  <div className="md:col-span-2 flex justify-end pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (!name.trim() || !email.trim()) {
                          setErrorMsg('Please enter your full name and email')
                          return
                        }
                        setErrorMsg('')
                        setStep(2)
                      }}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      Continue to Resume Input <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Resume Input & Upload */}
              {step === 2 && (
                <div className="max-w-2xl mx-auto space-y-5 animate-fadeIn">
                  <div className="text-center space-y-1">
                    <h3 className="font-display font-extrabold text-lg text-white">
                      Upload or Paste Your Resume for <span className="text-indigo-400">{targetRole}</span>
                    </h3>
                    <p className="text-xs text-slate-300">
                      The AI Skill Gap Agent will parse your actual experience, extract skill levels, and map missing competencies.
                    </p>
                  </div>

                  {/* File Drag Drop */}
                  <div className="border-2 border-dashed border-indigo-400/40 hover:border-indigo-400 rounded-2xl p-6 text-center bg-indigo-950/30 transition-all space-y-3">
                    <Upload size={28} className="mx-auto text-indigo-400" />
                    <div>
                      <div className="text-xs font-bold text-white">
                        {resumeFile ? resumeFile.name : 'Upload PDF or TXT Resume'}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {resumeFile ? `${(resumeFile.size / 1024).toFixed(1)} KB selected` : 'Drag & drop or click browse'}
                      </div>
                    </div>
                    <input
                      type="file"
                      id="onboard-resume-file"
                      className="hidden"
                      accept=".pdf,.txt"
                      onChange={e => {
                        setResumeFile(e.target.files?.[0] || null)
                        setResumeText('')
                      }}
                    />
                    <label
                      htmlFor="onboard-resume-file"
                      className="inline-block px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold cursor-pointer text-white"
                    >
                      Browse File
                    </label>
                  </div>

                  {/* Or Paste Text / Quick Load */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Or Paste Resume / Experience Text
                      </label>
                      <button
                        type="button"
                        onClick={() => handleLoadSampleResume(targetRole)}
                        className="text-xs font-bold text-indigo-300 hover:text-indigo-200 flex items-center gap-1 bg-indigo-900/60 px-2.5 py-1 rounded-lg border border-indigo-500/30 cursor-pointer"
                      >
                        <Zap size={13} className="text-amber-400" /> 1-Click Load Sample Resume
                      </button>
                    </div>

                    <textarea
                      rows={6}
                      placeholder="Paste your past roles, projects, skills, education or portfolio summary here..."
                      value={resumeText}
                      onChange={e => setResumeText(e.target.value)}
                      className="w-full bg-slate-900/80 border border-white/15 rounded-2xl p-3.5 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-400 outline-none custom-scrollbar font-mono leading-relaxed"
                    />
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-4 py-2.5 rounded-xl bg-white/10 text-slate-300 text-xs font-semibold hover:bg-white/15 cursor-pointer"
                    >
                      Back
                    </button>

                    <button
                      type="button"
                      onClick={handleStartAIScanAndOnboard}
                      className="px-7 py-3 bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-extrabold rounded-2xl text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Sparkles size={16} className="text-amber-300" /> Launch AI Skill Gap Analysis
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Live AI Scan Animation */}
              {step === 3 && (
                <div className="py-8 max-w-lg mx-auto space-y-6 text-center animate-fadeIn">
                  <div className="h-20 w-20 rounded-3xl bg-indigo-600/30 border border-indigo-400/40 text-indigo-300 flex items-center justify-center mx-auto shadow-2xl relative">
                    <Bot size={40} className="text-indigo-400 animate-pulse" />
                    <div className="absolute inset-0 rounded-3xl border-2 border-indigo-400/50 animate-ping pointer-events-none" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-display font-extrabold text-xl text-white">
                      AI Skill Gap Agent Active
                    </h3>
                    <p className="text-xs text-slate-300">
                      Analyzing resume signals against benchmark requirements for <strong className="text-indigo-400">{targetRole}</strong>.
                    </p>
                  </div>

                  {/* Progress Items */}
                  <div className="space-y-2.5 text-left bg-slate-900/80 p-4 rounded-2xl border border-white/10 text-xs font-semibold">
                    <div className={`flex items-center gap-2.5 transition-all ${scanStep >= 1 ? 'text-emerald-400' : 'text-slate-500'}`}>
                      <CheckCircle2 size={16} className={scanStep >= 1 ? 'text-emerald-400' : 'text-slate-600'} />
                      <span>Extracting technical skills, tools & experience metrics</span>
                    </div>
                    <div className={`flex items-center gap-2.5 transition-all ${scanStep >= 2 ? 'text-emerald-400' : 'text-slate-500'}`}>
                      <CheckCircle2 size={16} className={scanStep >= 2 ? 'text-emerald-400' : 'text-slate-600'} />
                      <span>Computing demonstrated proficiency & confidence scores</span>
                    </div>
                    <div className={`flex items-center gap-2.5 transition-all ${scanStep >= 3 ? 'text-emerald-400' : 'text-slate-500'}`}>
                      <CheckCircle2 size={16} className={scanStep >= 3 ? 'text-emerald-400' : 'text-slate-600'} />
                      <span>Mapping skill gap deficits against 80% role benchmark</span>
                    </div>
                    <div className={`flex items-center gap-2.5 transition-all ${scanStep >= 4 ? 'text-emerald-400' : 'text-slate-500'}`}>
                      <CheckCircle2 size={16} className={scanStep >= 4 ? 'text-emerald-400' : 'text-slate-600'} />
                      <span>Synthesizing dynamic roadmap, learning tools & weekly plan</span>
                    </div>
                  </div>

                  <div className="text-xs text-indigo-300 font-mono animate-pulse">
                    🚀 Preparing your customized interactive learning dashboard...
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  )
}
