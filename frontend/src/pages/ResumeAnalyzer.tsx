import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Badge, Progress } from '../components/UI'
import { analyzeResume, analyzeTextResume, applyResumeSkills } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { FileText, Upload, CheckCircle2, Sparkles, AlertCircle, ArrowRight, ShieldCheck, FileCheck, BookOpen, Zap } from 'lucide-react'
import { LogoLoader } from '../components/LogoLoader'

const SAMPLE_TEXT = `EXPERIENCED SOFTWARE ENGINEER & DATA PRACTITIONER
Target Role: Data Scientist

PROFESSIONAL SUMMARY
Proficient developer with 3+ years experience building data processing pipelines, running statistical hypothesis tests, and training predictive machine learning models in Python.

TECHNICAL SKILLS
- Programming Languages: Python, SQL, JavaScript
- Frameworks & Libraries: NumPy, Pandas, Scikit-Learn, Matplotlib, Seaborn
- Core Competencies: Machine Learning, Statistical Analysis, Data Visualization, Model Evaluation, Data Pipelines
- Tools & Cloud: Git, Docker, Jupyter, PostgreSQL

KEY PROJECTS & EXPERIENCE
- Predictive Customer Analytics: Built Random Forest and Gradient Boosted classification models on 500k+ customer records, achieving 82% ROC-AUC.
- Automated ETL & Dashboards: Implemented SQL window queries and automated Plotly dashboards tracking revenue growth and churn risk factors.`

