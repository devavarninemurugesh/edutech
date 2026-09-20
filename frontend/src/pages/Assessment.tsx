import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Badge } from '../components/UI'
import { LogoLoader } from '../components/LogoLoader'
import { getAssessmentCatalog } from '../services/api'
import { 
  ClipboardCheck, Play, ExternalLink, Sparkles, Search, 
  Clock, CheckCircle2, Award, Zap, BookOpen, AlertTriangle, ShieldCheck 
} from 'lucide-react'

export default function Assessment() {
  const [assessmentData, setAssessmentData] = useState<any>()
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const navigate = useNavigate()

  useEffect(() => {
    getAssessmentCatalog()
      .then(res => setAssessmentData(res.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <LogoLoader 
          size="lg"
          text="Loading skill assessment certifications..." 
          subtext="Preparing timed adaptive evaluation exams for your analyzed role profile" 
        />
      </div>
    )
  }

  const catalog: any[] = assessmentData?.catalog || []
  const targetRole = assessmentData?.target_role || 'Target Role'

  const filtered = catalog.filter(item => {
    const matchesSearch = item.skill.toLowerCase().includes(search.toLowerCase()) ||
                          item.description.toLowerCase().includes(search.toLowerCase())
    if (selectedCategory === 'ALL') return matchesSearch
    if (selectedCategory === 'HIGH_GAP') return matchesSearch && item.priority === 'HIGH'
    if (selectedCategory === 'VERIFIED') return matchesSearch && item.verifiedScore >= 80
    return matchesSearch
  })

  const handleStartAssessment = (skillName: string, inNewTab = false) => {
    const path = `/assessment/workspace?skill=${encodeURIComponent(skillName)}`
    if (inNewTab) {
      window.open(path, '_blank')
    } else {
      navigate(path)
    }
  }

  return (
    <div className="space-y-8 animate-fadeIn pb-10 font-sans">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
          <ClipboardCheck size={16} /> Skill Certification Catalog
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold mt-1 tracking-tight text-slate-900">
          Assessment Hub — {targetRole} Certifications
        </h1>
        <p className="text-slate-600 mt-1 text-sm leading-relaxed max-w-3xl">
          Pass adaptive evaluation quizzes (Score ≥ 80%) to verify competencies for <strong className="text-blue-700 font-bold">{targetRole}</strong>. Click <strong>"Start Assessment"</strong> to open a timed full-screen workspace.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <Card className="space-y-4 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {[
              ['ALL', 'All Certifications'],
              ['HIGH_GAP', 'Critical Deficits 🔥'],
              ['VERIFIED', 'Verified (≥80%)']
            ].map(([catKey, label]) => (
              <button
                key={catKey}
                onClick={() => setSelectedCategory(catKey)}
                className={`
                  px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer
                  ${selectedCategory === catKey
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}
                `}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search assessment (Python, SQL, ML...)"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all"
            />
          </div>
        </div>
      </Card>

      {/* Assessment Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(item => {
          const isVerified = item.verifiedScore >= 80

          return (
            <Card 
              key={item.skill}
              className={`flex flex-col justify-between space-y-4 hover:border-blue-400 hover:shadow-lg transition-all border ${
                item.priority === 'HIGH' 
                  ? 'border-amber-300 bg-amber-50/20' 
                  : isVerified 
                  ? 'border-emerald-200 bg-emerald-50/20' 
                  : 'border-slate-200'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-md shrink-0">
                      {item.skill.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-display font-extrabold text-lg text-slate-900">{item.skill}</h3>
                      <span className="text-[11px] text-blue-700 font-bold">{item.category}</span>
                    </div>
                  </div>

                  {isVerified ? (
                    <Badge variant="success">
                      <ShieldCheck size={12} className="mr-1" /> {item.verifiedScore}% Verified
                    </Badge>
                  ) : item.priority === 'HIGH' ? (
                    <Badge variant="warning">
                      <AlertTriangle size={12} className="mr-1" /> High Deficit
                    </Badge>
                  ) : (
                    <Badge variant="purple">Exam Ready</Badge>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {item.description}
                </p>

                <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <BookOpen size={13} className="text-blue-600" /> {item.questionsCount} Questions
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={13} className="text-amber-500" /> {item.estMinutes} mins
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-500 font-medium">
                  Adaptive Scoring
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStartAssessment(item.skill, true)}
                    title="Open Assessment in New Tab"
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
                  >
                    <ExternalLink size={14} />
                  </button>

                  <button
                    onClick={() => handleStartAssessment(item.skill, false)}
                    className="btn btn-primary text-xs py-2 px-4 shadow-sm"
                  >
                    <ClipboardCheck size={14} /> Start Assessment
                  </button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
