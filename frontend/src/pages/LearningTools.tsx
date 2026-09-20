import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Badge, Progress } from '../components/UI'
import { LogoLoader } from '../components/LogoLoader'
import { getLearningTools } from '../services/api'
import { 
  BookOpen, ExternalLink, Code2, Play, Sparkles, Search, 
  Layers, Clock, ShieldCheck, AlertTriangle, ChevronRight, Terminal, Video, FileText, CheckCircle2 
} from 'lucide-react'

export default function LearningTools() {
  const [toolsData, setToolsData] = useState<any>()
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'HIGH_GAP' | 'VERIFIED' | 'NEEDS_PRACTICE'>('ALL')
  const navigate = useNavigate()

  useEffect(() => {
    getLearningTools()
      .then(res => setToolsData(res.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <LogoLoader 
          size="lg"
          text="Curating dynamic learning tools & resources..." 
          subtext="Matching official documentation, interactive playgrounds & sandbox tutorials to your skill gaps" 
        />
      </div>
    )
  }

  const toolsList = toolsData?.tools || []
  const filtered = toolsList.filter((item: any) => {
    const matchesSearch = item.skill.toLowerCase().includes(search.toLowerCase()) ||
                          item.topics?.some((t: string) => t.toLowerCase().includes(search.toLowerCase())) ||
                          item.resources?.some((r: any) => r.title.toLowerCase().includes(search.toLowerCase()))
    
    if (selectedFilter === 'HIGH_GAP') return matchesSearch && item.priority === 'HIGH'
    if (selectedFilter === 'VERIFIED') return matchesSearch && item.current_score >= 80
    if (selectedFilter === 'NEEDS_PRACTICE') return matchesSearch && item.gap > 0
    return matchesSearch
  })

  return (
    <div className="space-y-8 animate-fadeIn pb-12 font-sans">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-sm">
            <Sparkles size={14} className="text-amber-300" />
            <span>AI-Curated Learning Suite</span>
          </div>
          <h1 className="font-display font-black text-2xl md:text-3xl tracking-tight">
            Dynamic Learning Tools & Resources
          </h1>
          <p className="text-blue-100 text-xs md:text-sm max-w-2xl leading-relaxed">
            Tailored to your target role <strong className="text-white font-bold">{toolsData?.target_role}</strong>. Interactive playgrounds, official documentation, and curated study tracks.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right bg-white/10 p-3 rounded-2xl border border-white/20 backdrop-blur-sm">
            <div className="text-[11px] font-semibold text-blue-100 uppercase tracking-wider">Monitored Skills</div>
            <div className="text-2xl font-black font-mono tracking-tight text-white">{toolsList.length}</div>
          </div>
          <div className="text-right bg-white/10 p-3 rounded-2xl border border-white/20 backdrop-blur-sm">
            <div className="text-[11px] font-semibold text-blue-100 uppercase tracking-wider">High Gaps</div>
            <div className="text-2xl font-black font-mono tracking-tight text-amber-300">{toolsData?.high_priority_count || 0}</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <Card className="space-y-4 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {[
              ['ALL', 'All Tools'],
              ['HIGH_GAP', 'Critical Deficits 🔥'],
              ['NEEDS_PRACTICE', 'In Progress'],
              ['VERIFIED', 'Verified Benchmarks (≥80%)']
            ].map(([fKey, label]) => (
              <button
                key={fKey}
                onClick={() => setSelectedFilter(fKey as any)}
                className={`
                  px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer
                  ${selectedFilter === fKey
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
              placeholder="Search tools, topics, docs..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all"
            />
          </div>
        </div>
      </Card>

      {/* Grid of Dynamic Learning Tool Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {filtered.map((tool: any) => {
          const isVerified = tool.current_score >= 80
          const isHighGap = tool.priority === 'HIGH'

          return (
            <Card 
              key={tool.skill} 
              className={`p-6 flex flex-col justify-between space-y-5 border transition-all hover:shadow-md ${
                isHighGap 
                  ? 'border-amber-300 bg-amber-50/20' 
                  : isVerified 
                  ? 'border-emerald-200 bg-emerald-50/20' 
                  : 'border-slate-200'
              }`}
            >
              <div className="space-y-4">
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-base flex items-center justify-center shadow-md shrink-0">
                      {tool.skill.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-display font-black text-lg text-slate-900 flex items-center gap-2">
                        {tool.skill}
                      </h3>
                      <span className="text-[11px] font-bold text-blue-700">{tool.target_role} Skill</span>
                    </div>
                  </div>

                  {isVerified ? (
                    <Badge variant="success">
                      <ShieldCheck size={13} className="mr-1" /> Verified 80%+
                    </Badge>
                  ) : isHighGap ? (
                    <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1">
                      <AlertTriangle size={12} className="text-amber-600" /> High Gap ({tool.gap} pts)
                    </span>
                  ) : (
                    <Badge variant="default">Deficit: {tool.gap} pts</Badge>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 p-3 rounded-2xl bg-white/70 border border-slate-200/80">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Demonstrated Proficiency</span>
                    <span className={isVerified ? 'text-emerald-700 font-mono' : 'text-blue-700 font-mono'}>
                      {tool.current_score}% / 80% Benchmark
                    </span>
                  </div>
                  <Progress value={tool.current_score} variant={isVerified ? 'emerald' : isHighGap ? 'amber' : 'default'} />
                </div>

                {/* Core Topics Checklist */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Layers size={13} className="text-blue-600" /> Core Topics & Concepts
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {tool.topics?.map((topic: string) => (
                      <span key={topic} className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-medium">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Documentation & External Guides */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <BookOpen size={13} className="text-indigo-600" /> Curated Documentation & Courses
                  </div>
                  <div className="space-y-1.5">
                    {tool.resources?.map((res: any, idx: number) => (
                      <a
                        key={idx}
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200 text-xs font-medium text-slate-800 hover:text-blue-700 transition-colors group"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileText size={14} className="text-blue-600 shrink-0" />
                          <span className="truncate">{res.title}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-500 uppercase group-hover:border-blue-300 shrink-0 ml-2">
                          {res.type}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
                  <Clock size={13} className="text-blue-600" /> Est. {tool.estimated_study_hours} hrs study time
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/practice?lang=${encodeURIComponent(tool.skill)}`)}
                    className="btn btn-primary text-xs py-2 px-3.5 shadow-sm"
                  >
                    <Code2 size={14} /> Launch Playground
                  </button>

                  <button
                    onClick={() => navigate(`/assessment?skill=${encodeURIComponent(tool.skill)}`)}
                    className="btn btn-secondary text-xs py-2 px-3.5"
                  >
                    Assess Skill
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
