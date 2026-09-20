import { useEffect, useState } from 'react'
import { Card } from '../components/UI'
import { LogoLoader } from '../components/LogoLoader'
import { getSettings, updateSettings, resetDemoData } from '../services/api'
import { useTheme } from '../context/ThemeContext'
import { Settings as SettingsIcon, Save, RefreshCw, Sliders, CheckCircle2, Sparkles, ShieldCheck } from 'lucide-react'

export default function Settings() {
  const { theme, setTheme } = useTheme()
  const [settings, setSettings] = useState<any>({
    learning_pace: 'balanced',
    notifications: true,
    auto_sync_resume: true
  })
  const [savedToast, setSavedToast] = useState(false)
  const [resetModal, setResetModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSettings()
      .then(res => {
        if (res.data) {
          setSettings({
            learning_pace: res.data.learning_pace || 'balanced',
            notifications: res.data.notifications !== undefined ? res.data.notifications : true,
            auto_sync_resume: res.data.auto_sync_resume !== undefined ? res.data.auto_sync_resume : true
          })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    await updateSettings(settings)
    setSavedToast(true)
    setTimeout(() => setSavedToast(false), 3500)
  }

  const handleReset = async () => {
    await resetDemoData()
    setResetModal(false)
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <LogoLoader 
          size="lg"
          text="Loading system settings..." 
          subtext="Configuring learning preferences" 
        />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fadeIn pb-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider">
          <SettingsIcon size={16} /> Preferences & Configuration
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold mt-1 tracking-tight text-slate-900">
          Platform Settings
        </h1>
        <p className="text-slate-600 mt-1 text-sm leading-relaxed">
          Customize your learning velocity, notification preferences, and system defaults.
        </p>
      </div>

      {savedToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2 animate-fadeIn shadow-sm">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" /> Settings successfully updated!
        </div>
      )}

      {/* AI Engine Status Card (Secure & Managed) */}
      <Card>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-slate-900">Google Gemini AI Engine</h2>
              <p className="text-slate-600 text-xs">Powers dynamic roadmap generation, question synthesis, and natural language mentorship</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live & Connected
            </span>
            <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 border border-slate-200">
              <ShieldCheck size={14} className="text-indigo-600" /> Secure Server Environment
            </span>
          </div>
        </div>
      </Card>

      {/* Learning & Notification Preferences */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-2xl bg-indigo-100 text-indigo-700 border border-indigo-200">
            <Sliders size={20} />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-slate-900">Adaptive Learning Preferences</h2>
            <p className="text-slate-600 text-xs">Adjust how EduPath schedules weekly targets and notifications</p>
          </div>
        </div>

        <div className="space-y-6 mt-5">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-3">Learning Velocity / Pace</label>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                ['relaxed', 'Relaxed (5 hrs/wk)', 'Subtle task progression'],
                ['balanced', 'Balanced (10-15 hrs/wk)', 'Standard recommended pace'],
                ['intensive', 'Intensive (20+ hrs/wk)', 'Fast-track career pivot']
              ].map(([key, title, desc]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSettings({ ...settings, learning_pace: key })}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    settings.learning_pace === key
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-950 font-bold ring-2 ring-indigo-200 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="font-display font-bold text-sm text-slate-900">{title}</div>
                  <div className="text-xs text-slate-500 mt-1 font-medium">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="font-bold text-sm text-slate-900">Auto-Apply Resume Extracted Skills</div>
                <div className="text-xs text-slate-600">Automatically sync high-confidence skills parsed from uploaded resumes</div>
              </div>
              <input
                type="checkbox"
                className="h-5 w-5 rounded-lg border-slate-300 bg-white text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                checked={settings.auto_sync_resume}
                onChange={e => setSettings({ ...settings, auto_sync_resume: e.target.checked })}
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="font-bold text-sm text-slate-900">Adaptive Progress Notifications</div>
                <div className="text-xs text-slate-600">Receive weekly task reminders and milestone achievements</div>
              </div>
              <input
                type="checkbox"
                className="h-5 w-5 rounded-lg border-slate-300 bg-white text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                checked={settings.notifications}
                onChange={e => setSettings({ ...settings, notifications: e.target.checked })}
              />
            </label>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button className="btn btn-primary px-8 cursor-pointer" onClick={handleSave}>
          <Save size={18} /> Save Settings
        </button>

        <button 
          className="btn btn-secondary text-rose-600 hover:text-rose-700 border-rose-200 hover:bg-rose-50 cursor-pointer"
          onClick={() => setResetModal(true)}
        >
          <RefreshCw size={16} /> Reset Demo Data
        </button>
      </div>

      {/* Confirmation Modal */}
      {resetModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-display font-extrabold text-xl text-rose-600">Reset Prototype Data?</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              This will restore default demo profile scores, clear task history, and reset your skill progress.
            </p>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button className="btn btn-secondary text-xs cursor-pointer" onClick={() => setResetModal(false)}>
                Cancel
              </button>
              <button className="btn btn-secondary text-xs text-rose-600 border-rose-200 hover:bg-rose-50 cursor-pointer" onClick={handleReset}>
                Reset Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
