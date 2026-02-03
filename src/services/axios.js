import axios from 'axios'
import { API_BASE_URL, API_TIMEOUT, ERROR_MESSAGES } from '@constants'
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
    if (!error.response) {
      // Network error
      toast.error(ERROR_MESSAGES.NETWORK_ERROR)
      return Promise.reject(error)
    }

    const { status, data } = error.response

    switch (status) {
      case 401: {
        const isAuthMe = error.config?.url?.includes('/auth/me') ?? false
        clearToken()
        if (!isAuthMe) {
          toast.error(data?.message || ERROR_MESSAGES.UNAUTHORIZED)
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/owner/login'
          }
        }
        break
      }

      case 403:
        toast.error(data?.message || ERROR_MESSAGES.FORBIDDEN)
        break

      case 404:
        toast.error(data?.message || ERROR_MESSAGES.NOT_FOUND)
        break

      case 422:
        // Validation error
        if (data?.errors) {
          const firstError = Object.values(data.errors)[0]
          toast.error(Array.isArray(firstError) ? firstError[0] : firstError)
        } else {
          toast.error(data?.message || ERROR_MESSAGES.VALIDATION_ERROR)
        }
        break

      case 500:
      case 502:
      case 503:
        toast.error(data?.message || ERROR_MESSAGES.SERVER_ERROR)
        break

      default:
        toast.error(data?.message || ERROR_MESSAGES.NETWORK_ERROR)
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
