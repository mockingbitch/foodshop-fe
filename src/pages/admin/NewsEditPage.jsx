import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useLanguage } from '@context/LanguageContext'
import { newsApi } from '@services/api/newsApi'
import { uploadApi } from '@services/api/uploadApi'
import { getImageUrl, getImageUrlFromUploadResponse } from '@utils/helpers'
import { toast } from 'react-toastify'
import LoadingSpinner from '@components/common/LoadingSpinner'
import ConfirmModal from '@components/common/ConfirmModal'
import RichTextEditor from '@components/common/RichTextEditor'
import { ChevronRight, Trash2, ImagePlus } from 'lucide-react'

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

const NEWS_TYPES = [
  { value: 'news', labelKey: 'common.news' },
  { value: 'course', labelKey: 'common.courses' },
  { value: 'chef', labelKey: 'common.chefs' },
]

const normalizeRichTextForSave = (value) => {
  if (value == null) return ''
  const str = String(value)
  if (str.includes('<') && str.includes('>')) return str
  return str.replace(/\r?\n/g, '<br/>')
}

const NewsEditPage = () => {
  const { id } = useParams()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    type: 'news',
    title: '',
    content: '',
    image: '',
    status: 'draft',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const fileInputRef = useRef(null)

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
          title: toDisplayText(item.title) ?? '',
          content: toDisplayText(item.content) ?? '',
          image: typeof item.image === 'string' ? item.image : (item.featured_image ?? ''),
          status: (item.status === 'published' || item.status === 'draft') ? item.status : 'draft',
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

  const handleFeaturedImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) {
      toast.error(t('common.invalidFileType') || 'Chỉ chấp nhận file ảnh')
      e.target.value = ''
      return
    }
    setUploadingImage(true)
    try {
      const res = await uploadApi.uploadImages(file, 'news')
      const pathOrUrl = getImageUrlFromUploadResponse(res)
      if (pathOrUrl) {
        setFormData((prev) => ({ ...prev, image: pathOrUrl }))
        toast.success(t('common.success'))
      } else {
        toast.error('Không lấy được URL ảnh từ server')
      }
    } catch (err) {
      console.error(err)
      toast.error(t('common.error'))
    } finally {
      setUploadingImage(false)
      e.target.value = ''
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate() || submitting || !id) return
    setSubmitting(true)
    try {
      const payload = {
        type: formData.type,
        category_id: null,
        title: { en: formData.title?.trim() || '' },
        content: { en: normalizeRichTextForSave(formData.content) },
        excerpt: { en: '' },
        status: formData.status,
        published_at: new Date().toISOString(),
        featured_image: formData.image?.trim() || null,
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
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.type')} <span className="text-red-500">*</span></label>
            <select name="type" value={formData.type} onChange={handleChange} className="input w-full">
              {NEWS_TYPES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {t(opt.labelKey)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.titleLabel')} <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`input w-full ${errors.title ? 'border-red-500' : ''}`}
              placeholder={t('common.titleLabel')}
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <RichTextEditor
              value={formData.content}
              onChange={(html) => setFormData((prev) => ({ ...prev, content: html ?? '' }))}
              placeholder="Content..."
              minHeight={220}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Featured image</label>
            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFeaturedImageUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="btn btn-outline inline-flex items-center gap-2"
              >
                {uploadingImage ? (
                  <LoadingSpinner />
                ) : (
                  <ImagePlus size={18} />
                )}
                {uploadingImage ? t('common.loading') + '...' : (t('common.upload') || 'Tải ảnh lên')}
              </button>
              <span className="text-sm text-gray-500">{t('common.or') || 'hoặc'}</span>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className="input flex-1 min-w-[200px]"
                placeholder="https://... hoặc đường dẫn sau khi upload"
              />
            </div>
            {formData.image && (
              <div className="mt-2">
                <img
                  src={formData.image.startsWith('http') ? formData.image : getImageUrl(formData.image)}
                  alt="Preview"
                  className="h-24 w-auto max-w-full object-contain rounded-lg border border-gray-200"
                />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select name="status" value={formData.status} onChange={handleChange} className="input w-full">
              <option value="published">{t('news.published')}</option>
              <option value="draft">{t('news.draft')}</option>
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
