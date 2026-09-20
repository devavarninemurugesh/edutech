import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Badge, Progress, SkeletonLoader } from '../components/UI'
import { LogoLoader } from '../components/LogoLoader'
import { getRoadmap } from '../services/api'
import { MapPin, CheckCircle2, Lock, Sparkles, BookOpen, ExternalLink, Code2, ClipboardCheck, ChevronRight } from 'lucide-react'

export default function Roadmap() {
  const [roadmapData, setRoadmapData] = useState<any>()
  const [selectedNode, setSelectedNode] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getRoadmap()
      .then(res => {
        setRoadmapData(res.data)
        if (res.data?.nodes?.length > 0) {
          setSelectedNode(res.data.nodes[0])
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const getNodeStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return <Badge variant="success"><CheckCircle2 size={13} className="mr-1"/> Verified</Badge>
      case 'IN_PROGRESS':
      case 'AVAILABLE':
        return <Badge variant="purple"><Sparkles size={13} className="mr-1"/> Active</Badge>
      default:
        return <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 text-xs font-medium flex items-center gap-1"><Lock size={12}/> Locked</span>
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <LogoLoader 
          size="lg"
          text="Building adaptive roadmap graph..." 
          subtext="Calculating prerequisite skills, unlock conditions & milestone nodes" 
        />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fadeIn pb-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider">
          <MapPin size={16} /> Dynamic Curriculum Flow
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold mt-1 tracking-tight text-slate-900">
          Adaptive Skill Roadmap
        </h1>
        <p className="text-slate-600 mt-1 text-sm leading-relaxed">
          Your path updates dynamically as you demonstrate skill mastery. Select any node to inspect topics and study materials.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Vertical Nodes Connector Graph */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">TARGET ROLE ROADMAP</span>
              <h2 className="font-display text-2xl font-extrabold text-slate-900 mt-0.5">{roadmapData?.role}</h2>
            </div>
            <Badge variant="purple">
              {roadmapData?.nodes?.filter((n: any) => n.status === 'VERIFIED').length} / {roadmapData?.nodes?.length} Mastered
            </Badge>
          </div>

          <div className="relative py-4 flex flex-col items-center">
            {roadmapData?.nodes?.map((node: any, idx: number) => {
              const isSelected = selectedNode?.id === node.id
              const isVerified = node.status === 'VERIFIED'
              const isAvailable = node.status === 'AVAILABLE' || node.status === 'IN_PROGRESS'

              return (
                <div key={node.id} className="w-full max-w-xl flex flex-col items-center">
                  <div
                    onClick={() => setSelectedNode(node)}
                    className={`
                      w-full rounded-2xl p-5 cursor-pointer transition-all duration-200 border
                      ${isSelected ? 'ring-2 ring-indigo-600 shadow-md border-indigo-400 bg-white' : ''}
                      ${isVerified 
                        ? 'bg-emerald-50/30 border-emerald-200 hover:border-emerald-400' 
                        : isAvailable 
                        ? 'bg-indigo-50/40 border-indigo-200 hover:border-indigo-400' 
                        : 'bg-slate-50 border-slate-200 opacity-70 hover:opacity-100'}
                    `}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="h-7 w-7 rounded-xl bg-indigo-100 border border-indigo-200 text-xs font-mono font-bold flex items-center justify-center text-indigo-700 shrink-0">
                            {idx + 1}
                          </span>
                          <h3 className="font-display font-bold text-lg text-slate-900">{node.title}</h3>
                        </div>
                        <p className="text-xs text-slate-600 mt-2 line-clamp-1">
                          Topics: {node.topics?.join(' • ')}
                        </p>
                      </div>

                      <div className="shrink-0">{getNodeStatusBadge(node.status)}</div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <div className="flex justify-between text-xs font-medium text-slate-600 mb-1.5">
                        <span>Demonstrated Score</span>
                        <span className="font-bold text-slate-900 font-mono">{node.score}% / 80% Benchmark</span>
                      </div>
                      <Progress value={node.score} variant={isVerified ? 'emerald' : 'default'} />
                    </div>
                  </div>

                  {idx < roadmapData.nodes.length - 1 && (
                    <div className="h-8 w-0.5 bg-indigo-200 my-1" />
                  )}
                </div>
              )
            })}
          </div>
        </Card>

        {/* Node Detail Sidebar */}
        <Card className="sticky top-20 space-y-5 border-indigo-200">
          {selectedNode ? (
            <>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">NODE DETAILS</span>
                  <h3 className="font-display text-xl font-extrabold text-slate-900 mt-0.5">{selectedNode.title}</h3>
                </div>
                {getNodeStatusBadge(selectedNode.status)}
              </div>

              {/* Score breakdown */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700">Skill Proficiency</span>
                  <span className="text-indigo-700 font-mono font-bold">{selectedNode.score}%</span>
                </div>
                <Progress value={selectedNode.score} variant={selectedNode.score >= 80 ? 'emerald' : 'default'} />
                <div className="text-[11px] text-slate-500 mt-1 font-medium">
                  Est. Study Duration: {selectedNode.estimated_hours || 4} hours
                </div>
              </div>

              {/* Topics List */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen size={14} className="text-indigo-600" /> Core Concepts
                </div>
                <div className="space-y-1.5">
                  {selectedNode.topics?.map((topic: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800">
                      <ChevronRight size={14} className="text-indigo-600 shrink-0" />
                      <span>{topic}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <button
                  className="btn btn-primary text-xs w-full py-2.5"
                  onClick={() => navigate('/practice')}
                >
                  <Code2 size={16} /> Practice {selectedNode.title}
                </button>
                <button
                  className="btn btn-secondary text-xs w-full py-2.5"
                  onClick={() => navigate('/assessment')}
                >
                  <ClipboardCheck size={16} /> Take Assessment
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-500 text-sm font-medium">Select any node on the left to inspect topic breakdown.</div>
          )}
        </Card>
      </div>
    </div>
  )
}
