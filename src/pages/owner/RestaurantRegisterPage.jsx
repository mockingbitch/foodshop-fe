import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '@context/LanguageContext'
import { restaurantApi } from '@services/api/restaurantApi'
import { commonApi } from '@services/api/commonApi'
import { toast } from 'react-toastify'

const initialFormData = {
  country_id: '',
  restaurant_type_id: '',
  name: '',
  description: '',
  city: '',
  address: '',
  phone: '',
  zalo: '',
  email: '',
  latitude: '',
  longitude: '',
  delivery_available: true,
}

/** Chuỗi hiển thị từ name (string hoặc object đa ngôn ngữ { en, vn, kr }) */
const toDisplayName = (name, getMultilingualContent) => {
  if (name == null) return ''
  if (typeof name === 'string') return name
  if (typeof name === 'object') {
    const fromContext = getMultilingualContent(name)
    if (fromContext) return fromContext
    const v = name.vn ?? name.vi ?? name.kr ?? name.ko ?? name.en
    if (typeof v === 'string') return v
    const first = Object.values(name).find((x) => typeof x === 'string')
    return first ?? ''
  }
  return String(name)
}

const RestaurantRegisterPage = () => {
  const { t, getMultilingualContent } = useLanguage()
  const navigate = useNavigate()
  const [formData, setFormData] = useState(initialFormData)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [countries, setCountries] = useState([])
  const [restaurantTypes, setRestaurantTypes] = useState([])

  useEffect(() => {
    Promise.all([commonApi.getCountries(), commonApi.getRestaurantTypes()])
      .then(([countriesRes, typesRes]) => {
        const countryList = Array.isArray(countriesRes?.data) ? countriesRes.data : (countriesRes?.data?.data ?? countriesRes?.data?.countries ?? [])
        const typeList = Array.isArray(typesRes?.data) ? typesRes.data : (typesRes?.data?.data ?? typesRes?.data ?? [])
        setCountries(Array.isArray(countryList) ? countryList : [])
        setRestaurantTypes(Array.isArray(typeList) ? typeList : [])
      })
      .catch(() => {
        setCountries([])
        setRestaurantTypes([])
      })
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const err = {}
    if (!formData.name?.trim()) err.name = t('common.required')
    if (!formData.country_id) err.country_id = t('common.required')
    if (!formData.restaurant_type_id) err.restaurant_type_id = t('common.required')
    if (!formData.address?.trim()) err.address = t('common.required')
    if (!formData.phone?.trim()) err.phone = t('common.required')
    setErrors(err)
    return Object.keys(err).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate() || submitting) return
    setSubmitting(true)
    try {
      const payload = {
        country_id: Number(formData.country_id),
        restaurant_type_id: Number(formData.restaurant_type_id),
        name: { en: formData.name?.trim() || '', vn: formData.name?.trim() || '' },
        description: { en: formData.description?.trim() || '' },
        city: formData.city?.trim() || '',
        address: formData.address?.trim() || '',
        phone: formData.phone?.trim() || '',
        zalo: formData.zalo?.trim() || '',
        email: formData.email?.trim() || '',
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        delivery_available: !!formData.delivery_available,
      }
      await restaurantApi.createRestaurant(payload)
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
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('owner.addRestaurant')}</h1>
        <nav className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 mt-1 flex-wrap">
          <Link to="/" className="hover:text-primary-600">{t('common.home')}</Link>
          <span>/</span>
          <Link to="/owner/dashboard" className="hover:text-primary-600">{t('owner.title')}</Link>
          <span>/</span>
          <span className="text-gray-700">{t('owner.addRestaurant')}</span>
        </nav>
      </div>

      <div className="card p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('restaurant.title')} (name) *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`input w-full ${errors.name ? 'border-red-500' : ''}`}
                placeholder="Restaurant name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('restaurant.detail')} (description)</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input w-full"
                placeholder="Short description"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
              <select
                name="country_id"
                value={formData.country_id}
                onChange={handleChange}
                className={`input w-full ${errors.country_id ? 'border-red-500' : ''}`}
              >
                <option value="">{t('common.filter')}...</option>
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>{toDisplayName(c.name, getMultilingualContent) || c.name_en || c.code || c.id}</option>
                ))}
              </select>
              {errors.country_id && <p className="mt-1 text-sm text-red-600">{errors.country_id}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant type *</label>
              <select
                name="restaurant_type_id"
                value={formData.restaurant_type_id}
                onChange={handleChange}
                className={`input w-full ${errors.restaurant_type_id ? 'border-red-500' : ''}`}
              >
                <option value="">{t('common.filter')}...</option>
                {restaurantTypes.map((rt) => (
                  <option key={rt.id} value={rt.id}>{toDisplayName(rt.name, getMultilingualContent) || rt.name_en || rt.type || rt.id}</option>
                ))}
              </select>
              {errors.restaurant_type_id && <p className="mt-1 text-sm text-red-600">{errors.restaurant_type_id}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('restaurant.address')} *</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={`input w-full ${errors.address ? 'border-red-500' : ''}`}
              placeholder="Street address"
            />
            {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="input w-full"
                placeholder="City"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('restaurant.phone')} *</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`input w-full ${errors.phone ? 'border-red-500' : ''}`}
                placeholder="Phone"
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('restaurant.zalo')}</label>
              <input
                type="text"
                name="zalo"
                value={formData.zalo}
                onChange={handleChange}
                className="input w-full"
                placeholder="Zalo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input w-full"
                placeholder="restaurant@example.com"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
              <input
                type="text"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                className="input w-full"
                placeholder="10.7769"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
              <input
                type="text"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                className="input w-full"
                placeholder="106.7009"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="delivery_available"
              name="delivery_available"
              checked={formData.delivery_available}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-300 text-primary-600"
            />
            <label htmlFor="delivery_available" className="text-sm font-medium text-gray-700">{t('restaurant.delivery')}</label>
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

export default RestaurantRegisterPage
