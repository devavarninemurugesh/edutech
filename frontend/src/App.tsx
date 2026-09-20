import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import ResumeAnalyzer from './pages/ResumeAnalyzer'
import SkillGap from './pages/SkillGap'
import LearningTools from './pages/LearningTools'
import Roadmap from './pages/Roadmap'
import WeeklyPlan from './pages/WeeklyPlan'
import Practice from './pages/Practice'
import PracticeWorkspace from './pages/PracticeWorkspace'
import Assessment from './pages/Assessment'
import AssessmentWorkspace from './pages/AssessmentWorkspace'
import Progress from './pages/Progress'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Assistant from './pages/Assistant'
import { LogoLoader } from './components/LogoLoader'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <LogoLoader size="lg" text="Verifying learner profile..." subtext="Checking session authentication & active skill matrix" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login & Resume Onboarding Route */}
          <Route path="/login" element={<Login />} />

          {/* Full-screen Standalone LeetCode Workspace Routes */}
          <Route
            path="/practice/workspace"
            element={
              <ProtectedRoute>
                <PracticeWorkspace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assessment/workspace"
            element={
              <ProtectedRoute>
                <AssessmentWorkspace />
              </ProtectedRoute>
            }
          />

          {/* Main Application Layout Protected Routes */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
            <Route path="/skill-gap" element={<SkillGap />} />
            <Route path="/learning-tools" element={<LearningTools />} />
            <Route path="/roadmap" element={<Roadmap />} />
            <Route path="/weekly-plan" element={<WeeklyPlan />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/assessment" element={<Assessment />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/assistant" element={<Assistant />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
