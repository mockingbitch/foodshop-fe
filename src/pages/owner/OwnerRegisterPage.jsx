import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '@context/LanguageContext'
import { useAuth } from '@context/AuthContext'
import { hasToken } from '@utils/authToken'
import { REGEX_PATTERNS } from '@constants'
import { Mail, Lock, Eye, EyeOff, Store, User, Phone } from 'lucide-react'
import LoadingSpinner from '@components/common/LoadingSpinner'

const OwnerRegisterPage = () => {
  const { t } = useLanguage()
  const { registerOwner, isAuthenticated, user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const isOwnerRole = user?.role === 'owner' || user?.role === 'restaurant_owner'
    const hasAuth = hasToken() || isAuthenticated
    if (!authLoading && hasAuth && (isOwnerRole || !user)) {
      navigate('/owner/dashboard', { replace: true })
    }
  }, [authLoading, isAuthenticated, user, navigate])

  const shouldRedirect =
    !authLoading &&
    (hasToken() || isAuthenticated) &&
    (user?.role === 'owner' || user?.role === 'restaurant_owner' || !user)
  if (authLoading || shouldRedirect) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    )
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name?.trim()) {
      newErrors.name = (t('auth.name') || 'Name') + ' ' + t('common.required')
    }

    if (!formData.email) {
      newErrors.email = t('auth.email') + ' ' + t('common.required')
    } else if (!REGEX_PATTERNS.EMAIL.test(formData.email)) {
      newErrors.email = t('auth.invalidEmail')
    }

    if (formData.phone?.trim() && !REGEX_PATTERNS.PHONE.test(formData.phone.trim())) {
      newErrors.phone = t('auth.invalidPhone')
    }

    if (!formData.password) {
      newErrors.password = t('auth.password') + ' ' + t('common.required')
    } else if (formData.password.length < 6) {
      newErrors.password = t('auth.passwordMinLength')
    }

    if (!formData.password_confirmation) {
      newErrors.password_confirmation =
        (t('auth.confirmPassword') || 'Confirm Password') + ' ' + t('common.required')
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation =
        t('auth.passwordMismatch') || 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    try {
      const result = await registerOwner(formData)
      if (result.success) {
        navigate('/owner/dashboard', { replace: true })
      }
    } catch (error) {
      console.error('Register error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg">
              <Store className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('owner.title')}</h1>
          <p className="text-gray-600">{t('auth.registerTitle')}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.name') || 'Full name'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`input pl-10 ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder={t('auth.name') || 'Full name'}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Email */}
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

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.phone')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`input pl-10 ${errors.phone ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder={t('auth.phonePlaceholder')}
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Password */}
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
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`input pl-10 pr-10 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder={t('auth.password')}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
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

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="password_confirmation"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t('auth.confirmPassword')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password_confirmation"
                  name="password_confirmation"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  className={`input pl-10 pr-10 ${errors.password_confirmation ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder={t('auth.confirmPassword')}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password_confirmation && (
                <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>
              )}
            </div>

            {/* Submit */}
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
                  <span>{t('auth.registerTitle')}</span>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t('auth.hasAccount')}{' '}
              <Link
                to="/owner/login"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                {t('auth.loginTitle')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OwnerRegisterPage
