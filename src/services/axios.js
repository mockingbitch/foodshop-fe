import axios from 'axios'
import { API_BASE_URL, API_TIMEOUT, getErrorMessageKey } from '@constants'
import { translate } from '@utils/translate'
import { getToken, clearToken } from '@utils/authToken'
import { toast } from 'react-toastify'
import { translateBackendMessage } from '@utils/backendMessageI18n'

function extractServerErrorMessage(data) {
  if (!data) return null
  if (typeof data === 'string') return data.trim() || null
  if (typeof data !== 'object') return null

  // Common Laravel style: { message, errors: { field: [msg] } }
  const errs = data.errors
  if (errs && typeof errs === 'object') {
    const messages = []
    Object.values(errs).forEach((v) => {
      if (Array.isArray(v)) v.forEach((m) => { if (typeof m === 'string' && m.trim()) messages.push(m.trim()) })
      else if (typeof v === 'string' && v.trim()) messages.push(v.trim())
    })
    const unique = [...new Set(messages)]
    if (unique.length) return unique.join('\n')
  }

  if (typeof data.message === 'string' && data.message.trim()) return data.message.trim()
  if (typeof data.error === 'string' && data.error.trim()) return data.error.trim()
  return null
}

if (import.meta.env.DEV) {
  console.log('[API] baseURL:', API_BASE_URL)
}

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  withCredentials: true, // gửi/nhận HttpOnly cookie
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Add language header
    const language = localStorage.getItem('language') || 'en'
    config.headers['Accept-Language'] = language

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const fallbackMessage = translate(getErrorMessageKey(error))
    if (!error.response) {
      toast.error(fallbackMessage)
      return Promise.reject(error)
    }
    const { status } = error.response
    const serverMessage = extractServerErrorMessage(error.response?.data)
    const translatedServerMessage = translateBackendMessage(serverMessage)
    if (status === 422) {
      toast.error(translatedServerMessage || serverMessage || fallbackMessage)
      return Promise.reject(error)
    }
    if (status === 401) {
      const isAuthMe = error.config?.url?.includes('/auth/me') ?? false
      clearToken()
      if (!isAuthMe) {
        toast.error(translatedServerMessage || serverMessage || fallbackMessage)
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/owner/login'
        }
      }
    } else {
      toast.error(translatedServerMessage || serverMessage || fallbackMessage)
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
