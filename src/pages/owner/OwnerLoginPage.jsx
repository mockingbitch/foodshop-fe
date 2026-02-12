import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useLanguage } from '@context/LanguageContext'
import { useAuth } from '@context/AuthContext'
import { hasToken } from '@utils/authToken'

import { REGEX_PATTERNS } from '@constants'
import { Mail, Lock, Eye, EyeOff, Store, Shield } from 'lucide-react'
import LoadingSpinner from '@components/common/LoadingSpinner'
import { IconGoogle, IconFacebook } from '@components/icons'

const OwnerLoginPage = () => {
  const { t } = useLanguage()
  const { loginOwner, isAuthenticated, user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: true,
  })
  
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // Đã đăng nhập owner → chuyển sang dashboard (kể cả khi user chưa load xong từ /auth/me)
  useEffect(() => {
    const isOwnerRole = user?.role === 'owner' || user?.role === 'restaurant_owner'
    const hasAuth = hasToken() || isAuthenticated
    if (!authLoading && hasAuth && (isOwnerRole || !user)) {
      navigate('/owner/dashboard', { replace: true })
    }
  }, [authLoading, isAuthenticated, user, navigate])

  // Đang check auth hoặc đã có auth (sẽ redirect) → không render form
  const shouldRedirect = !authLoading && (hasToken() || isAuthenticated) && (user?.role === 'owner' || user?.role === 'restaurant_owner' || !user)
  if (authLoading || shouldRedirect) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    )
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email) {
      newErrors.email = t('auth.email') + ' ' + t('common.required')
    } else if (!REGEX_PATTERNS.EMAIL.test(formData.email)) {
      newErrors.email = t('auth.invalidEmail')
    }

    if (!formData.password) {
      newErrors.password = t('auth.password') + ' ' + t('common.required')
    } else if (formData.password.length < 6) {
      newErrors.password = t('auth.passwordMinLength')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const result = await loginOwner(formData)
      if (result.success) {
        navigate('/owner/dashboard', { replace: true })
      }
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Link sang trang Admin Login */}
      <Link
        to="/admin/login"
        className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2 px-3 py-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        title={t('admin.login')}
        aria-label={t('admin.login')}
      >
        <Shield size={20} className="flex-shrink-0" />
        <span className="text-sm font-medium hidden sm:inline">{t('admin.login')}</span>
      </Link>

      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg">
              <Store className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('owner.title')}
          </h1>
          <p className="text-gray-600">
            {t('auth.loginTitle')}
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.email')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`input pl-10 ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder={t('auth.email')}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.password')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`input pl-10 pr-10 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder={t('auth.password')}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  {t('auth.rememberMe')}
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="#"
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  {t('auth.forgotPassword')}
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary flex items-center justify-center space-x-2 py-3 text-lg"
              >
                {loading ? (
                  <>
                    <LoadingSpinner />
                    <span>{t('common.loading')}</span>
                  </>
                ) : (
                  <span>{t('auth.loginTitle')}</span>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">{t('auth.orContinueWith')}</span>
              </div>
            </div>
          </div>

          {/* Social Login Buttons (Optional) */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => toast.info(t('auth.socialLoginNotSupported'))}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <IconGoogle className="h-5 w-5" />
              <span className="ml-2">Google</span>
            </button>
            <button
              type="button"
              onClick={() => toast.info(t('auth.socialLoginNotSupported'))}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <IconFacebook className="h-5 w-5" />
              <span className="ml-2">Facebook</span>
            </button>
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t('auth.noAccount')}{' '}
              <Link
                to="/owner/register"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                {t('auth.registerTitle')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OwnerLoginPage
