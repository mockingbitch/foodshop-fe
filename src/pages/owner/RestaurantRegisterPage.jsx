import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '@context/LanguageContext'
import { restaurantApi } from '@services/api/restaurantApi'
import { commonApi } from '@services/api/commonApi'
import { toast } from 'react-toastify'

const initialFormData = {
  code: '',
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
  outside_image_1: '',
  outside_image_2: '',
  inside_image_1: '',
  inside_image_2: '',
  inside_image_3: '',
  inside_image_4: '',
  inside_image_5: '',
  youtube_link: '',
  facebook_link: '',
  webpage_link: '',
  delivery_available: true,
  remark: '',
}

const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

const defaultDayHours = () => ({ open: true, start: '09:00', end: '21:00' })

const initialBusinessHours = Object.fromEntries(
  DAY_KEYS.map((key) => [key, defaultDayHours()])
)

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
  const [businessHours, setBusinessHours] = useState(initialBusinessHours)

  const dayLabelKey = (dayKey) => `restaurantRegister.days${dayKey.charAt(0).toUpperCase()}${dayKey.slice(1)}`

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

  const setBusinessHoursDay = (dayKey, field, value) => {
    setBusinessHours((prev) => ({
      ...prev,
      [dayKey]: { ...prev[dayKey], [field]: value },
    }))
  }

  const applyBusinessHoursToAll = () => {
    const first = businessHours[DAY_KEYS[0]]
    setBusinessHours(
      Object.fromEntries(DAY_KEYS.map((key) => [key, { ...first }]))
    )
  }

  const validate = () => {
    const err = {}
    if (!formData.name?.trim()) err.name = t('common.required')
    if (!formData.country_id) err.country_id = t('common.required')
    if (!formData.restaurant_type_id) err.restaurant_type_id = t('common.required')
    if (!formData.address?.trim()) err.address = t('common.required')
    if (!formData.phone?.trim()) err.phone = t('common.required')
    if (!formData.city?.trim()) err.city = t('common.required')
    setErrors(err)
    return Object.keys(err).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate() || submitting) return
    setSubmitting(true)
    try {
      const businessHoursPayload = Object.fromEntries(
        Object.entries(businessHours)
          .filter(([, v]) => v.open && v.start && v.end)
          .map(([k, v]) => [k, [v.start, v.end]])
      )
      const hasHours = Object.keys(businessHoursPayload).length > 0
      const payload = {
        ...(formData.code?.trim() && { code: formData.code.trim() }),
        country_id: Number(formData.country_id),
        restaurant_type_id: Number(formData.restaurant_type_id),
        name: { en: formData.name?.trim() || '', vn: formData.name?.trim() || '' },
        description: formData.description?.trim()
          ? { en: formData.description.trim(), vn: formData.description.trim() }
          : undefined,
        city: formData.city?.trim() || '',
        address: formData.address?.trim() || '',
        phone: formData.phone?.trim() || '',
        zalo: formData.zalo?.trim() || undefined,
        email: formData.email?.trim() || undefined,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        ...(formData.outside_image_1?.trim() && { outside_image_1: formData.outside_image_1.trim() }),
        ...(formData.outside_image_2?.trim() && { outside_image_2: formData.outside_image_2.trim() }),
        ...(formData.inside_image_1?.trim() && { inside_image_1: formData.inside_image_1.trim() }),
        ...(formData.inside_image_2?.trim() && { inside_image_2: formData.inside_image_2.trim() }),
        ...(formData.inside_image_3?.trim() && { inside_image_3: formData.inside_image_3.trim() }),
        ...(formData.inside_image_4?.trim() && { inside_image_4: formData.inside_image_4.trim() }),
        ...(formData.inside_image_5?.trim() && { inside_image_5: formData.inside_image_5.trim() }),
        ...(formData.youtube_link?.trim() && { youtube_link: formData.youtube_link.trim() }),
        ...(formData.facebook_link?.trim() && { facebook_link: formData.facebook_link.trim() }),
        ...(formData.webpage_link?.trim() && { webpage_link: formData.webpage_link.trim() }),
        delivery_available: !!formData.delivery_available,
        ...(formData.remark?.trim() && {
          remark: { en: formData.remark.trim(), vn: formData.remark.trim() },
        }),
        ...(hasHours && { business_hours: businessHoursPayload }),
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
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('restaurantRegister.nameRequired')} <span className="text-red-500">*</span></label>
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
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input w-full"
                placeholder={t('restaurantRegister.placeholderDescription')}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('restaurantRegister.countryRequired')} <span className="text-red-500">*</span></label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('restaurantRegister.typeRequired')} <span className="text-red-500">*</span></label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('restaurantRegister.addressRequired')} <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={`input w-full ${errors.address ? 'border-red-500' : ''}`}
              placeholder={t('restaurantRegister.placeholderAddress')}
            />
            {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('restaurantRegister.cityRequired')} <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="input w-full"
                placeholder={t('restaurantRegister.placeholderCity')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('restaurantRegister.phoneRequired')} <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`input w-full ${errors.phone ? 'border-red-500' : ''}`}
                placeholder={t('restaurantRegister.placeholderPhone')}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('restaurantRegister.email')}</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input w-full"
                placeholder={t('restaurantRegister.placeholderEmail')}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('restaurantRegister.latitude')}</label>
              <input
                type="text"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                className="input w-full"
                placeholder={t('restaurantRegister.placeholderLatitude')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('restaurantRegister.longitude')}</label>
              <input
                type="text"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                className="input w-full"
                placeholder={t('restaurantRegister.placeholderLongitude')}
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">{t('restaurantRegister.imagesSection')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-0.5">{t('restaurantRegister.outsideImage', { n: 1 })}</label>
                <input type="url" name="outside_image_1" value={formData.outside_image_1} onChange={handleChange} className="input w-full text-sm" placeholder={t('restaurantRegister.placeholderUrl')} />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-0.5">{t('restaurantRegister.outsideImage', { n: 2 })}</label>
                <input type="url" name="outside_image_2" value={formData.outside_image_2} onChange={handleChange} className="input w-full text-sm" placeholder={t('restaurantRegister.placeholderUrl')} />
              </div>
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n}>
                  <label className="block text-xs text-gray-600 mb-0.5">{t('restaurantRegister.insideImage', { n })}</label>
                  <input type="url" name={`inside_image_${n}`} value={formData[`inside_image_${n}`]} onChange={handleChange} className="input w-full text-sm" placeholder={t('restaurantRegister.placeholderUrl')} />
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">{t('restaurantRegister.socialSection')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-0.5">{t('restaurantRegister.youtube')}</label>
                <input type="url" name="youtube_link" value={formData.youtube_link} onChange={handleChange} className="input w-full text-sm" placeholder={t('restaurantRegister.placeholderYoutube')} />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-0.5">{t('restaurantRegister.facebook')}</label>
                <input type="url" name="facebook_link" value={formData.facebook_link} onChange={handleChange} className="input w-full text-sm" placeholder={t('restaurantRegister.placeholderFacebook')} />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-0.5">{t('restaurantRegister.webpage')}</label>
                <input type="url" name="webpage_link" value={formData.webpage_link} onChange={handleChange} className="input w-full text-sm" placeholder={t('restaurantRegister.placeholderWebpage')} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('restaurantRegister.remarkLabel')}</label>
            <textarea
              name="remark"
              value={formData.remark}
              onChange={handleChange}
              className="input w-full min-h-[80px]"
              placeholder={t('restaurantRegister.remarkPlaceholder')}
              rows={3}
            />
          </div>
          <div className="border-t pt-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-800">{t('restaurantRegister.businessHoursLabel')}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{t('restaurantRegister.businessHoursHint')}</p>
              </div>
              <button
                type="button"
                onClick={applyBusinessHoursToAll}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                {t('restaurantRegister.applyToAll')}
              </button>
            </div>
            <div className="rounded-lg border border-gray-200 overflow-hidden bg-gray-50/50">
              <div className="grid grid-cols-1 sm:grid-cols-7 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
                {DAY_KEYS.map((dayKey) => {
                  const day = businessHours[dayKey]
                  const isOpen = !!day?.open
                  return (
                    <div key={dayKey} className="p-3 flex flex-col gap-2 min-w-0">
                      <div className="font-medium text-gray-700 text-sm">
                        {t(dayLabelKey(dayKey))}
                      </div>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isOpen}
                          onChange={(e) => setBusinessHoursDay(dayKey, 'open', e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-primary-600"
                        />
                        <span className="text-xs text-gray-600">{t('restaurantRegister.open')}</span>
                      </label>
                      {isOpen ? (
                        <>
                          <input
                            type="time"
                            value={day?.start || '09:00'}
                            onChange={(e) => setBusinessHoursDay(dayKey, 'start', e.target.value)}
                            className="input w-full text-sm py-1.5"
                          />
                          <input
                            type="time"
                            value={day?.end || '21:00'}
                            onChange={(e) => setBusinessHoursDay(dayKey, 'end', e.target.value)}
                            className="input w-full text-sm py-1.5"
                          />
                        </>
                      ) : (
                        <span className="text-xs text-gray-400 italic">{t('restaurantRegister.closed')}</span>
                      )}
                    </div>
                  )
                })}
              </div>
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
            <button type="button" onClick={() => navigate(-1)} className="btn btn-outline">
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RestaurantRegisterPage
