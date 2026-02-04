import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '@context/LanguageContext'
import { useAuth } from '@context/AuthContext'
import { User } from 'lucide-react'
import { toast } from 'react-toastify'

const OwnerProfilePage = () => {
  const { t } = useLanguage()
  const { user, updateProfile } = useAuth()
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name ?? '',
        email: user.email ?? '',
        phone: user.phone ?? '',
      })
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const err = {}
    if (!formData.email?.trim()) err.email = t('common.required')
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      err.email = t('auth.invalidEmail')
    }
    setErrors(err)
    return Object.keys(err).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate() || submitting) return
    setSubmitting(true)
    try {
      const result = await updateProfile({
        name: formData.name?.trim() || undefined,
        email: formData.email?.trim(),
        phone: formData.phone?.trim() || undefined,
      })
      if (result?.success) {
        toast.success(t('common.success'))
      } else if (result?.error) {
        toast.error(t(result.error))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="w-full max-w-2xl mx-auto py-8">
        <div className="card p-6 text-center text-gray-600">
          {t('common.loading')}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('common.profile')}</h1>
        <nav className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 mt-1 flex-wrap">
          <Link to="/" className="hover:text-primary-600">{t('common.home')}</Link>
          <span>/</span>
          <Link to="/owner/dashboard" className="hover:text-primary-600">{t('owner.title')}</Link>
          <span>/</span>
          <span className="text-gray-700">{t('common.profile')}</span>
        </nav>
      </div>

      {/* Thông tin user (hiển thị) */}
      <div className="card p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          {t('common.profile')} — {t('common.view')}
        </h2>
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-shrink-0 flex justify-center sm:justify-start">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden border-2 border-primary-200">
              {user.avatar ? (
                <img src={user.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-primary-600" />
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0 space-y-3">
            <div>
              <span className="text-xs font-medium text-gray-500 uppercase">{t('common.profile')} (name)</span>
              <p className="text-gray-900 font-medium mt-0.5">{user.name || '—'}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-gray-500 uppercase">{t('auth.email')}</span>
              <p className="text-gray-900 font-medium mt-0.5">{user.email || '—'}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-gray-500 uppercase">{t('restaurant.phone')}</span>
              <p className="text-gray-900 font-medium mt-0.5">{user.phone || '—'}</p>
            </div>
            {user.role && (
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase">Role</span>
                <p className="text-gray-900 font-medium mt-0.5 capitalize">{user.role}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form chỉnh sửa */}
      <div className="card p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          {t('common.edit')} {t('common.profile')}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.email')} *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`input w-full ${errors.email ? 'border-red-500' : ''}`}
              placeholder="email@example.com"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.profile')} (name)</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input w-full"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('restaurant.phone')}</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="input w-full"
              placeholder="Phone number"
            />
          </div>
          <div className="pt-2">
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? t('common.loading') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default OwnerProfilePage
