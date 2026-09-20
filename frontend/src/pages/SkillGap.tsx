import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card, Badge, Progress } from '../components/UI'
import { LogoLoader } from '../components/LogoLoader'
import { getGaps } from '../services/api'
import { 
  Sparkles, AlertTriangle, CheckCircle2, ArrowRight, Code2, 
  ClipboardCheck, FolderGit2, X, Play, Clock, Layers, Star, ExternalLink, ShieldCheck, Target 
} from 'lucide-react'

export default function SkillGap() {
  const [gapsData, setGapsData] = useState<any>()
  const [loading, setLoading] = useState(true)
  const [selectedSkillProjects, setSelectedSkillProjects] = useState<string | null>(null)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    getGaps()
      .then(res => setGapsData(res.data))
      .finally(() => setLoading(false))
  }, [])

  // Auto-open modal if query parameter specifies skill
  useEffect(() => {
    const focusSkill = searchParams.get('focus') || searchParams.get('skill')
    if (focusSkill) {
      setSelectedSkillProjects(focusSkill)
    }
  }, [searchParams])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <LogoLoader 
          size="lg"
          text="Analyzing skill deficit gaps..." 
          subtext="Comparing current mastery scores against target role benchmarks" 
        />
      </div>
    )
  }

  const gapsList: any[] = gapsData?.gaps || []
  const dynamicProjects: any[] = gapsData?.projects || []
  const highGaps = gapsList.filter((x: any) => x.priority === 'HIGH')
  const verifiedCount = gapsList.filter((x: any) => x.current_score >= 80).length

  // Find projects for the selected skill
  const activeProjects = selectedSkillProjects
    ? dynamicProjects.filter(p => p.skill === selectedSkillProjects || selectedSkillProjects === 'ALL')
    : []

  return (
    <div className="space-y-8 animate-fadeIn pb-10 font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-sm">
            <Sparkles size={14} className="text-amber-300" />
            <span>AI Skill Gap Agent Active</span>
          </div>
          <h1 className="font-display font-black text-2xl md:text-3xl tracking-tight">
            Target Role Skill Gap Engine
          </h1>
          <p className="text-blue-100 text-xs md:text-sm max-w-2xl leading-relaxed">
            Benchmarking your verified competency signals against <strong className="text-white font-bold">{gapsData?.role}</strong> role requirements.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right bg-white/10 p-3 rounded-2xl border border-white/20 backdrop-blur-sm">
            <div className="text-[11px] font-semibold text-blue-100 uppercase tracking-wider">Role Skills</div>
            <div className="text-2xl font-black font-mono tracking-tight text-white">{gapsList.length}</div>
          </div>
          <div className="text-right bg-white/10 p-3 rounded-2xl border border-white/20 backdrop-blur-sm">
            <div className="text-[11px] font-semibold text-blue-100 uppercase tracking-wider">Verified</div>
            <div className="text-2xl font-black font-mono tracking-tight text-emerald-300">{verifiedCount}</div>
          </div>
        </div>
      </div>

      {/* Summary Alert */}
      {highGaps.length > 0 ? (
        <div className="p-5 rounded-3xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-4">
            <AlertTriangle size={24} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-display font-bold text-base text-amber-950">High Priority Gaps Detected</h4>
              <p className="text-xs text-amber-800 leading-relaxed">
                You have {highGaps.length} critical skills needing improvement to reach the 80% benchmark for <strong>{gapsData?.role}</strong>. Primary focus: <strong className="text-amber-950 font-bold">{highGaps[0]?.skill}</strong>.
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedSkillProjects(highGaps[0]?.skill || gapsList[0]?.skill)}
            className="btn btn-primary text-xs shrink-0 py-2.5 px-4"
          >
            <FolderGit2 size={14} /> View Recommended Projects
          </button>
        </div>
      ) : (
        <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <ShieldCheck size={24} className="text-emerald-600 shrink-0" />
            <div>
              <h4 className="font-display font-bold text-base text-emerald-950">Outstanding Proficiency!</h4>
              <p className="text-xs text-emerald-800">All required target role competencies meet or exceed the 80% benchmark.</p>
            </div>
          </div>
        </div>
      )}

      {/* Grid of Gaps */}
      <div className="grid md:grid-cols-2 gap-5">
        {gapsList.map((x: any) => {
          const isVerified = x.current_score >= x.required_score

          return (
            <Card 
              key={x.skill} 
              className={`space-y-4 transition-all hover:shadow-md border ${
                x.priority === 'HIGH' 
                  ? 'border-amber-300 bg-amber-50/30' 
                  : isVerified 
                  ? 'border-emerald-200 bg-emerald-50/20' 
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-md shrink-0">
                    {x.skill.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                      {x.skill}
                    </h3>
                    <div className="text-xs text-slate-600 font-medium">
                      Required Benchmark: <span className="font-mono text-slate-900 font-bold">{x.required_score}%</span>
                    </div>
                  </div>
                </div>

                {isVerified ? (
                  <Badge variant="success">
                    <CheckCircle2 size={13} className="mr-1" /> Verified
                  </Badge>
                ) : (
                  <Badge variant={x.priority === 'HIGH' ? 'warning' : 'default'}>
                    {x.priority} Priority
                  </Badge>
                )}
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700">Demonstrated Score</span>
                  <span className={isVerified ? 'text-emerald-700 font-mono font-bold' : 'text-blue-700 font-mono font-bold'}>
                    {x.current_score}% / {x.required_score}%
                  </span>
                </div>
                <Progress value={x.current_score} variant={isVerified ? 'emerald' : x.priority === 'HIGH' ? 'amber' : 'default'} />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs flex-wrap gap-2">
                <div className="font-medium text-slate-600">
                  Gap Deficit: <strong className={x.gap > 0 ? 'text-amber-700 font-mono' : 'text-emerald-700 font-mono'}>{x.gap} pts</strong>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    className="btn btn-secondary text-xs py-1.5 px-3 text-blue-700 font-bold border-blue-200 hover:bg-blue-50"
                    onClick={() => setSelectedSkillProjects(x.skill)}
                  >
                    <FolderGit2 size={13} /> View Projects
                  </button>

                  <button 
                    className="btn btn-secondary text-xs py-1.5 px-3"
                    onClick={() => navigate(`/practice?lang=${encodeURIComponent(x.skill)}`)}
                  >
                    <Code2 size={13} /> Practice
                  </button>

                  <button 
                    className="btn btn-primary text-xs py-1.5 px-3"
                    onClick={() => navigate(`/assessment?skill=${encodeURIComponent(x.skill)}`)}
                  >
                    <ClipboardCheck size={13} /> Assess
                  </button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Recommended Projects Modal */}
      {selectedSkillProjects && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-blue-100 text-blue-700 border border-blue-200">
                  <FolderGit2 size={22} />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-xl text-slate-900">
                    Recommended Projects — {selectedSkillProjects}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Build hands-on portfolio projects to verify competency for <strong className="text-blue-700">{gapsData?.role}</strong>.
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedSkillProjects(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content - List of Projects */}
            <div className="p-6 overflow-y-auto space-y-4 custom-scrollbar">
              {activeProjects.length > 0 ? (
                activeProjects.map((p) => (
                  <div 
                    key={p.id}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-display font-bold text-base text-slate-900">{p.title}</h4>
                          <Badge variant={p.difficulty === 'Advanced' ? 'purple' : p.difficulty === 'Intermediate' ? 'warning' : 'success'}>
                            {p.difficulty}
                          </Badge>
                        </div>
                        <p className="text-xs font-semibold text-blue-700 mt-0.5">{p.tagline}</p>
                      </div>

                      <div className="text-xs font-bold text-slate-500 flex items-center gap-1 shrink-0">
                        <Clock size={13} className="text-blue-600" /> Est: {p.estHours}
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed">
                      {p.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] font-bold text-slate-500 mr-1">Stack:</span>
                      {p.techStack?.map((tech: string) => (
                        <span key={tech} className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-800 text-[10px] font-bold">
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="text-[11px] text-slate-600 space-y-0.5">
                        <span className="font-bold text-slate-800 block">Deliverables:</span>
                        <div className="flex flex-wrap gap-2 text-slate-700 font-medium">
                          {p.deliverables?.map((d: string, i: number) => (
                            <span key={i} className="flex items-center gap-1">
                              <CheckCircle2 size={11} className="text-emerald-600" /> {d}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        className="btn btn-primary text-xs py-2 px-4 shrink-0 shadow-sm"
                        onClick={() => {
                          setSelectedSkillProjects(null)
                          navigate(`/practice?lang=${encodeURIComponent(p.codeStarterKey || p.skill)}`)
                        }}
                      >
                        <Play size={14} /> Launch in Playground
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 space-y-3">
                  <p className="text-sm text-slate-600 font-medium">No specialized projects cataloged for {selectedSkillProjects} yet.</p>
                  <button 
                    className="btn btn-primary text-xs"
                    onClick={() => {
                      setSelectedSkillProjects(null)
                      navigate(`/practice?lang=${encodeURIComponent(selectedSkillProjects)}`)
                    }}
                  >
                    Open {selectedSkillProjects} Code Playground
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Complete projects to increase your demonstrated score to 80%+</span>
              <button 
                className="btn btn-secondary text-xs"
                onClick={() => setSelectedSkillProjects(null)}
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
