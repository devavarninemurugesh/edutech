import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Badge } from '../components/UI'
import { LogoLoader } from '../components/LogoLoader'
import { getPractice } from '../services/api'
import { 
  Code2, Play, ExternalLink, Sparkles, Search, Layers, 
  Terminal, CheckCircle2, ArrowRight, Zap, Globe, FolderGit2, AlertTriangle, ShieldCheck 
} from 'lucide-react'

export default function Practice() {
  const [practiceData, setPracticeData] = useState<any>()
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const navigate = useNavigate()

  useEffect(() => {
    getPractice()
      .then(res => setPracticeData(res.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <LogoLoader 
          size="lg"
          text="Loading dynamic practice catalog..." 
          subtext="Fetching hands-on code challenges aligned with your analyzed skill gaps" 
        />
      </div>
    )
  }

  const catalog: any[] = practiceData?.catalog || []
  const targetRole = practiceData?.target_role || 'Target Role'

  const filtered = catalog.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                          item.description?.toLowerCase().includes(search.toLowerCase()) ||
                          item.topics?.some((t: string) => t.toLowerCase().includes(search.toLowerCase()))
    
    if (selectedCategory === 'ALL') return matchesSearch
    if (selectedCategory === 'HIGH_GAP') return matchesSearch && item.isHighGap
    if (selectedCategory === 'VERIFIED') return matchesSearch && item.current_score >= 80
    return matchesSearch && item.category === selectedCategory
  })

  const handleStartPractice = (skillName: string, inNewTab = false) => {
    const path = `/practice/workspace?skill=${encodeURIComponent(skillName)}`
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
          <Code2 size={16} /> Interactive Code Playground Catalog
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold mt-1 tracking-tight text-slate-900">
          Practice Hub — {targetRole} Competencies
        </h1>
        <p className="text-slate-600 mt-1 text-sm leading-relaxed max-w-3xl">
          Dynamic coding challenges generated for <strong className="text-blue-700 font-bold">{targetRole}</strong>. Click <strong>"Start Practice"</strong> to launch a 100% full-screen LeetCode IDE playground.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <Card className="space-y-4 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              ['ALL', 'All Role Skills'],
              ['HIGH_GAP', 'Critical Deficits 🔥'],
              ['Target Role Skill', 'Target Gaps'],
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

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search skill (e.g. Python, SQL, ML)..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all"
            />
          </div>
        </div>
      </Card>

      {/* Skill Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(item => {
          const isVerified = item.current_score >= 80

          return (
            <Card 
              key={item.name}
              className={`flex flex-col justify-between space-y-4 hover:border-blue-400 hover:shadow-lg transition-all border ${
                item.isHighGap 
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
                      {item.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-display font-extrabold text-lg text-slate-900">{item.name}</h3>
                      <span className="text-[11px] text-blue-700 font-bold">{item.category}</span>
                    </div>
                  </div>

                  {isVerified ? (
                    <Badge variant="success">
                      <ShieldCheck size={12} className="mr-1" /> {item.current_score}%
                    </Badge>
                  ) : item.isHighGap ? (
                    <Badge variant="warning">
                      <AlertTriangle size={12} className="mr-1" /> Gap: {item.gap}%
                    </Badge>
                  ) : (
                    <Badge variant={item.level === 'Advanced' ? 'purple' : item.level === 'Intermediate' ? 'warning' : 'success'}>
                      {item.level}
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {item.description}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.topics?.map((t: string) => (
                    <span key={t} className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-500 font-bold">
                  {item.challengesCount} Challenges Available
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStartPractice(item.name, true)}
                    title="Open LeetCode IDE in New Tab"
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
                  >
                    <ExternalLink size={14} />
                  </button>

                  <button
                    onClick={() => handleStartPractice(item.name, false)}
                    className="btn btn-primary text-xs py-2 px-4 shadow-sm"
                  >
                    <Play size={13} fill="currentColor" /> Start Practice
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
