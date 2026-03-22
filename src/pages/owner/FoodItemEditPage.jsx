import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useLanguage } from '@context/LanguageContext'
import { useAuth } from '@context/AuthContext'
import { restaurantApi } from '@services/api/restaurantApi'
import { foodApi } from '@services/api/foodApi'
import { categoryApi } from '@services/api/categoryApi'
import { formatPriceInput, parsePriceValue, getLocalizedText } from '@utils/helpers'
import { toast } from 'react-toastify'
import LoadingSpinner from '@components/common/LoadingSpinner'
import ConfirmModal from '@components/common/ConfirmModal'
import ImageUrlOrUpload from '@components/owner/ImageUrlOrUpload'
import RichTextEditor from '@components/common/RichTextEditor'

const getOwnerId = (user) => user?.id ?? user?.user_id ?? user?.owner_id
const getRestaurantId = (r) => r?.id ?? r?.restaurant_id

const ensureArray = (value) => {
  if (Array.isArray(value)) return value
  if (!value || typeof value !== 'object') return []
  const raw = value.data ?? value.items ?? value.restaurants ?? value.food_items ?? value.foodItems
  if (Array.isArray(raw)) return raw
  if (raw && typeof raw === 'object') {
    const nested = raw.data ?? raw.items ?? raw.restaurants ?? raw.food_items ?? raw.foodItems
    return Array.isArray(nested) ? nested : []
  }
  return []
}

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

const get = (obj, snakeKey) => {
  if (obj == null) return undefined
  const camelKey = snakeKey.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
  return obj[snakeKey] ?? obj[camelKey]
}

const fromItem = (item, key) => get(item, key) ?? get(item?.attributes, key)

const pickFirst = (val) => {
  if (val == null) return ''
  if (typeof val === 'string') return val
  if (typeof val === 'object') {
    const v = val.vn ?? val.vi ?? val.en ?? val.kr ?? val.ko
    if (typeof v === 'string') return v
    const first = Object.values(val).find((x) => typeof x === 'string')
    return first ?? ''
  }
  return String(val)
}

const parseJsonField = (v) => {
  if (v == null) return v
  if (typeof v === 'string') {
    const trimmed = v.trim()
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        return JSON.parse(v)
      } catch {
        return v
      }
    }
    return v
  }
  return v
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

const mapFoodToForm = (item) => {
  if (!item) return initialFormData
  const nameObj = parseJsonField(fromItem(item, 'name'))
  const descObj = parseJsonField(fromItem(item, 'description'))
  return {
    restaurant_id: String(fromItem(item, 'restaurant_id') ?? item.restaurant?.id ?? ''),
    food_category_id: String(fromItem(item, 'food_category_id') ?? item.food_category?.id ?? item.category?.id ?? ''),
    name: pickFirst(nameObj),
    description: pickFirst(descObj),
    main_image: fromItem(item, 'main_image') ?? item.image_url ?? '',
    price: fromItem(item, 'price') != null ? formatPriceInput(String(fromItem(item, 'price'))) : '',
    currency_code: fromItem(item, 'currency_code') ?? item.currency ?? 'VND',
    serving_size: fromItem(item, 'serving_size') != null ? String(fromItem(item, 'serving_size')) : '1',
    weight: fromItem(item, 'weight') != null ? String(fromItem(item, 'weight')) : '',
    is_vegetarian: !!fromItem(item, 'is_vegetarian'),
  }
}

