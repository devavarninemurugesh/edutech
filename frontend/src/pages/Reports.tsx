import { useEffect, useState } from 'react'
import { Card, Progress, Badge, SkeletonLoader } from '../components/UI'
import { LogoLoader } from '../components/LogoLoader'
import { getReport } from '../services/api'
import { FileSpreadsheet, Download, Sparkles, CheckCircle2, AlertTriangle, Printer } from 'lucide-react'
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'

export default function Reports() {
  const [report, setReport] = useState<any>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getReport()
      .then(res => setReport(res.data))
      .finally(() => setLoading(false))
  }, [])

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadJSON = () => {
    if (!report) return
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `EduPath-Weekly-Report-${report.learner_name || 'Learner'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <LogoLoader 
          size="lg"
          text="Generating executive skill report..." 
          subtext="Formatting skill radar, milestone summaries & personalized recommendations" 
        />
      </div>
    )
  }



  const chartData = Object.entries(report?.skills || {}).map(([skill, value]) => ({
    skill,
    score: value as number,
    benchmark: 80
  }))

  return (
    <div className="space-y-8 animate-fadeIn pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider">
            <FileSpreadsheet size={16} /> Performance Summary
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold mt-1 tracking-tight text-slate-900">
            {report?.title || 'Weekly Progress Report'}
          </h1>
          <p className="text-slate-600 mt-1 text-sm leading-relaxed">
            Automated intelligence report generated for <strong className="text-indigo-700 font-bold">{report?.learner_name}</strong> ({report?.target_role}).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button className="btn btn-secondary text-xs" onClick={handlePrint}>
            <Printer size={14} /> Print Report
          </button>
          <button className="btn btn-primary text-xs" onClick={handleDownloadJSON}>
            <Download size={14} /> Export JSON
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 space-y-1">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Proficiency</div>
          <div className="font-display font-black text-3xl text-indigo-700 font-mono">{report?.overall_progress}%</div>
          <div className="text-[11px] text-slate-500">Target Role Average</div>
        </Card>

        <Card className="p-4 space-y-1">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Verified Skills</div>
          <div className="font-display font-black text-3xl text-emerald-700 font-mono">
            {report?.verified_skills_count} <span className="text-sm font-sans font-normal text-slate-500">/ {report?.total_target_skills}</span>
          </div>
          <div className="text-[11px] text-slate-500">Benchmark ≥ 80%</div>
        </Card>

        <Card className="p-4 space-y-1">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed Sprint Tasks</div>
          <div className="font-display font-black text-3xl text-indigo-700 font-mono">{report?.completed_tasks_count}</div>
          <div className="text-[11px] text-slate-500">Weekly schedule items</div>
        </Card>

        <Card className="p-4 space-y-1">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Primary Deficit</div>
          <div className="font-display font-bold text-lg text-amber-700 truncate">{report?.top_gap_skill}</div>
          <div className="text-[11px] text-slate-500">Top priority focus</div>
        </Card>
      </div>

      {/* AI Recommendations */}
      <Card className="space-y-4 bg-indigo-50/50 border-indigo-200">
        <div className="flex items-center gap-2 text-indigo-900 font-display font-bold text-lg">
          <Sparkles size={20} className="text-indigo-600" /> AI Adaptive Recommendations
        </div>
        <div className="space-y-2">
          {report?.recommendations?.map((rec: string, i: number) => (
            <div key={i} className="flex items-start gap-3 text-xs text-slate-800 font-medium">
              <CheckCircle2 size={16} className="text-indigo-600 shrink-0 mt-0.5" />
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Skills Matrix */}
      <Card className="space-y-4">
        <h3 className="font-display font-bold text-xl text-slate-900 pb-2 border-b border-slate-100">
          Target Role Skill Matrix
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {chartData.map(item => (
            <div key={item.skill} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-800">{item.skill}</span>
                <span className={item.score >= 80 ? 'text-emerald-700 font-mono' : 'text-indigo-700 font-mono'}>
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
