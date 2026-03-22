import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useLanguage } from '@context/LanguageContext'
import { categoryApi } from '@services/api/categoryApi'
import { getLocalizedText } from '@utils/helpers'
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

const LANGUAGES = [
  { code: 'EN', label: 'English' },
  { code: 'VN', label: 'Tiếng Việt' },
  { code: 'KR', label: '한국어' },
]

/** Map API response to form translations. Handles both translations[] and name/description objects. */
const mapToTranslations = (cat) => {
  const def = { EN: { name: '', description: '' }, VN: { name: '', description: '' }, KR: { name: '', description: '' } }
  const translations = Array.isArray(cat?.translations) ? cat.translations : []
  if (translations.length > 0) {
    translations.forEach((t) => {
      const code = String(t.language_code || t.languageCode || '').toUpperCase().trim().slice(0, 2)
      const normalized = code === 'VI' ? 'VN' : code === 'KO' ? 'KR' : code
      if (normalized && (def[normalized] || ['EN', 'VN', 'KR'].includes(normalized))) {
        if (!def[normalized]) def[normalized] = { name: '', description: '' }
        def[normalized].name = String(t.name ?? '')
        def[normalized].description = String(t.description ?? '')
      }
    })
  } else {
    const nameObj = cat?.name
    const descObj = cat?.description
    if (nameObj && typeof nameObj === 'object') {
      if (nameObj.en) def.EN.name = String(nameObj.en)
      if (nameObj.vn ?? nameObj.vi) def.VN.name = String(nameObj.vn ?? nameObj.vi)
    }
    if (descObj && typeof descObj === 'object') {
      if (descObj.en) def.EN.description = String(descObj.en)
      if (descObj.vn ?? descObj.vi) def.VN.description = String(descObj.vn ?? descObj.vi)
    }
  }
  return def
}

const CategoryEditPage = () => {
  const { id } = useParams()
  const { t, currentLanguage } = useLanguage()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    code: '',
    parent_id: '',
    sort_order: 0,
    translations: {
      EN: { name: '', description: '' },
      VN: { name: '', description: '' },
      KR: { name: '', description: '' },
    },
  })
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
        const inner = raw?.data ?? raw
        const cat = inner?.category ?? (inner?.id != null && inner?.code != null ? inner : null)
        if (!cat || typeof cat !== 'object' || Array.isArray(cat)) {
          setNotFound(true)
          setLoading(false)
          return
        }
        const translations = mapToTranslations(cat)
        setFormData({
          code: cat.code ?? '',
          parent_id: cat.parent_id != null ? String(cat.parent_id) : '',
          sort_order: cat.sort_order ?? 0,
          translations,
        })
        const list = ensureArray(resList?.data ?? resList)
        setParentOptions(Array.isArray(list) ? list.filter((c) => (c.id ?? c.category_id) !== id) : [])
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'sort_order') {
      setFormData((prev) => ({ ...prev, sort_order: Number(value) || 0 }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleTranslationChange = (langCode, field, value) => {
    setFormData((prev) => ({
      ...prev,
      translations: {
        ...prev.translations,
        [langCode]: { ...prev.translations[langCode], [field]: value },
      },
    }))
    if (errors[`translation_${langCode}_name`]) {
      setErrors((prev) => ({ ...prev, [`translation_${langCode}_name`]: '' }))
    }
  }

  const validate = () => {
    const err = {}
    if (!formData.code?.trim()) err.code = t('common.required')
    const hasName = LANGUAGES.some((l) => formData.translations[l.code]?.name?.trim())
    if (!hasName) {
      err.translation_name = t('common.required') + ' (' + t('food.category') + ')'
    }
    setErrors(err)
    return Object.keys(err).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate() || submitting || !id) return
    setSubmitting(true)
    try {
      const translations = LANGUAGES.filter((l) => {
        const tr = formData.translations[l.code]
        return tr?.name?.trim() || tr?.description?.trim()
      }).map((l) => {
        const tr = formData.translations[l.code] || {}
        const item = { language_code: l.code, name: tr.name?.trim() || '' }
        if (tr.description?.trim()) item.description = tr.description.trim()
        return item
      })
      const payload = {
        code: formData.code?.trim() || undefined,
        parent_id: formData.parent_id ? Number(formData.parent_id) : null,
        sort_order: Number(formData.sort_order) || 0,
        translations,
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
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('restaurantRegister.codeOptional')} <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              className={`input w-full ${errors.code ? 'border-red-500' : ''}`}
              placeholder={t('restaurantRegister.placeholderCode')}
              maxLength={50}
            />
            {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parent {t('common.categories')}</label>
            <select name="parent_id" value={formData.parent_id} onChange={handleChange} className="input w-full">
              <option value="">— {t('common.none')} —</option>
              {parentOptions.map((c) => (
                <option key={c.id ?? c.category_id} value={c.id ?? c.category_id}>
                  {getLocalizedText(c.name, currentLanguage) || c.code || c.id}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.sortOrder') || 'Thứ tự sắp xếp'}</label>
            <input
              type="number"
              name="sort_order"
              value={formData.sort_order}
              onChange={handleChange}
              className="input w-full max-w-[120px]"
              min={0}
            />
          </div>

          <div className="border-t border-gray-200 pt-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-4">{t('admin.translations') || 'Dịch'}</h2>
            {errors.translation_name && (
              <p className="text-sm text-red-600 mb-3">{errors.translation_name}</p>
            )}
            <div className="space-y-4">
              {LANGUAGES.map((lang) => (
                <div key={lang.code} className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-3">{lang.label} ({lang.code})</p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">{t('food.category')} {lang.code === 'EN' && <span className="text-red-500">*</span>}</label>
                      <input
                        type="text"
                        value={formData.translations[lang.code]?.name || ''}
                        onChange={(e) => handleTranslationChange(lang.code, 'name', e.target.value)}
                        className="input w-full"
                        placeholder={t('restaurantRegister.placeholderName')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">{t('restaurantRegister.descriptionLabel')}</label>
                      <textarea
                        value={formData.translations[lang.code]?.description || ''}
                        onChange={(e) => handleTranslationChange(lang.code, 'description', e.target.value)}
                        className="input w-full min-h-[60px]"
                        placeholder={t('restaurantRegister.placeholderDescription')}
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
