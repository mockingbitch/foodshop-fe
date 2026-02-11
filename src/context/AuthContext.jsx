import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { flushSync } from 'react-dom'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { restoreToken, setToken, clearToken, hasToken, getRememberMe } from '@utils/authToken'
import { authApi } from '@services/api/authApi'
import { SUCCESS_MESSAGES, ERROR_MESSAGES, getErrorMessageKey } from '@constants'

const AuthContext = createContext(null)
const USER_STORAGE_KEY = 'auth_user'

function getStoredUser() {
  try {
    const storage = typeof getRememberMe === 'function' && getRememberMe() && typeof localStorage !== 'undefined'
      ? localStorage
      : typeof sessionStorage !== 'undefined'
        ? sessionStorage
        : null
    if (!storage) return null
    const raw = storage.getItem(USER_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

/** @param {object|null} user - @param {boolean} [remember] - nếu không truyền thì lấy từ cookie remember_me */
function setStoredUser(user, remember) {
  try {
    const useLocal = remember ?? (typeof getRememberMe === 'function' && getRememberMe())
    if (user) {
      if (useLocal && typeof localStorage !== 'undefined') {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
        sessionStorage.removeItem(USER_STORAGE_KEY)
      } else if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
        localStorage.removeItem(USER_STORAGE_KEY)
      }
    } else {
      if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem(USER_STORAGE_KEY)
      if (typeof localStorage !== 'undefined') localStorage.removeItem(USER_STORAGE_KEY)
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
  // Khởi tạo user từ sessionStorage ngay để reload không mất: tránh effect fetchUser chạy khi user=null rồi 401 xóa user.
  const [user, setUser] = useState(() => getStoredUser())
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
        setStoredUser(nextUser, getRememberMe())
        setIsAuthenticated(true)
        if (tokenFromMe) setToken(tokenFromMe, { remember: getRememberMe() })
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

      const remember = !!credentials.rememberMe
      setToken(token, { remember })
      const nextUser = { ...(userData ?? {}), role: userData?.role || 'owner' }
      flushSync(() => {
        setUser(nextUser)
        setStoredUser(nextUser, remember)
        setIsAuthenticated(true)
      })

      toast.success(SUCCESS_MESSAGES.LOGIN_SUCCESS)
      navigate('/owner/dashboard', { replace: true })

      return { success: true }
    } catch (error) {
      // Toast đã hiển thị ở axios interceptor, không gọi lại để tránh duplicate
      return { success: false, error: getErrorMessageKey(error) }
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

      const remember = !!credentials.rememberMe
      setToken(token, { remember })
      const nextUser = { ...(userData ?? {}), role: 'admin' }
      flushSync(() => {
        setUser(nextUser)
        setStoredUser(nextUser, remember)
        setIsAuthenticated(true)
      })

      toast.success(SUCCESS_MESSAGES.LOGIN_SUCCESS)
      navigate('/admin/dashboard', { replace: true })

      return { success: true }
    } catch (error) {
      return { success: false, error: getErrorMessageKey(error) }
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

      const remember = !!data.rememberMe
      setToken(token, { remember })
      const nextUser = { ...(userData ?? {}), role: userData?.role || 'owner' }
      flushSync(() => {
        setUser(nextUser)
        setStoredUser(nextUser, remember)
        setIsAuthenticated(true)
      })

      toast.success(SUCCESS_MESSAGES.REGISTER_SUCCESS)
      navigate('/owner/dashboard', { replace: true })

      return { success: true }
    } catch (error) {
      return { success: false, error: getErrorMessageKey(error) }
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
      setStoredUser(userData, getRememberMe())

      toast.success(SUCCESS_MESSAGES.UPDATE_SUCCESS)
      return { success: true }
    } catch (error) {
      return { success: false, error: getErrorMessageKey(error) }
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
