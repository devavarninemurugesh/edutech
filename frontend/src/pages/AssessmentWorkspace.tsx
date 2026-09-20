import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import confetti from 'canvas-confetti'
import { getAssessment, submitAssessment } from '../services/api'
import { 
  ClipboardCheck, Clock, CheckCircle2, XCircle, ArrowRight, 
  ArrowLeft, ExternalLink, RefreshCw, Award, Sparkles, Check, HelpCircle, AlertTriangle 
} from 'lucide-react'
import { LogoLoader } from '../components/LogoLoader'

export default function AssessmentWorkspace() {
  const [searchParams] = useSearchParams()
  const skillParam = searchParams.get('skill') || searchParams.get('lang') || 'NumPy'
  const navigate = useNavigate()

  const [questions, setQuestions] = useState<any[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<any>()
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState(900) // 15 minutes timer in seconds

  // Exit Confirmation Modal State
  const [showExitModal, setShowExitModal] = useState(false)
  const [exitConfirmInput, setExitConfirmInput] = useState('')

  useEffect(() => {
    setLoading(true)
    setResult(undefined)
    setAnswers({})
    getAssessment(skillParam)
      .then(res => setQuestions(res.data.questions || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [skillParam])

  // Timer Countdown
  useEffect(() => {
    if (result || loading) return
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [result, loading])

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Confetti fireworks
  const fireCelebrationConfetti = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#00b8a3', '#ffc01e', '#2cbb5d', '#6366f1', '#ec4899']
      })
      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 60,
          origin: { x: 0.1, y: 0.6 },
          colors: ['#00b8a3', '#ffc01e', '#2cbb5d']
        })
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 60,
          origin: { x: 0.9, y: 0.6 },
          colors: ['#00b8a3', '#ffc01e', '#2cbb5d']
        })
      }, 250)
    } catch (e) {
      console.log('Confetti trigger fallback', e)
    }
  }

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      if (!confirm(`You have unanswered questions. Are you sure you want to submit your ${skillParam} assessment now?`)) {
        return
      }
    }
    setLoading(true)
    try {
      const res = await submitAssessment({ skill: skillParam, answers })
      setResult(res.data)
      fireCelebrationConfetti()
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmExit = () => {
    if (exitConfirmInput.trim().toLowerCase() === 'confirm') {
      setShowExitModal(false)
      navigate('/assessment')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] text-slate-100 flex items-center justify-center p-6">
        <LogoLoader 
          size="lg" 
          text={`Loading ${skillParam} Assessment Workspace...`}
          subtext="Preparing adaptive test questions & scoring engine"
        />
      </div>
    )
  }

  const currentQ = questions[currentIdx]

  return (
    <div className="h-screen w-screen bg-[#1a1a1a] text-slate-100 flex flex-col font-sans select-none overflow-hidden">
      {/* Top Header Bar */}
      <header className="h-14 bg-[#282828] border-b border-[#3e3e3e] px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setExitConfirmInput('')
              setShowExitModal(true)
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3a3a3a] hover:bg-[#4a4a4a] text-xs font-semibold text-slate-200 transition-all border border-[#484848] cursor-pointer"
          >
            <ArrowLeft size={14} className="text-slate-300" />
            <span>Exit Assessment</span>
          </button>

          <div className="h-4 w-[1px] bg-[#3e3e3e]" />

          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-[#ffa116]/10 border border-[#ffa116]/30 text-[#ffa116]">
              <ClipboardCheck size={18} />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-sm text-white tracking-tight">
                {skillParam} Assessment Workspace
              </h1>
              <div className="text-[10px] text-[#00b8a3] font-mono font-bold">
                Adaptive LeetCode Examination
              </div>
            </div>
          </div>
        </div>

        {/* Timer & Status */}
        {!result && (
          <div className="flex items-center gap-4">
            <div className="px-3.5 py-1.5 rounded-lg bg-[#1a1a1a] border border-[#3e3e3e] text-slate-200 text-xs font-mono font-bold flex items-center gap-2">
              <Clock size={14} className="text-[#ffc01e]" />
              <span>Time Remaining: <strong className="text-[#ffc01e] font-mono">{formatTime(timeLeft)}</strong></span>
            </div>

            <button
              onClick={handleSubmit}
              className="flex items-center gap-1.5 px-5 py-1.5 rounded-lg bg-[#2cbb5d] hover:bg-[#28ab54] text-white text-xs font-bold transition-all shadow-md shadow-[#2cbb5d]/20 cursor-pointer"
            >
              <CheckCircle2 size={14} />
              <span>Submit Assessment</span>
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.open(`/assessment/workspace?skill=${encodeURIComponent(skillParam)}`, '_blank')}
            title="Open in New Tab"
            className="p-1.5 rounded bg-[#3a3a3a] hover:bg-[#484848] text-slate-300 hover:text-white border border-[#484848]"
          >
            <ExternalLink size={14} />
          </button>
        </div>
      </header>

      {/* Main Examination View */}
      {!result ? (
        <div className="flex-1 flex overflow-hidden">
          {/* Question List Sidebar */}
          <div className="w-72 border-r border-[#3e3e3e] bg-[#282828] p-5 flex flex-col justify-between shrink-0">
            <div className="space-y-4">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                Question Index ({questions.length} Items)
              </div>
              <div className="space-y-2">
                {questions.map((q, idx) => {
                  const isAnswered = !!answers[q.id]
                  const isCurrent = currentIdx === idx
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIdx(idx)}
                      className={`
                        w-full p-3 rounded-xl text-left text-xs font-bold transition-all flex items-center justify-between border cursor-pointer
                        ${isCurrent
                          ? 'bg-[#3a3a3a] text-white border-[#00b8a3] shadow-md'
                          : isAnswered
                          ? 'bg-[#2cbb5d]/10 text-[#2cbb5d] border-[#2cbb5d]/30'
                          : 'bg-[#1a1a1a] text-slate-400 border-[#3e3e3e] hover:bg-[#333]'}
                      `}
                    >
                      <span>Question #{idx + 1}</span>
                      {isAnswered ? (
                        <span className="h-2 w-2 rounded-full bg-[#2cbb5d]" />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-slate-600" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-[#3e3e3e] text-[11px] text-slate-400 space-y-1 font-mono">
              <div>Answered: <strong className="text-[#2cbb5d]">{Object.keys(answers).length}</strong> / {questions.length}</div>
              <div>Remaining: <strong className="text-slate-300">{questions.length - Object.keys(answers).length}</strong></div>
            </div>
          </div>

          {/* Question Workspace Panel */}
          <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto space-y-6 custom-scrollbar">
            {currentQ && (
              <div className="space-y-6 animate-fadeIn">
                <div className="p-6 rounded-2xl bg-[#282828] border border-[#3e3e3e] space-y-4 shadow-xl">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-extrabold text-[#00b8a3] uppercase tracking-wider font-mono">
                      Question {currentIdx + 1} of {questions.length}
                    </span>
                    {currentQ.topic && (
                      <span className="px-2.5 py-1 rounded-full bg-[#00b8a3]/15 text-[#00b8a3] text-xs font-bold border border-[#00b8a3]/30">
                        {currentQ.topic}
                      </span>
                    )}
                  </div>

                  <h2 className="font-display font-extrabold text-xl text-white leading-relaxed">
                    {currentQ.question}
                  </h2>
                </div>

                {/* Multiple Choice Options */}
                <div className="space-y-3">
                  {currentQ.options?.map((opt: string) => {
                    const isChecked = answers[currentQ.id] === opt
                    return (
                      <label
                        key={opt}
                        onClick={() => setAnswers({ ...answers, [currentQ.id]: opt })}
                        className={`
                          p-4 rounded-xl border text-sm font-semibold flex items-center justify-between cursor-pointer transition-all
                          ${isChecked
                            ? 'bg-[#00b8a3]/15 border-[#00b8a3] text-white shadow-md'
                            : 'bg-[#282828] border-[#3e3e3e] text-slate-300 hover:bg-[#333] hover:border-slate-500'}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`
                            h-5 w-5 rounded-full border flex items-center justify-center transition-all
                            ${isChecked ? 'border-[#00b8a3] bg-[#00b8a3] text-white' : 'border-slate-600 bg-[#1a1a1a]'}
                          `}>
                            {isChecked && <Check size={12} strokeWidth={3} />}
                          </div>
                          <span>{opt}</span>
                        </div>
                      </label>
                    )
                  })}
                </div>

                {/* Next/Prev Navigation */}
                <div className="flex items-center justify-between pt-6 border-t border-[#3e3e3e]">
                  <button
                    disabled={currentIdx === 0}
                    onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#3a3a3a] text-slate-300 border border-[#484848] hover:bg-[#4a4a4a] disabled:opacity-30 cursor-pointer"
                  >
                    ← Previous Question
                  </button>

                  {currentIdx < questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
                      className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white border border-[#484848] cursor-pointer"
                    >
                      Next Question →
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#2cbb5d] hover:bg-[#28ab54] text-white cursor-pointer shadow-lg shadow-[#2cbb5d]/30"
                    >
                      Submit & Complete Test
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Exam Results Screen */
        <div className="flex-1 overflow-y-auto p-8 max-w-3xl mx-auto space-y-6 custom-scrollbar animate-fadeIn">
          <div className="p-8 rounded-3xl bg-[#282828] border border-[#3e3e3e] text-center space-y-5 shadow-2xl">
            <div className="h-20 w-20 rounded-3xl bg-[#2cbb5d]/20 text-[#2cbb5d] border border-[#2cbb5d]/30 flex items-center justify-center mx-auto shadow-lg shadow-[#2cbb5d]/20 animate-bounce">
              <Award size={40} />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-[#2cbb5d]/15 text-[#2cbb5d] border border-[#2cbb5d]/30 text-xs font-extrabold uppercase tracking-wider font-mono">
                PASSED & CERTIFIED
              </span>
              <h2 className="font-display font-black text-5xl text-white mt-2 font-mono">
                {result.score}%
              </h2>
              <p className="text-sm text-slate-300 mt-2 font-semibold">
                {result.correct} out of {result.total} questions answered correctly
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#00b8a3]/10 border border-[#00b8a3]/20 text-xs text-[#00b8a3] font-bold max-w-md mx-auto">
              Updated Verified Skill Score: <strong className="text-white font-mono text-sm">{result.new_skill_score}%</strong>
            </div>

            {/* Question Explanations */}
            <div className="text-left space-y-3 pt-4 border-t border-[#3e3e3e]">
              <h4 className="font-bold text-sm text-slate-300">Detailed Feedback</h4>
              {result.feedback?.map((f: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                    f.is_correct
                      ? 'bg-[#2cbb5d]/10 border-[#2cbb5d]/30 text-[#2cbb5d]'
                      : 'bg-[#ff375f]/10 border-[#ff375f]/30 text-[#ff375f]'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>Q{idx + 1}: {f.question}</span>
                    {f.is_correct ? (
                      <span className="text-[#2cbb5d] flex items-center gap-1"><CheckCircle2 size={13} /> Correct</span>
                    ) : (
                      <span className="text-[#ff375f] flex items-center gap-1"><XCircle size={13} /> Incorrect</span>
                    )}
                  </div>
                  {f.explanation && (
                    <div className="text-slate-400 italic pt-1 border-t border-[#383838]">
                      {f.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-4 border-t border-[#3e3e3e]">
              <button
                onClick={() => navigate('/assessment')}
                className="flex-1 py-3 rounded-xl text-xs font-bold bg-[#3a3a3a] text-slate-200 border border-[#484848] hover:bg-[#4a4a4a] cursor-pointer"
              >
                Exit Assessment
              </button>
              <button
                onClick={() => navigate('/practice/workspace?skill=' + encodeURIComponent(skillParam))}
                className="flex-1 py-3 rounded-xl text-xs font-bold bg-[#00b8a3] hover:bg-[#00a390] text-white cursor-pointer shadow-lg shadow-[#00b8a3]/20"
              >
                Practice Code in Playground
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TYPE "CONFIRM" TO EXIT MODAL */}
      {showExitModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#282828] border border-[#484848] rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-5 shadow-2xl">
            <div className="h-14 w-14 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-md">
              <AlertTriangle size={28} />
            </div>

            <div>
              <h3 className="font-display font-extrabold text-xl text-white">Confirm Exit Assessment</h3>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                To prevent accidental loss of progress, please type <strong className="text-amber-400 font-mono">confirm</strong> below to exit.
              </p>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                autoFocus
                placeholder='Type "confirm" to exit...'
                value={exitConfirmInput}
                onChange={(e) => setExitConfirmInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && exitConfirmInput.trim().toLowerCase() === 'confirm') {
                    handleConfirmExit()
                  }
                }}
                className="w-full px-4 py-2.5 rounded-xl bg-[#1e1e1e] border border-[#444] text-white text-xs font-mono tracking-wide outline-none focus:border-amber-400 text-center"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setShowExitModal(false)
                  setExitConfirmInput('')
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#3a3a3a] hover:bg-[#4a4a4a] text-xs font-bold text-slate-200 border border-[#484848] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmExit}
                disabled={exitConfirmInput.trim().toLowerCase() !== 'confirm'}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  exitConfirmInput.trim().toLowerCase() === 'confirm'
                    ? 'bg-rose-600 hover:bg-rose-500 text-white cursor-pointer shadow-lg shadow-rose-600/30'
                    : 'bg-[#333] text-slate-500 cursor-not-allowed border border-[#3e3e3e]'
                }`}
              >
                Confirm & Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
