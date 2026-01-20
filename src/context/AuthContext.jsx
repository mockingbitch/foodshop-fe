import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { 
  getAuthToken, 
  setAuthToken as saveAuthToken, 
  removeAuthToken,
  getUserData,
  setUserData as saveUserData,
  removeUserData 
} from '@utils/storage'
import { authApi } from '@services/api/authApi'
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '@constants'

const AuthContext = createContext(null)

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

  // Check authentication status on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = getAuthToken()
      const userData = getUserData()

      if (token && userData) {
        setUser(userData)
        setIsAuthenticated(true)
        
        // Optionally verify token with backend
        try {
          const response = await authApi.me()
          setUser(response.data)
          saveUserData(response.data)
        } catch (error) {
          // Token might be expired
          if (error.response?.status === 401) {
            logout(false)
          }
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const loginOwner = async (credentials) => {
    try {
      const response = await authApi.loginOwner(credentials)
      const { token, user: userData } = response.data

      saveAuthToken(token)
      saveUserData(userData)
      setUser(userData)
      setIsAuthenticated(true)

      toast.success(SUCCESS_MESSAGES.LOGIN_SUCCESS)
      navigate('/owner/profile')
      
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || ERROR_MESSAGES.NETWORK_ERROR
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const loginAdmin = async (credentials) => {
    try {
      const response = await authApi.loginAdmin(credentials)
      const { token, user: userData } = response.data

      saveAuthToken(token)
      saveUserData(userData)
      setUser(userData)
      setIsAuthenticated(true)

      toast.success(SUCCESS_MESSAGES.LOGIN_SUCCESS)
      navigate('/admin/dashboard')
      
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || ERROR_MESSAGES.NETWORK_ERROR
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const registerOwner = async (data) => {
    try {
      const response = await authApi.registerOwner(data)
      const { token, user: userData } = response.data

      saveAuthToken(token)
      saveUserData(userData)
      setUser(userData)
      setIsAuthenticated(true)

      toast.success(SUCCESS_MESSAGES.REGISTER_SUCCESS)
      navigate('/owner/profile')
      
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || ERROR_MESSAGES.NETWORK_ERROR
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const logout = (showToast = true) => {
    removeAuthToken()
    removeUserData()
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

      saveUserData(userData)
      setUser(userData)

      toast.success(SUCCESS_MESSAGES.UPDATE_SUCCESS)
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || ERROR_MESSAGES.NETWORK_ERROR
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const isOwner = () => {
    return user?.role === 'owner'
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
