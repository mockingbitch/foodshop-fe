import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useLanguage } from '@context/LanguageContext'
import { categoryApi } from '@services/api/categoryApi'
import { toast } from 'react-toastify'
import LoadingSpinner from '@components/common/LoadingSpinner'
import ConfirmModal from '@components/common/ConfirmModal'
import { ChevronRight, Trash2 } from 'lucide-react'

const toDisplayText = (val) => {
  if (val == null) return ''
  if (typeof val === 'string') return val
  if (typeof val === 'object') {
    const v = val.vn ?? val.vi ?? val.kr ?? val.ko ?? val.en
    if (typeof v === 'string') return v
    const first = Object.values(val).find((x) => typeof x === 'string')
    return first ?? ''
  }
  return String(val)
}

const ensureArray = (value) => {
  if (Array.isArray(value)) return value
  if (!value || typeof value !== 'object') return []
  const raw = value.data ?? value.categories ?? value.items ?? value.results ?? value.list
  if (Array.isArray(raw)) return raw
  if (raw && typeof raw === 'object') {
    const nested = raw.data ?? raw.categories ?? raw.items ?? raw.results ?? raw.list
    return Array.isArray(nested) ? nested : []
  }
  return []
}

const CategoryEditPage = () => {
  const { id } = useParams()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ name: '', description: '', code: '', parent_id: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [parentOptions, setParentOptions] = useState([])
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    if (!id) {
      setNotFound(true)
      setLoading(false)
      return
    }
    setLoading(true)
    setNotFound(false)
    Promise.all([
      categoryApi.getCategoryById(id),
      categoryApi.getCategories({ per_page: 200 }),
    ])
      .then(([resCat, resList]) => {
        const raw = resCat?.data ?? resCat
        const cat = raw?.data ?? raw?.category ?? raw?.result ?? raw
        if (!cat || typeof cat !== 'object') {
          setNotFound(true)
          setLoading(false)
          return
        }
        const name = toDisplayText(cat.name)
        const desc = toDisplayText(cat.description)
        setFormData({
          name: name || '',
          description: desc || '',
          code: cat.code ?? '',
          parent_id: cat.parent_id != null ? String(cat.parent_id) : '',
        })
        const list = ensureArray(resList?.data ?? resList)
        setParentOptions(Array.isArray(list) ? list.filter((c) => (c.id ?? c.category_id) !== id) : [])
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
    if (!formData.name?.trim()) err.name = t('common.required')
    setErrors(err)
    return Object.keys(err).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate() || submitting || !id) return
    setSubmitting(true)
    try {
      const payload = {
        name: formData.name?.trim() ? { en: formData.name.trim(), vn: formData.name.trim() } : undefined,
        description: formData.description?.trim() ? { en: formData.description.trim(), vn: formData.description.trim() } : undefined,
        code: formData.code?.trim() || undefined,
        ...(formData.parent_id ? { parent_id: Number(formData.parent_id) } : {}),
      }
      await categoryApi.updateCategory(id, payload)
      toast.success(t('common.success'))
      navigate('/admin/categories', { replace: true })
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
      await categoryApi.deleteCategory(id)
      toast.success(t('common.success'))
      navigate('/admin/categories', { replace: true })
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
          <Link to="/admin/categories" className="btn btn-primary">{t('common.back')}</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <nav className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 mb-6 flex-wrap">
        <Link to="/admin/dashboard" className="hover:text-primary-600">{t('admin.title')}</Link>
        <ChevronRight size={14} className="flex-shrink-0" />
        <Link to="/admin/categories" className="hover:text-primary-600">{t('admin.manageCategories')}</Link>
        <ChevronRight size={14} className="flex-shrink-0" />
        <span className="text-gray-700">{t('common.edit')}</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('common.edit')} {t('common.categories')}</h1>
      </div>

      <div className="card p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('food.category')} <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`input w-full ${errors.name ? 'border-red-500' : ''}`}
              placeholder={t('restaurantRegister.placeholderName')}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('restaurantRegister.descriptionLabel')}</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input w-full min-h-[80px]"
              placeholder={t('restaurantRegister.placeholderDescription')}
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('restaurantRegister.codeOptional')}</label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              className="input w-full"
              placeholder={t('restaurantRegister.placeholderCode')}
              maxLength={50}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parent {t('common.categories')}</label>
            <select name="parent_id" value={formData.parent_id} onChange={handleChange} className="input w-full">
              <option value="">— {t('common.all')} —</option>
              {parentOptions.map((c) => (
                <option key={c.id ?? c.category_id} value={c.id ?? c.category_id}>
                  {toDisplayText(c.name) || c.code || c.id}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? t('common.loading') + '...' : t('common.save')}
            </button>
            <Link to="/admin/categories" className="btn btn-outline">{t('common.cancel')}</Link>
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

export default CategoryEditPage
