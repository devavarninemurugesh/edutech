import { useEffect, useState } from 'react'
import { Card, Progress, Badge, SkeletonLoader } from '../components/UI'
import { LogoLoader } from '../components/LogoLoader'
import { getProgress } from '../services/api'
import { BarChart3, CheckCircle2, Zap } from 'lucide-react'
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'

export default function ProgressPage() {
  const [progress, setProgress] = useState<any>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProgress()
      .then(res => setProgress(res.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <LogoLoader 
          size="lg"
          text="Compiling analytics & radar charts..." 
          subtext="Calculating overall role readiness & skill distribution" 
        />
      </div>
    )
  }

  const skillsList = Object.entries(progress?.skills || {}).map(([skill, value]) => ({
    skill,
    score: value as number,
    benchmark: 80
  }))

  const overallScore = progress?.overall || 0

  return (
    <div className="space-y-8 animate-fadeIn pb-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider">
          <BarChart3 size={16} /> Mastery Analytics
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold mt-1 tracking-tight text-slate-900">
          Progress Dashboard
        </h1>
        <p className="text-slate-600 mt-1 text-sm leading-relaxed">
          Track demonstrated skill scores, verified benchmarks, and radar comparison matrices.
        </p>
      </div>

      {/* Top Banner Stat */}
      <Card className="bg-indigo-50/60 border-indigo-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">OVERALL DEMONSTRATED PROFICIENCY</span>
            <div className="font-display font-black text-5xl text-indigo-700 tracking-tight font-mono">
              {overallScore}%
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Composite average across all {Object.keys(progress?.skills || {}).length} monitored skills.
            </p>
          </div>

          <div className="w-full sm:w-64 space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-700">Target Role Readiness</span>
              <span className="text-indigo-700 font-mono font-bold">{overallScore}%</span>
            </div>
            <Progress value={overallScore} variant={overallScore >= 80 ? 'emerald' : 'default'} />
          </div>
        </div>
      </Card>

      {/* Recharts Visualizations */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Skill Radar Chart */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-lg text-slate-900">Skill Competency Radar</h3>
            <Badge variant="purple">Radar Matrix</Badge>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={progress?.radar_data || skillsList}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="skill" stroke="#475569" tick={{ fontSize: 11, fontWeight: 'bold' }} />
                <PolarRadiusAxis stroke="#94a3b8" angle={30} domain={[0, 100]} />
                <Radar name="Current Score" dataKey="current" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                <Radar name="Benchmark" dataKey="required" stroke="#f97316" fill="#f97316" fillOpacity={0.1} strokeDasharray="3 3" />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Skill Score Bar Breakdown */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-lg text-slate-900">Demonstrated vs Benchmark</h3>
            <Badge variant="success">Target 80%</Badge>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillsList} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="skill" stroke="#64748b" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" />
                <YAxis stroke="#64748b" domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="score" fill="#6366f1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="benchmark" fill="#e2e8f0" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Individual Skill Score Cards List */}
      <Card className="space-y-4">
        <h3 className="font-display font-bold text-xl text-slate-900 pb-2 border-b border-slate-100">
          Individual Skill Breakdown
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {skillsList.map(item => (
            <div key={item.skill} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-800">{item.skill}</span>
                <span className={item.score >= 80 ? 'text-emerald-700 font-mono font-bold' : 'text-indigo-700 font-mono font-bold'}>
                  {item.score}%
                </span>
              </div>
              <Progress value={item.score} variant={item.score >= 80 ? 'emerald' : 'default'} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
