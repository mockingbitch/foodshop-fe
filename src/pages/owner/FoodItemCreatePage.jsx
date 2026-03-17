import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useLanguage } from '@context/LanguageContext'
import { useAuth } from '@context/AuthContext'
import { foodApi } from '@services/api/foodApi'
import { categoryApi } from '@services/api/categoryApi'
import { formatPriceInput, parsePriceValue } from '@utils/helpers'
import { toast } from 'react-toastify'
import ImageUrlOrUpload from '@components/owner/ImageUrlOrUpload'

const getOwnerId = (user) => user?.id ?? user?.user_id ?? user?.owner_id

/** Rút mảng từ response */
const ensureArray = (value) => {
  if (Array.isArray(value)) return value
  if (!value || typeof value !== 'object') return []
  const raw = value.data ?? value.items ?? value.results ?? value.list ?? value.food_items ?? value.foodItems
  if (Array.isArray(raw)) return raw
  if (raw && typeof raw === 'object') {
    const nested = raw.data ?? raw.items ?? raw.results ?? raw.list ?? raw.food_items ?? raw.foodItems
    return Array.isArray(nested) ? nested : []
  }
  return []
}

/** Chuỗi hiển thị từ name (string hoặc object { en, vn, kr }) */
const toDisplayName = (name, getMultilingualContent) => {
  if (name == null) return ''
  if (typeof name === 'string') return name
  if (typeof name === 'object') {
    const fromContext = getMultilingualContent?.(name)
    if (fromContext) return fromContext
    const v = name.vn ?? name.vi ?? name.kr ?? name.ko ?? name.en
    if (typeof v === 'string') return v
    const first = Object.values(name).find((x) => typeof x === 'string')
    return first ?? ''
  }
  return String(name)
}

const initialFormData = {
  food_category_id: '',
  name: '',
  description: '',
  main_image: '',
  price: '',
  currency_code: 'VND',
  serving_size: '1',
  weight: '',
  is_vegetarian: false,
}

const FoodItemCreatePage = () => {
  const { t, getMultilingualContent } = useLanguage()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { restaurantId: restaurantIdFromUrl } = useParams()
  const ownerId = getOwnerId(user)
  const [formData, setFormData] = useState(initialFormData)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [categories, setCategories] = useState([])

  useEffect(() => {
    if (!ownerId) return
    categoryApi.getCategories().then((catRes) => {
      const catRaw = catRes?.data
      setCategories(ensureArray(catRaw))
    }).catch(() => setCategories([]))
  }, [ownerId])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const finalValue = name === 'price' ? formatPriceInput(value) : (type === 'checkbox' ? checked : value)
    setFormData((prev) => ({ ...prev, [name]: finalValue }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const err = {}
    if (!(restaurantIdFromUrl?.trim())) err.restaurant_id = t('common.required')
    if (!formData.food_category_id) err.food_category_id = t('common.required')
    if (!formData.name?.trim()) err.name = t('common.required')
    if (!formData.price?.trim()) err.price = t('common.required')
    const priceNum = parsePriceValue(formData.price)
    if (formData.price?.trim() && (isNaN(priceNum) || priceNum < 0)) err.price = t('food.price') + ' ' + (t('food.priceInvalid') || 'invalid')
    setErrors(err)
    return Object.keys(err).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const restaurantId = restaurantIdFromUrl?.trim() || null
    if (!restaurantId) {
      toast.error(t('common.required') + ' (restaurant_id)')
      return
    }
    if (!validate() || submitting) return
    setSubmitting(true)
    try {
      const payload = {
        restaurant_id: Number(restaurantId),
        food_category_id: Number(formData.food_category_id),
        name: { en: formData.name?.trim() || '', vn: formData.name?.trim() || '' },
        description: formData.description?.trim()
          ? { en: formData.description.trim(), vn: formData.description.trim() }
          : undefined,
        main_image: formData.main_image?.trim() || undefined,
        extra_images: [],
        price: parsePriceValue(formData.price) || 0,
        currency_code: formData.currency_code?.trim() || 'VND',
        serving_size: parseInt(formData.serving_size, 10) || 1,
        weight: formData.weight?.trim() ? parseInt(formData.weight, 10) : undefined,
        is_vegetarian: !!formData.is_vegetarian,
      }
      await foodApi.createFoodItem(payload)
      toast.success(t('common.success'))
      navigate(restaurantIdFromUrl ? `/owner/restaurant/${restaurantIdFromUrl}` : '/owner/dashboard', { replace: true })
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('owner.addFoodItem')}</h1>
        <nav className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 mt-1 flex-wrap">
          <Link to="/" className="hover:text-primary-600">{t('common.home')}</Link>
          <span>/</span>
          <Link to="/owner/dashboard" className="hover:text-primary-600">{t('owner.title')}</Link>
          {restaurantIdFromUrl && (
            <>
              <span>/</span>
              <Link to={`/owner/restaurant/${restaurantIdFromUrl}`} className="hover:text-primary-600">{t('restaurant.detail')}</Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-700">{t('owner.addFoodItem')}</span>
        </nav>
      </div>

      <div className="card p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {!(restaurantIdFromUrl?.trim()) && (
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
              {t('common.required')}: restaurant ({t('food.restaurantRequiredHint')})
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('food.category')} *</label>
              <select
                name="food_category_id"
                value={formData.food_category_id}
                onChange={handleChange}
                className={`input w-full ${errors.food_category_id ? 'border-red-500' : ''}`}
              >
                <option value="">{t('common.filter')}...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {toDisplayName(c.name, getMultilingualContent) || c.name_en || c.code || c.id}
                  </option>
                ))}
              </select>
              {errors.food_category_id && <p className="mt-1 text-sm text-red-600">{errors.food_category_id}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('food.title')} (name) *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`input w-full ${errors.name ? 'border-red-500' : ''}`}
                placeholder={t('food.namePlaceholder')}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('food.price')} *</label>
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleChange}
                inputMode="numeric"
                className={`input w-full ${errors.price ? 'border-red-500' : ''}`}
                placeholder="50,000"
              />
              {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('food.detail')} (description)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="input w-full"
              placeholder={t('food.descriptionPlaceholder')}
            />
          </div>

          <div>
            <ImageUrlOrUpload
              name="main_image"
              value={formData.main_image}
              onChange={(url) => setFormData((prev) => ({ ...prev, main_image: url }))}
              label={t('food.mainImageUrl')}
              placeholder={t('food.mainImagePlaceholder')}
              uploadType="food"
              t={t}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('food.currency')}</label>
              <select name="currency_code" value={formData.currency_code} onChange={handleChange} className="input w-full">
                <option value="VND">VND</option>
                <option value="USD">USD</option>
                <option value="KRW">KRW</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('food.servingSize')}</label>
              <input
                type="number"
                name="serving_size"
                value={formData.serving_size}
                onChange={handleChange}
                min="1"
                className="input w-full"
                placeholder="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('food.weight')} (g)</label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                min="0"
                className="input w-full"
                placeholder="300"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_vegetarian"
              name="is_vegetarian"
              checked={formData.is_vegetarian}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-300 text-primary-600"
            />
            <label htmlFor="is_vegetarian" className="text-sm font-medium text-gray-700">
              {t('food.vegetarian')}
            </label>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={submitting || !(restaurantIdFromUrl?.trim())} className="btn btn-primary">
              {submitting ? t('common.loading') : t('common.save')}
            </button>
            <button type="button" onClick={() => navigate(-1)} className="btn btn-outline">
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default FoodItemCreatePage
