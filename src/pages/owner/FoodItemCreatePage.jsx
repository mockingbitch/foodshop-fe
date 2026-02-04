import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '@context/LanguageContext'
import { useAuth } from '@context/AuthContext'
import { restaurantApi } from '@services/api/restaurantApi'
import { foodApi } from '@services/api/foodApi'
import { categoryApi } from '@services/api/categoryApi'
import { toast } from 'react-toastify'

const getOwnerId = (user) => user?.id ?? user?.user_id ?? user?.owner_id
const getRestaurantId = (r) => r?.id ?? r?.restaurant_id

/** Rút mảng từ response */
const ensureArray = (value) => {
  if (Array.isArray(value)) return value
  if (!value || typeof value !== 'object') return []
  const raw = value.data ?? value.restaurants ?? value.items ?? value.results ?? value.list ?? value.food_items ?? value.foodItems
  if (Array.isArray(raw)) return raw
  if (raw && typeof raw === 'object') {
    const nested = raw.data ?? raw.restaurants ?? raw.items ?? raw.results ?? raw.list ?? raw.food_items ?? raw.foodItems
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
  restaurant_id: '',
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
  const ownerId = getOwnerId(user)
  const [formData, setFormData] = useState(initialFormData)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [restaurants, setRestaurants] = useState([])
  const [categories, setCategories] = useState([])

  useEffect(() => {
    if (!ownerId) return
    Promise.all([
      restaurantApi.getRestaurants({ owner_id: ownerId }),
      categoryApi.getCategories(),
    ])
      .then(([restRes, catRes]) => {
        setRestaurants(ensureArray(restRes?.data))
        const catRaw = catRes?.data
        setCategories(ensureArray(catRaw))
      })
      .catch(() => {
        setRestaurants([])
        setCategories([])
      })
  }, [ownerId])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const err = {}
    if (!formData.restaurant_id) err.restaurant_id = t('common.required')
    if (!formData.food_category_id) err.food_category_id = t('common.required')
    if (!formData.name?.trim()) err.name = t('common.required')
    if (!formData.price?.trim()) err.price = t('common.required')
    const priceNum = parseFloat(formData.price)
    if (formData.price?.trim() && (isNaN(priceNum) || priceNum < 0)) err.price = t('food.price') + ' invalid'
    setErrors(err)
    return Object.keys(err).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate() || submitting) return
    setSubmitting(true)
    try {
      const payload = {
        restaurant_id: Number(formData.restaurant_id),
        food_category_id: Number(formData.food_category_id),
        name: { en: formData.name?.trim() || '', vn: formData.name?.trim() || '' },
        description: formData.description?.trim()
          ? { en: formData.description.trim(), vn: formData.description.trim() }
          : undefined,
        main_image: formData.main_image?.trim() || undefined,
        extra_images: [],
        price: parseFloat(formData.price) || 0,
        currency_code: formData.currency_code?.trim() || 'VND',
        serving_size: parseInt(formData.serving_size, 10) || 1,
        weight: formData.weight?.trim() ? parseInt(formData.weight, 10) : undefined,
        is_vegetarian: !!formData.is_vegetarian,
      }
      await foodApi.createFoodItem(payload)
      toast.success(t('common.success'))
      navigate('/owner/dashboard', { replace: true })
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
          <span>/</span>
          <span className="text-gray-700">{t('owner.addFoodItem')}</span>
        </nav>
      </div>

      <div className="card p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('restaurant.title')} *</label>
              <select
                name="restaurant_id"
                value={formData.restaurant_id}
                onChange={handleChange}
                className={`input w-full ${errors.restaurant_id ? 'border-red-500' : ''}`}
              >
                <option value="">{t('common.filter')}...</option>
                {restaurants.map((r) => (
                  <option key={getRestaurantId(r)} value={getRestaurantId(r)}>
                    {toDisplayName(r.name, getMultilingualContent) || r.name_en || getRestaurantId(r)}
                  </option>
                ))}
              </select>
              {errors.restaurant_id && <p className="mt-1 text-sm text-red-600">{errors.restaurant_id}</p>}
            </div>
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
                placeholder="Food name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('food.price')} *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="1000"
                className={`input w-full ${errors.price ? 'border-red-500' : ''}`}
                placeholder="50000"
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
              placeholder="Short description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Main image URL</label>
            <input
              type="url"
              name="main_image"
              value={formData.main_image}
              onChange={handleChange}
              className="input w-full"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
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
              Vegetarian
            </label>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? t('common.loading') : t('common.save')}
            </button>
            <Link to="/owner/dashboard" className="btn btn-outline">
              {t('common.cancel')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default FoodItemCreatePage
