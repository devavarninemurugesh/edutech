import { useEffect, useState } from 'react'
import { Card, Badge, Progress } from '../components/UI'
import { LogoLoader } from '../components/LogoLoader'
import { getProfile, updateProfile, getRoles } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { UserRound, Save, Plus, CheckCircle2, Sparkles, Target, Sliders, Trash2, Mail, Clock, BookOpen } from 'lucide-react'

export default function Profile() {
  const { setUserProfile } = useAuth()
  const [profile, setProfile] = useState<any>({ skills: {} })
  const [availableRoles, setAvailableRoles] = useState<string[]>([
    'Data Scientist', 'AI/ML Engineer', 'Data Analyst', 'Full Stack Developer', 
    'Backend Developer', 'Cloud & DevOps Engineer', 'Cybersecurity Analyst', 'Software Engineer'
  ])
  const [newSkillName, setNewSkillName] = useState('')
  const [newSkillScore, setNewSkillScore] = useState(50)
  const [savedToast, setSavedToast] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getProfile(), getRoles()])
      .then(([profRes, rolesRes]) => {
        setProfile(profRes.data)
        if (rolesRes.data?.roles) setAvailableRoles(rolesRes.data.roles)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    const res = await updateProfile(profile)
    setProfile(res.data)
    setUserProfile({
      name: res.data.name,
      email: res.data.email,
      target_role: res.data.target_role,
      goal: res.data.goal,
      hours_per_week: res.data.hours_per_week,
      education: res.data.education,
      experience: res.data.experience,
      resume_uploaded: res.data.resume_uploaded
    })
    setSavedToast(true)
    setTimeout(() => setSavedToast(false), 3500)
  }

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return
    setProfile({
      ...profile,
      skills: {
        ...profile.skills,
        [newSkillName.trim()]: newSkillScore
      }
    })
    setNewSkillName('')
    setNewSkillScore(50)
  }

  const handleRemoveSkill = (skillKey: string) => {
    const updatedSkills = { ...profile.skills }
    delete updatedSkills[skillKey]
    setProfile({ ...profile, skills: updatedSkills })
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <LogoLoader 
          size="lg"
          text="Loading learner profile..." 
          subtext="Fetching skill matrix, target roles & custom career goal" 
        />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fadeIn pb-12 font-sans">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
          <UserRound size={16} /> Learner Persona & Target Configuration
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold mt-1 tracking-tight text-slate-900">
          My Profile & Skill Signals
        </h1>
        <p className="text-slate-600 mt-1 text-sm leading-relaxed">
          Keep your career preferences, target role, weekly availability, and baseline skill ratings up to date for accurate AI roadmap adaptation.
        </p>
      </div>

      {savedToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2 animate-fadeIn shadow-sm">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" /> Profile and skill inventory updated successfully!
        </div>
      )}

      {/* Profile Details Card */}
      <Card className="space-y-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="font-display font-bold text-xl text-slate-900">Learner Overview</h2>
          <Badge variant="purple">AI Adaptive Profile</Badge>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <label className="space-y-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Name</span>
            <input
              type="text"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-900 font-semibold focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder-slate-400"
              value={profile.name || ''}
              onChange={e => setProfile({ ...profile, name: e.target.value })}
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Target Role Benchmark</span>
            <select
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm font-bold text-blue-700 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all cursor-pointer"
              value={profile.target_role || 'Data Scientist'}
              onChange={e => setProfile({ ...profile, target_role: e.target.value })}
            >
              {availableRoles.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Education Background</span>
            <input
              type="text"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-900 font-semibold focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder-slate-400"
              value={profile.education || ''}
              onChange={e => setProfile({ ...profile, education: e.target.value })}
              placeholder="e.g. B.S. Computer Science"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Experience Level</span>
            <input
              type="text"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-900 font-semibold focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder-slate-400"
              value={profile.experience || ''}
              onChange={e => setProfile({ ...profile, experience: e.target.value })}
              placeholder="e.g. Junior Developer / Student"
            />
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Career Goal / Target Timeline</span>
            <input
              type="text"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-900 font-semibold focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder-slate-400"
              value={profile.goal || ''}
              onChange={e => setProfile({ ...profile, goal: e.target.value })}
              placeholder="e.g. Land a Data Science role in 3 months"
            />
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Weekly Commitment (Hours / Week)</span>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={2}
                max={40}
                className="flex-1 accent-blue-600 cursor-pointer"
                value={profile.hours_per_week || 10}
                onChange={e => setProfile({ ...profile, hours_per_week: parseInt(e.target.value) || 10 })}
              />
              <span className="font-mono font-extrabold text-sm text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl shrink-0">
                {profile.hours_per_week || 10} hrs/wk
              </span>
            </div>
          </label>
        </div>
      </Card>

      {/* Skills Management Card */}
      <Card className="space-y-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="font-display font-bold text-xl text-slate-900">Current Skill Inventory</h2>
            <p className="text-slate-500 text-xs">Extracted from analyzed resume & assessment signals</p>
          </div>
          <Badge variant="success">Verified Signals</Badge>
        </div>

        {/* Existing Skills List */}
        <div className="grid sm:grid-cols-2 gap-4">
          {Object.entries(profile.skills || {}).map(([skill, score]) => (
            <div key={skill} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
              <div className="flex-1 space-y-1.5 min-w-0">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-800 truncate">{skill}</span>
                  <span className={(score as number) >= 80 ? 'text-emerald-700 font-mono' : 'text-blue-700 font-mono'}>
                    {score as number}%
                  </span>
                </div>
                <Progress value={score as number} variant={(score as number) >= 80 ? 'emerald' : 'default'} />
              </div>
              <button 
                onClick={() => handleRemoveSkill(skill)}
                className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                title="Remove skill"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Add Custom Skill Form */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Add Custom Skill Signal</span>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              className="flex-1 w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-900 font-semibold focus:bg-white focus:border-blue-600 outline-none placeholder-slate-400"
              placeholder="e.g. Docker, PyTorch, GraphQL..."
              value={newSkillName}
              onChange={e => setNewSkillName(e.target.value)}
            />
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-500 font-mono font-bold whitespace-nowrap">Rating: {newSkillScore}%</span>
              <input
                type="range"
                min={10}
                max={100}
                className="w-24 accent-blue-600 cursor-pointer"
                value={newSkillScore}
                onChange={e => setNewSkillScore(parseInt(e.target.value) || 50)}
              />
              <button className="btn btn-secondary text-xs px-4" onClick={handleAddSkill}>
                <Plus size={16} /> Add Skill
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Save Button Bar */}
      <div className="flex justify-end pt-2">
        <button className="btn btn-primary px-8 py-3 text-sm shadow-md cursor-pointer" onClick={handleSave}>
          <Save size={18} /> Save Profile & Skill Signals
        </button>
      </div>
    </div>
  )
}
