import React, { createContext, useContext, useState, useEffect } from 'react'
import { getMe, loginApi, registerApi, onboardApi, logoutApi, getProfile } from '../services/api'

export interface UserProfile {
  name: string
  email: string
  target_role: string
  goal?: string
  hours_per_week?: number
  education?: string
  experience?: string
  resume_uploaded?: boolean
}

interface AuthContextType {
  user: UserProfile | null
  isAuthenticated: boolean
  resumeUploaded: boolean
  loading: boolean
  login: (email: string, password?: string) => Promise<any>
  register: (data: { name: string; email: string; password?: string; target_role?: string; goal?: string; hours_per_week?: number }) => Promise<any>
  onboardWithResume: (data: { name: string; email: string; target_role: string; goal?: string; hours_per_week?: number; resume_text?: string; education?: string; experience?: string }) => Promise<any>
  logout: () => Promise<void>
  refreshAuth: () => Promise<void>
  setUserProfile: (profile: UserProfile) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const AUTH_STORAGE_KEY = 'edupath_auth_user'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(true)

  const refreshAuth = async () => {
    try {
      const res = await getProfile()
      if (res.data && res.data.name) {
        const userData: UserProfile = {
          name: res.data.name,
          email: res.data.email || '',
          target_role: res.data.target_role || 'Data Scientist',
          goal: res.data.goal || '',
          hours_per_week: res.data.hours_per_week || 10,
          education: res.data.education || '',
          experience: res.data.experience || '',
          resume_uploaded: res.data.resume_uploaded || false,
        }
        setUser(userData)
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData))
      }
    } catch {
      // Backend might be offline or empty
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshAuth()
  }, [])

  const login = async (email: string, password?: string) => {
    const res = await loginApi(email, password)
    const userData: UserProfile = {
      name: res.data.user.name,
      email: res.data.user.email,
      target_role: res.data.user.target_role,
      resume_uploaded: res.data.user.resume_uploaded,
    }
    setUser(userData)
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData))
    return res.data
  }

  const register = async (data: { name: string; email: string; password?: string; target_role?: string; goal?: string; hours_per_week?: number }) => {
    const res = await registerApi(data)
    const userData: UserProfile = {
      name: res.data.user.name,
      email: res.data.user.email,
      target_role: res.data.user.target_role,
      resume_uploaded: res.data.user.resume_uploaded,
      goal: data.goal,
      hours_per_week: data.hours_per_week,
    }
    setUser(userData)
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData))
    return res.data
  }

  const onboardWithResume = async (data: { name: string; email: string; target_role: string; goal?: string; hours_per_week?: number; resume_text?: string; education?: string; experience?: string }) => {
    const res = await onboardApi(data)
    const userData: UserProfile = {
      name: res.data.user.name,
      email: res.data.user.email,
      target_role: res.data.user.target_role,
      resume_uploaded: res.data.user.resume_uploaded,
      goal: data.goal,
      hours_per_week: data.hours_per_week,
      education: data.education,
      experience: data.experience,
    }
    setUser(userData)
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData))
    return res.data
  }

  const logout = async () => {
    try {
      await logoutApi()
    } catch {}
    setUser(null)
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }

  const setUserProfile = (profile: UserProfile) => {
    setUser(profile)
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile))
  }

  const isAuthenticated = !!(user && user.name)
  const resumeUploaded = !!(user && user.resume_uploaded)

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        resumeUploaded,
        loading,
        login,
        register,
        onboardWithResume,
        logout,
        refreshAuth,
        setUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
