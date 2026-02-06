import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useLanguage } from '@context/LanguageContext'
import { newsApi } from '@services/api/newsApi'
import { toast } from 'react-toastify'
import LoadingSpinner from '@components/common/LoadingSpinner'
import ConfirmModal from '@components/common/ConfirmModal'
import { ChevronRight, Trash2 } from 'lucide-react'

const NEWS_TYPES = [
  { value: 'news', labelKey: 'common.news' },
  { value: 'course', labelKey: 'common.courses' },
  { value: 'chef', labelKey: 'common.chefs' },
]

const NewsEditPage = () => {
  const { id } = useParams()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    type: 'news',
    title: '',
    content: '',
    image: '',
    status: 'active',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    if (!id) {
      setNotFound(true)
      setLoading(false)
      return
    }
    setLoading(true)
    setNotFound(false)
    newsApi
      .getNewsById(id)
      .then((res) => {
        const raw = res?.data ?? res
        const item = raw?.data ?? raw?.news ?? raw?.result ?? raw
        if (!item || typeof item !== 'object') {
          setNotFound(true)
          setLoading(false)
          return
        }
        setFormData({
          type: item.type ?? 'news',
          title: item.title ?? '',
          content: item.content ?? '',
          image: item.image ?? '',
          status: item.status ?? 'active',
        })
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const err = {}
    if (!formData.title?.trim()) err.title = t('common.required')
    setErrors(err)
    return Object.keys(err).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate() || submitting || !id) return
    setSubmitting(true)
    try {
      const payload = {
        type: formData.type,
        title: formData.title?.trim() || '',
        content: formData.content?.trim() || '',
        image: formData.image?.trim() || undefined,
        status: formData.status || 'active',
      }
      await newsApi.updateNews(id, payload)
      toast.success(t('common.success'))
      navigate('/admin/news', { replace: true })
    } catch (error) {
      console.error(error)
      toast.error(t('common.error'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setSubmitting(true)
    try {
      await newsApi.deleteNews(id)
      toast.success(t('common.success'))
      navigate('/admin/news', { replace: true })
    } catch (error) {
      console.error(error)
      toast.error(t('common.error'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="w-full max-w-3xl mx-auto flex justify-center items-center min-h-[320px]">
        <LoadingSpinner />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <div className="card p-8 text-center">
          <p className="text-gray-600 mb-4">{t('common.noData')}</p>
          <Link to="/admin/news" className="btn btn-primary">{t('common.back')}</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <nav className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 mb-6 flex-wrap">
        <Link to="/admin/dashboard" className="hover:text-primary-600">{t('admin.title')}</Link>
        <ChevronRight size={14} className="flex-shrink-0" />
        <Link to="/admin/news" className="hover:text-primary-600">{t('admin.manageNews')}</Link>
        <ChevronRight size={14} className="flex-shrink-0" />
        <span className="text-gray-700">{t('common.edit')}</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('common.edit')} {t('admin.manageNews')}</h1>
      </div>

      <div className="card p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type <span className="text-red-500">*</span></label>
            <select name="type" value={formData.type} onChange={handleChange} className="input w-full">
              {NEWS_TYPES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {t(opt.labelKey)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`input w-full ${errors.title ? 'border-red-500' : ''}`}
              placeholder="Title"
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              className="input w-full min-h-[120px]"
              placeholder="Content"
              rows={5}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleChange}
              className="input w-full"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select name="status" value={formData.status} onChange={handleChange} className="input w-full">
              <option value="active">{t('common.active')}</option>
              <option value="inactive">{t('common.inactive')}</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? t('common.loading') + '...' : t('common.save')}
            </button>
            <Link to="/admin/news" className="btn btn-outline">{t('common.cancel')}</Link>
            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              disabled={submitting}
              className="btn btn-outline text-red-600 border-red-200 hover:bg-red-50 inline-flex items-center gap-2"
            >
              <Trash2 size={18} />
              {t('common.delete')}
            </button>
          </div>
        </form>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title={t('common.confirmDelete')}
        message={t('common.confirmDelete')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="danger"
      />
    </div>
  )
}

export default NewsEditPage