export default function ResumeAnalyzer() {
  const [file, setFile] = useState<File | null>(null)
  const [textInput, setTextInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>()
  const [appliedToast, setAppliedToast] = useState(false)
  const { user, refreshAuth } = useAuth()
  const navigate = useNavigate()

  const handleUploadFile = async () => {
    if (!file) return
    setLoading(true)
    setAppliedToast(false)
    try {
      const res = await analyzeResume(file)
      setResult(res.data)
      await refreshAuth()
    } catch (err: any) {
      alert(`Error analyzing document: ${err.message || 'File processing failed'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyzeText = async () => {
    if (!textInput.trim()) return
    setLoading(true)
    setAppliedToast(false)
    try {
      const res = await analyzeTextResume(textInput.trim(), user?.target_role)
      setResult(res.data)
      await refreshAuth()
    } catch (err: any) {
      alert(`Error analyzing text: ${err.message || 'Text processing failed'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleApplyToProfile = async () => {
    if (!result?.analysis?.skills) return
    try {
      await applyResumeSkills(result.analysis.skills)
      await refreshAuth()
      setAppliedToast(true)
      setTimeout(() => setAppliedToast(false), 4000)
    } catch (err: any) {
      alert(`Failed to apply skills: ${err.message}`)
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fadeIn pb-12 font-sans">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
          <FileText size={16} /> Evidence-Based Skill Extraction
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold mt-1 tracking-tight text-slate-900">
          Resume & Experience Analyzer
        </h1>
        <p className="text-slate-600 mt-1 text-sm leading-relaxed">
          Upload your resume in PDF/TXT format or paste your experience text. The AI Skill Gap Agent extracts verified skill signals and maps them against <strong className="text-blue-700 font-bold">{user?.target_role || 'Target Role'}</strong> requirements.
        </p>
      </div>

      {/* Upload Cards Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* PDF / TXT File Upload */}
        <Card className="border-2 border-dashed border-blue-200 hover:border-blue-500 p-6 text-center transition-all bg-blue-50/30 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="h-14 w-14 rounded-2xl bg-blue-100 text-blue-600 border border-blue-200 flex items-center justify-center mx-auto shadow-sm">
              <Upload size={24} />
            </div>

            <div>
              <h3 className="font-display font-bold text-base text-slate-900">
                {file ? file.name : 'Upload PDF or TXT File'}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                {file ? `${(file.size / 1024).toFixed(1)} KB selected` : 'Drag & drop file or browse local drive'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 pt-2">
            <input
              type="file"
              id="analyzer-resume-file"
              className="hidden"
              accept=".pdf,.txt"
              onChange={e => setFile(e.target.files?.[0] || null)}
            />
            <label htmlFor="analyzer-resume-file" className="btn btn-secondary cursor-pointer text-xs py-2 px-3">
              Choose File
            </label>
            <button
              className="btn btn-primary text-xs py-2 px-4 shadow-sm"
              disabled={!file || loading}
              onClick={handleUploadFile}
            >
              <Sparkles size={14} /> Analyze PDF
            </button>
          </div>
        </Card>

        {/* Text Paste / Sample Resume */}
        <Card className="p-6 flex flex-col justify-between space-y-3 border border-slate-200 bg-white">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <FileCheck size={16} className="text-blue-600" /> Paste Experience / CV Text
              </h3>
              <button
                type="button"
                onClick={() => setTextInput(SAMPLE_TEXT)}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200"
              >
                <Zap size={12} className="text-amber-500" /> Sample Resume
              </button>
            </div>

            <textarea
              rows={4}
              placeholder="Paste work experience, skills summary, GitHub repos, or course history..."
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-600 outline-none transition-all font-mono custom-scrollbar"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              className="btn btn-primary text-xs py-2 px-4 shadow-sm"
              disabled={!textInput.trim() || loading}
              onClick={handleAnalyzeText}
            >
              <Sparkles size={14} /> Analyze Text
            </button>
          </div>
        </Card>

      </div>

      {loading && (
        <Card className="py-12 border border-blue-100 bg-gradient-to-b from-blue-50/40 to-white shadow-sm">
          <LogoLoader 
            size="lg" 
            text="Extracting and analyzing document skills..." 
            subtext="Running deep text parsing & AI skill inference model" 
          />
        </Card>
      )}

      {appliedToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2 animate-fadeIn shadow-sm">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" /> Extracted resume skills have been successfully synced to your profile!
        </div>
      )}

      {/* Extraction Results */}
      {result && (
        <div className="space-y-6 animate-fadeIn">
          <Card className="space-y-6 border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Analysis Complete</span>
                <h2 className="font-display text-2xl font-extrabold text-slate-900 mt-1">Detected Skill Evidence</h2>
                <p className="text-xs text-slate-600 mt-0.5">Target Role Match: <strong className="text-blue-700">{result.target_role}</strong> ({result.skills_detected_count} skills identified)</p>
              </div>

              <div className="flex items-center gap-2">
                <button className="btn btn-success text-xs shadow-sm" onClick={handleApplyToProfile}>
                  <ShieldCheck size={16} /> Sync to Profile
                </button>
                <button className="btn btn-primary text-xs shadow-sm" onClick={() => navigate('/skill-gap')}>
                  Skill Gaps <ArrowRight size={14} />
                </button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {result.analysis?.skills?.map((s: any) => (
                <div
                  key={s.name}
                  className="p-4 rounded-2xl border space-y-2.5 transition-all bg-slate-50 border-slate-200 hover:border-blue-300"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-display font-bold text-base text-slate-900">{s.name}</h4>
                    <Badge variant={s.score >= 70 ? 'success' : 'purple'}>{s.level || 'intermediate'}</Badge>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-600 font-medium">
                      <span>Detected Signal</span>
                      <span className="font-semibold text-slate-900 font-mono">{s.score || 60}%</span>
                    </div>
                    <Progress value={s.score || 60} variant={s.score >= 80 ? 'emerald' : 'default'} />
                  </div>

                  <p className="text-[11px] text-slate-600 pt-1 line-clamp-2 italic leading-normal">
                    "{s.evidence || 'Extracted keyword match from experience.'}"
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100 text-xs">
              <span className="text-slate-500 font-medium">Verified by Gemini AI Skill Gap Agent</span>
              <div className="flex items-center gap-2">
                <button
                  className="btn btn-secondary text-xs"
                  onClick={() => navigate('/learning-tools')}
                >
                  <BookOpen size={14} /> Open Learning Tools
                </button>
                <button
                  className="btn btn-secondary text-xs"
                  onClick={() => navigate('/practice')}
                >
                  Start Practice <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
