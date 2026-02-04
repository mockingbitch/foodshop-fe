import axios from 'axios'
import { API_BASE_URL, API_TIMEOUT, getErrorMessageKey } from '@constants'
import { translate } from '@utils/translate'
import { getToken, clearToken } from '@utils/authToken'
import { toast } from 'react-toastify'

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
    const message = translate(getErrorMessageKey(error))
    if (!error.response) {
      toast.error(message)
      return Promise.reject(error)
    }
    const { status } = error.response
    if (status === 401) {
      const isAuthMe = error.config?.url?.includes('/auth/me') ?? false
      clearToken()
      if (!isAuthMe) {
        toast.error(message)
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/owner/login'
        }
      }
    } else {
      toast.error(message)
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
