import axios from 'axios'

const api = axios.create({ baseURL: (import.meta as any).env?.VITE_API_URL || '/api' })

// Minimum delay (in milliseconds) so logo loader animations render smoothly
const MIN_LOADER_DELAY_MS = 600

api.interceptors.request.use((config) => {
  ;(config as any).metadata = { startTime: Date.now() }
  return config
})

api.interceptors.response.use(
  async (response) => {
    const startTime = (response.config as any)?.metadata?.startTime
    if (startTime) {
      const elapsed = Date.now() - startTime
      if (elapsed < MIN_LOADER_DELAY_MS) {
        await new Promise((resolve) => setTimeout(resolve, MIN_LOADER_DELAY_MS - elapsed))
      }
    }
    return response
  },
  async (error) => {
    const startTime = (error.config as any)?.metadata?.startTime
    if (startTime) {
      const elapsed = Date.now() - startTime
      if (elapsed < MIN_LOADER_DELAY_MS) {
        await new Promise((resolve) => setTimeout(resolve, MIN_LOADER_DELAY_MS - elapsed))
      }
    }
    return Promise.reject(error)
  }
)

// Auth Endpoints
export const loginApi = (email: string, password?: string) => api.post('/auth/login', { email, password })
export const registerApi = (data: { name: string; email: string; password?: string; target_role?: string; goal?: string; hours_per_week?: number }) =>
  api.post('/auth/register', data)
export const onboardApi = (data: { name: string; email: string; target_role: string; goal?: string; hours_per_week?: number; resume_text?: string; education?: string; experience?: string }) =>
  api.post('/auth/onboard', data)
export const getMe = () => api.get('/auth/me')
export const logoutApi = () => api.post('/auth/logout')

// General Endpoints
export const getHealth = () => api.get('/health')
export const getRoles = () => api.get('/roles')
export const getProfile = () => api.get('/profile')
export const updateProfile = (data: any) => api.put('/profile', data)
export const getRoadmap = () => api.get('/roadmap')
export const getGaps = () => api.get('/skill-gap')
export const getLearningTools = () => api.get('/learning-tools')
export const getProjects = () => api.get('/projects')
export const getWeeklyPlan = (offset = 0) => api.get(`/weekly-plan?offset=${offset}`)
export const createWeeklyTask = (data: any) => api.post('/weekly-plan/tasks', data)
export const completeTask = (id: string) => api.post(`/weekly-plan/tasks/${id}/complete`)
export const getPractice = () => api.get('/practice')
export const runPracticeCode = (code: string, language = 'python', skill = 'Python') => 
  api.post('/practice/run', { code, language, skill })
export const getAssessment = (skill: string) => api.get(`/assessment/${encodeURIComponent(skill)}`)
export const getAssessmentCatalog = () => api.get('/assessment')
export const submitAssessment = (data: any) => api.post('/assessment/submit', data)
export const getProgress = () => api.get('/progress')
export const getReport = () => api.get('/reports/weekly')
export const getSettings = () => api.get('/settings')
export const updateSettings = (data: any) => api.put('/settings', data)
export const resetDemoData = () => api.post('/settings/reset')
export const askAssistant = (question: string) => api.post('/assistant', { question })
export const analyzeResume = (file: File) => {
  const fd = new FormData()
  fd.append('file', file)
  return api.post('/resume/analyze', fd)
}
export const analyzeTextResume = (text: string, target_role?: string) => 
  api.post('/resume/analyze-text', { text, target_role })
export const applyResumeSkills = (skills: any[]) => api.post('/resume/apply', { skills })

export default api
