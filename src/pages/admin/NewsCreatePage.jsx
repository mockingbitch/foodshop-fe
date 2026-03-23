import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '@context/LanguageContext'
import { newsApi } from '@services/api/newsApi'
import { uploadApi } from '@services/api/uploadApi'
import { getImageUrl, getImageUrlFromUploadResponse } from '@utils/helpers'
import { toast } from 'react-toastify'
import LoadingSpinner from '@components/common/LoadingSpinner'
import RichTextEditor from '@components/common/RichTextEditor'
import { ChevronRight, ImagePlus } from 'lucide-react'

const NEWS_TYPES = [
  { value: 'news', labelKey: 'common.news' },
  { value: 'course', labelKey: 'common.courses' },
  { value: 'chef', labelKey: 'common.chefs' },
]

const normalizeRichTextForSave = (value) => {
  if (value == null) return ''
  const str = String(value)
  // Quill usually outputs HTML. Keep it untouched to preserve <br/> and other tags.
  if (str.includes('<') && str.includes('>')) return str
  // If it's plain text, convert newlines to <br/> so backend stores the line breaks.
  return str.replace(/\r?\n/g, '<br/>')
}

const NewsCreatePage = () => {
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
  const fileInputRef = useRef(null)

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
    if (!validate() || submitting) return
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
      await newsApi.createNews(payload)
      toast.success(t('common.success'))
      navigate('/admin/news', { replace: true })
    } catch (error) {
      console.error(error)
      toast.error(t('common.error'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <nav className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 mb-6 flex-wrap">
        <Link to="/admin/dashboard" className="hover:text-primary-600">{t('admin.title')}</Link>
        <ChevronRight size={14} className="flex-shrink-0" />
        <span className="text-gray-700">{t('admin.manageNews')}</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('admin.manageNews')}</h1>
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
              onChange={(html) => {
                setFormData((prev) => ({ ...prev, content: html ?? '' }))
                if (errors.content) setErrors((prev) => ({ ...prev, content: '' }))
              }}
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
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <LoadingSpinner />
                  {t('common.loading')}...
                </span>
              ) : (
                t('common.save')
              )}
            </button>
            <Link to="/admin/dashboard" className="btn btn-outline">{t('common.cancel')}</Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NewsCreatePage
