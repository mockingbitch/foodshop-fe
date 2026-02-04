import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { flushSync } from 'react-dom'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { restoreToken, setToken, clearToken, hasToken } from '@utils/authToken'
import { authApi } from '@services/api/authApi'
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '@constants'

const AuthContext = createContext(null)
const USER_STORAGE_KEY = 'auth_user'

function getStoredUser() {
  try {
    const raw = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(USER_STORAGE_KEY) : null
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

function setStoredUser(user) {
  try {
    if (typeof sessionStorage !== 'undefined') {
      if (user) sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
      else sessionStorage.removeItem(USER_STORAGE_KEY)
    }
  } catch {
    // ignore
  }
}

/** Chuẩn hóa response login: hỗ trợ { token, user } hoặc { access_token, user } hoặc { data: { token, user } } */
function normalizeLoginResponse(data) {
  const payload = data?.data ?? data
  const token = payload?.token ?? payload?.access_token ?? null
  const user = payload?.user ?? null
  return { token, user }
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Lúc mount: restore token + user từ sessionStorage để reload/navigate không mất thông tin user.
  useEffect(() => {
    restoreToken()
    if (hasToken()) {
      setIsAuthenticated(true)
      const stored = getStoredUser()
      if (stored) setUser(stored)
    }
    setLoading(false)
  }, [])

  const fetchUser = useCallback(async () => {
    if (!hasToken() && !isAuthenticated) return
    try {
      const response = await authApi.me()
      const userData = response.data?.user ?? response.data
      const tokenFromMe = response.data?.token ?? response.data?.access_token
      if (userData) {
        // Backend có thể không trả role → suy ra từ path để tránh redirect về / sau reload
        const path = location.pathname
        const inferredRole = path.startsWith('/owner') ? 'owner' : path.startsWith('/admin') ? 'admin' : userData?.role
        const nextUser = { ...userData, role: userData?.role || inferredRole }
        setUser(nextUser)
        setStoredUser(nextUser)
        setIsAuthenticated(true)
        if (tokenFromMe) setToken(tokenFromMe)
      }
    } catch (error) {
      if (error.response?.status === 401) {
        clearToken()
        setStoredUser(null)
        setUser(null)
        setIsAuthenticated(false)
      }
    }
  }, [isAuthenticated, location.pathname])

  // Chỉ gọi /auth/me khi vào route owner/admin (có token, chưa có user) → tránh 401 trên homepage làm mất menu.
  useEffect(() => {
    const path = location.pathname
    const isProtectedPath = path.startsWith('/owner') || path.startsWith('/admin')
    if (isProtectedPath && (hasToken() || isAuthenticated) && user == null) {
      fetchUser()
    }
  }, [location.pathname, isAuthenticated, user, fetchUser])

  const loginOwner = async (credentials) => {
    try {
      const response = await authApi.loginOwner(credentials)
      const { token, user: userData } = normalizeLoginResponse(response.data)

      if (!token || typeof token !== 'string') {
        if (import.meta.env.DEV) console.warn('[Auth] Login response:', response.data)
        toast.error('Invalid login response: no token')
        return { success: false, error: 'Invalid login response' }
      }

      setToken(token)
      const nextUser = { ...(userData ?? {}), role: userData?.role || 'owner' }
      flushSync(() => {
        setUser(nextUser)
        setStoredUser(nextUser)
        setIsAuthenticated(true)
      })

      toast.success(SUCCESS_MESSAGES.LOGIN_SUCCESS)
      navigate('/owner/dashboard', { replace: true })

      return { success: true }
    } catch (error) {
      // Toast đã hiển thị ở axios interceptor, không gọi lại để tránh duplicate
      const message = error.response?.data?.message || ERROR_MESSAGES.NETWORK_ERROR
      return { success: false, error: message }
    }
  }

  const loginAdmin = async (credentials) => {
    try {
      const response = await authApi.loginAdmin(credentials)
      const { token, user: userData } = normalizeLoginResponse(response.data)

      if (!token || typeof token !== 'string') {
        if (import.meta.env.DEV) console.warn('[Auth] Admin login response:', response.data)
        toast.error('Invalid login response: no token')
        return { success: false, error: 'Invalid login response' }
      }

      setToken(token)
      const nextUser = { ...(userData ?? {}), role: 'admin' }
      flushSync(() => {
        setUser(nextUser)
        setStoredUser(nextUser)
        setIsAuthenticated(true)
      })

      toast.success(SUCCESS_MESSAGES.LOGIN_SUCCESS)
      navigate('/admin/dashboard', { replace: true })

      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || ERROR_MESSAGES.NETWORK_ERROR
      return { success: false, error: message }
    }
  }

  const registerOwner = async (data) => {
    try {
      const response = await authApi.registerOwner(data)
      const { token, user: userData } = normalizeLoginResponse(response.data)

      if (!token || typeof token !== 'string') {
        if (import.meta.env.DEV) console.warn('[Auth] Register response:', response.data)
        toast.error('Invalid register response: no token')
        return { success: false, error: 'Invalid register response' }
      }

      setToken(token)
      const nextUser = { ...(userData ?? {}), role: userData?.role || 'owner' }
      flushSync(() => {
        setUser(nextUser)
        setStoredUser(nextUser)
        setIsAuthenticated(true)
      })

      toast.success(SUCCESS_MESSAGES.REGISTER_SUCCESS)
      navigate('/owner/dashboard', { replace: true })

      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || ERROR_MESSAGES.NETWORK_ERROR
      return { success: false, error: message }
    }
  }

  const logout = (showToast = true) => {
    clearToken()
    setStoredUser(null)
    setUser(null)
    setIsAuthenticated(false)

    if (showToast) {
      toast.success(SUCCESS_MESSAGES.LOGOUT_SUCCESS)
    }
    
    navigate('/')
  }

  const updateProfile = async (data) => {
    try {
      const response = await authApi.updateOwnerProfile(data)
      const userData = response.data
      setUser(userData)
      setStoredUser(userData)

      toast.success(SUCCESS_MESSAGES.UPDATE_SUCCESS)
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || ERROR_MESSAGES.NETWORK_ERROR
      return { success: false, error: message }
    }
  }

  const isOwner = () => {
    return user?.role === 'owner' || user?.role === 'restaurant_owner'
  }

  const isAdmin = () => {
    return user?.role === 'admin'
  }

  const value = {
    user,
    loading,
    isAuthenticated,
    loginOwner,
    loginAdmin,
    registerOwner,
    logout,
    updateProfile,
    isOwner,
    isAdmin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