const FoodItemEditPage = () => {
  const { id } = useParams()
  const { t, currentLanguage, getMultilingualContent } = useLanguage()
  const { user } = useAuth()
  const navigate = useNavigate()
  const ownerId = getOwnerId(user)
  const [formData, setFormData] = useState(initialFormData)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [restaurants, setRestaurants] = useState([])
  const [categories, setCategories] = useState([])
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    if (!ownerId) return
    Promise.all([
      restaurantApi.getRestaurants({ owner_id: ownerId }),
      categoryApi.getCategories(),
    ])
      .then(([restRes, catRes]) => {
        setRestaurants(ensureArray(restRes?.data))
        setCategories(ensureArray(catRes?.data))
      })
      .catch(() => {
        setRestaurants([])
        setCategories([])
      })
  }, [ownerId])

  useEffect(() => {
    if (!id) {
      setNotFound(true)
      setLoading(false)
      return
    }
    setLoading(true)
    setNotFound(false)
    foodApi
      .getFoodItemById(id)
      .then((res) => {
        const raw = res?.data ?? res
        let item = raw?.data ?? raw?.food_item ?? raw?.result ?? raw
        // API trả về data: { food_item, extra_images, related_products } → lấy food_item
        if (item && typeof item === 'object' && item.food_item != null) {
          item = item.food_item
        }
        if (item && typeof item === 'object') {
          setFormData(mapFoodToForm(item))
        } else {
          setNotFound(true)
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const finalValue = name === 'price' ? formatPriceInput(value) : (type === 'checkbox' ? checked : value)
    setFormData((prev) => ({ ...prev, [name]: finalValue }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const err = {}
    if (!formData.restaurant_id) err.restaurant_id = t('common.required')
    if (!formData.food_category_id) err.food_category_id = t('common.required')
    if (!formData.name?.trim()) err.name = t('common.required')
    if (!formData.price?.trim()) err.price = t('common.required')
    const priceNum = parsePriceValue(formData.price)
    if (formData.price?.trim() && (isNaN(priceNum) || priceNum < 0)) err.price = t('food.price') + ' invalid'
    setErrors(err)
    return Object.keys(err).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate() || submitting || !id) return
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
        price: parsePriceValue(formData.price) || 0,
        currency_code: formData.currency_code?.trim() || 'VND',
        serving_size: parseInt(formData.serving_size, 10) || 1,
        weight: formData.weight?.trim() ? parseInt(formData.weight, 10) : undefined,
        is_vegetarian: !!formData.is_vegetarian,
      }
      await foodApi.updateFoodItem(id, payload)
      toast.success(t('common.success'))
      navigate(formData.restaurant_id ? `/owner/restaurant/${formData.restaurant_id}` : '/owner/dashboard', { replace: true })
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setSubmitting(true)
    try {
      await foodApi.deleteFoodItem(id)
      toast.success(t('common.success'))
      navigate(formData.restaurant_id ? `/owner/restaurant/${formData.restaurant_id}` : '/owner/dashboard', { replace: true })
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto flex justify-center items-center min-h-[320px]">
        <LoadingSpinner />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <div className="card p-8 text-center">
          <p className="text-gray-600 mb-4">{t('common.noData')}</p>
          <Link to="/owner/dashboard" className="btn btn-primary">
            {t('common.back')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('owner.editFoodItem')}</h1>
        <nav className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 mt-1 flex-wrap">
          <Link to="/" className="hover:text-primary-600">{t('common.home')}</Link>
          <span>/</span>
          <Link to="/owner/dashboard" className="hover:text-primary-600">{t('owner.title')}</Link>
          <span>/</span>
          <span className="text-gray-700">{t('owner.editFoodItem')}</span>
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
                    {getLocalizedText(c.name, currentLanguage) || c.name_en || c.code || c.id}
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
            <RichTextEditor
              value={formData.description}
              onChange={(html) => setFormData((prev) => ({ ...prev, description: html ?? '' }))}
              placeholder={t('food.descriptionPlaceholder')}
              minHeight={180}
              uploadImageType="food"
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
              disabled={submitting}
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

          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? t('common.loading') : t('common.save')}
            </button>
            <button type="button" onClick={() => navigate(-1)} className="btn btn-outline">
              {t('common.cancel')}
            </button>
            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              disabled={submitting}
              className="btn bg-red-600 hover:bg-red-700 text-white ml-auto"
            >
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

export default FoodItemEditPage
