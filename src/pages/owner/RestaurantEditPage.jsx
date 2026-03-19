import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useLanguage } from '@context/LanguageContext'
import { restaurantApi } from '@services/api/restaurantApi'
import { commonApi } from '@services/api/commonApi'
import { geocodeAddress } from '@services/api/geocodeApi'
import { DEFAULT_LAT, DEFAULT_LNG } from '@constants'
import ImageUrlOrUpload from '@components/owner/ImageUrlOrUpload'
import { toast } from 'react-toastify'
import LoadingSpinner from '@components/common/LoadingSpinner'
import RichTextEditor from '@components/common/RichTextEditor'

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
  main_image: '',
  main_image_type: 'url',
  outside_image_1: '',
  outside_image_2: '',
  inside_image_1: '',
  inside_image_2: '',
  inside_image_3: '',
  inside_image_4: '',
  inside_image_5: '',
  outside_image_1_type: 'url',
  outside_image_2_type: 'url',
  inside_image_1_type: 'url',
  inside_image_2_type: 'url',
  inside_image_3_type: 'url',
  inside_image_4_type: 'url',
  inside_image_5_type: 'url',
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

/** Parse JSON nếu backend trả string (Laravel json column). */
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

const getImageUrl = (val) => (typeof val === 'string' ? val : val?.url ?? val?.image_url ?? '')

/** Lấy giá trị từ object, hỗ trợ cả snake_case và camelCase. */
const get = (obj, snakeKey) => {
  if (obj == null) return undefined
  const camelKey = snakeKey.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
  return obj[snakeKey] ?? obj[camelKey]
}

/** Lấy từ restaurant hoặc từ attributes (JSON:API style). */
const fromRestaurant = (r, key) => get(r, key) ?? get(r?.attributes, key)

const mapRestaurantToForm = (r) => {
  if (!r) return { formData: initialFormData, businessHours: initialBusinessHours }
  const outImgsRaw = fromRestaurant(r, 'outside_images') ?? r.images ?? r.outside_images ?? []
  const outImgs = Array.isArray(outImgsRaw) ? outImgsRaw : (outImgsRaw && typeof outImgsRaw === 'object' ? [outImgsRaw] : [])
  const inImgsRaw = fromRestaurant(r, 'inside_images') ?? r.inside_images ?? []
  const inImgs = Array.isArray(inImgsRaw) ? inImgsRaw : (inImgsRaw && typeof inImgsRaw === 'object' ? [inImgsRaw] : [])
  const nameObj = parseJsonField(fromRestaurant(r, 'name'))
  const descObj = parseJsonField(fromRestaurant(r, 'description'))
  const remarkObj = parseJsonField(fromRestaurant(r, 'remark'))
  const formData = {
    code: fromRestaurant(r, 'code') ?? '',
    country_id: String(fromRestaurant(r, 'country_id') ?? r.country?.id ?? ''),
    restaurant_type_id: String(fromRestaurant(r, 'restaurant_type_id') ?? r.restaurant_type?.id ?? ''),
    name: pickFirst(nameObj),
    description: pickFirst(descObj),
    city: fromRestaurant(r, 'city') ?? '',
    address: fromRestaurant(r, 'address') ?? '',
    phone: fromRestaurant(r, 'phone') ?? '',
    zalo: fromRestaurant(r, 'zalo') ?? '',
    email: fromRestaurant(r, 'email') ?? '',
    latitude: fromRestaurant(r, 'latitude') != null ? String(fromRestaurant(r, 'latitude')) : '',
    longitude: fromRestaurant(r, 'longitude') != null ? String(fromRestaurant(r, 'longitude')) : '',
    main_image: fromRestaurant(r, 'main_image') ?? fromRestaurant(r, 'image_url') ?? getImageUrl(outImgs[0]) ?? '',
    main_image_type: fromRestaurant(r, 'main_image_type') ?? 'url',
    outside_image_1: fromRestaurant(r, 'outside_image_1') ?? getImageUrl(outImgs[0]) ?? '',
    outside_image_2: fromRestaurant(r, 'outside_image_2') ?? getImageUrl(outImgs[1]) ?? '',
    inside_image_1: fromRestaurant(r, 'inside_image_1') ?? getImageUrl(inImgs[0]) ?? '',
    inside_image_2: fromRestaurant(r, 'inside_image_2') ?? getImageUrl(inImgs[1]) ?? '',
    inside_image_3: fromRestaurant(r, 'inside_image_3') ?? getImageUrl(inImgs[2]) ?? '',
    inside_image_4: fromRestaurant(r, 'inside_image_4') ?? getImageUrl(inImgs[3]) ?? '',
    inside_image_5: fromRestaurant(r, 'inside_image_5') ?? getImageUrl(inImgs[4]) ?? '',
    outside_image_1_type: fromRestaurant(r, 'outside_image_1_type') ?? 'url',
    outside_image_2_type: fromRestaurant(r, 'outside_image_2_type') ?? 'url',
    inside_image_1_type: fromRestaurant(r, 'inside_image_1_type') ?? 'url',
    inside_image_2_type: fromRestaurant(r, 'inside_image_2_type') ?? 'url',
    inside_image_3_type: fromRestaurant(r, 'inside_image_3_type') ?? 'url',
    inside_image_4_type: fromRestaurant(r, 'inside_image_4_type') ?? 'url',
    inside_image_5_type: fromRestaurant(r, 'inside_image_5_type') ?? 'url',
    youtube_link: fromRestaurant(r, 'youtube_link') ?? '',
    facebook_link: fromRestaurant(r, 'facebook_link') ?? '',
    webpage_link: fromRestaurant(r, 'webpage_link') ?? '',
    delivery_available: !!fromRestaurant(r, 'delivery_available'),
    remark: pickFirst(remarkObj),
  }
  let bh = fromRestaurant(r, 'business_hours') ?? r.businessHours
  if (typeof bh === 'string') {
    try {
      bh = JSON.parse(bh)
    } catch {
      bh = null
    }
  }
  const businessHours = { ...initialBusinessHours }
  if (bh && typeof bh === 'object' && !Array.isArray(bh)) {
    DAY_KEYS.forEach((key) => {
      const arr = bh[key]
      if (Array.isArray(arr) && arr.length >= 2) {
        businessHours[key] = { open: true, start: String(arr[0]), end: String(arr[1]) }
      }
    })
  }
  return { formData, businessHours }
}

const RestaurantEditPage = () => {
  const { id } = useParams()
  const { t, getMultilingualContent } = useLanguage()
  const navigate = useNavigate()
  const [formData, setFormData] = useState(initialFormData)
  const [businessHours, setBusinessHours] = useState(initialBusinessHours)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
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

  useEffect(() => {
    if (!id) {
      setNotFound(true)
      setLoading(false)
      return
    }
    setLoading(true)
    setNotFound(false)
    restaurantApi
      .getRestaurantById(id)
      .then((res) => {
        const raw = res?.data ?? res
        const inner = raw?.data ?? raw
        let restaurant = inner?.restaurant ?? inner?.data ?? inner ?? raw?.restaurant ?? raw?.result ?? raw
        if (Array.isArray(restaurant) && restaurant.length > 0) restaurant = restaurant[0]
        if (!restaurant || typeof restaurant !== 'object') {
          setNotFound(true)
          setLoading(false)
          return
        }
        const { formData: fd, businessHours: bh } = mapRestaurantToForm(restaurant)
        setFormData({ ...initialFormData, ...fd })
        setBusinessHours({ ...initialBusinessHours, ...bh })
        setLoading(false)
      })
      .catch(() => {
        setNotFound(true)
        setLoading(false)
      })
  }, [id])

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
    setBusinessHours(Object.fromEntries(DAY_KEYS.map((key) => [key, { ...first }])))
  }

  const resolveCoordinates = async () => {
    const lat = parseFloat(formData.latitude)
    const lng = parseFloat(formData.longitude)
    const q = [formData.address, formData.city].filter(Boolean).join(', ')
    // Ưu tiên geocode theo địa chỉ khi update để luôn cập nhật tọa độ theo address/city.
    if (q) {
      try {
        const result = await geocodeAddress(q)
        if (result) return { lat: result.lat, lng: result.lng }
      } catch {
        // ignore: fallback phía dưới
      }
    }
    // Nếu geocode fail thì fallback theo input hoặc default.
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) return { lat, lng }
    return { lat: DEFAULT_LAT, lng: DEFAULT_LNG }
  }

  const dayLabelKey = (dayKey) => `restaurantRegister.days${dayKey.charAt(0).toUpperCase()}${dayKey.slice(1)}`

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
    if (!validate() || submitting || !id) return
    setSubmitting(true)
    try {
      const { lat, lng } = await resolveCoordinates()
      // Đồng bộ lại state để lần sau/hiển thị khác dùng đúng tọa độ mới.
      setFormData((prev) => ({ ...prev, latitude: String(lat), longitude: String(lng) }))
      const outOutside = [formData.outside_image_1, formData.outside_image_2].filter((v) => v?.trim()).map((v) => v.trim())
      const outInside = [formData.inside_image_1, formData.inside_image_2, formData.inside_image_3, formData.inside_image_4, formData.inside_image_5].filter((v) => v?.trim()).map((v) => v.trim())
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
        latitude: lat,
        longitude: lng,
        main_image: formData.main_image?.trim() || null,
        outside_image_1: formData.outside_image_1?.trim() || null,
        outside_image_2: formData.outside_image_2?.trim() || null,
        inside_image_1: formData.inside_image_1?.trim() || null,
        inside_image_2: formData.inside_image_2?.trim() || null,
        inside_image_3: formData.inside_image_3?.trim() || null,
        inside_image_4: formData.inside_image_4?.trim() || null,
        inside_image_5: formData.inside_image_5?.trim() || null,
        ...(outOutside.length > 0 && { outside_images: outOutside }),
        ...(outInside.length > 0 && { inside_images: outInside }),
        ...(formData.youtube_link?.trim() && { youtube_link: formData.youtube_link.trim() }),
        ...(formData.facebook_link?.trim() && { facebook_link: formData.facebook_link.trim() }),
        ...(formData.webpage_link?.trim() && { webpage_link: formData.webpage_link.trim() }),
        delivery_available: !!formData.delivery_available,
        ...(formData.remark?.trim() && {
          remark: { en: formData.remark.trim(), vn: formData.remark.trim() },
        }),
        ...(hasHours && { business_hours: businessHoursPayload }),
      }
      await restaurantApi.updateRestaurant(id, payload)
      toast.success(t('common.success'))
      navigate(`/owner/restaurant/${id}`, { replace: true })
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
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('owner.editRestaurant')}</h1>
        <nav className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 mt-1 flex-wrap">
          <Link to="/" className="hover:text-primary-600">{t('common.home')}</Link>
          <span>/</span>
          <Link to="/owner/dashboard" className="hover:text-primary-600">{t('owner.title')}</Link>
          <span>/</span>
          <span className="text-gray-700">{t('owner.editRestaurant')}</span>
        </nav>
      </div>

      <div className="card p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('restaurantRegister.codeOptional')}</label>
              <input type="text" name="code" value={formData.code} onChange={handleChange} className="input w-full" placeholder={t('restaurantRegister.placeholderCode')} maxLength={20} />
            </div>
                <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('restaurantRegister.nameRequired')} <span className="text-red-500">*</span></label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className={`input w-full ${errors.name ? 'border-red-500' : ''}`} placeholder={t('restaurantRegister.placeholderName')} />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('restaurantRegister.descriptionLabel')}</label>
            <RichTextEditor
              value={formData.description}
              onChange={(html) => setFormData((prev) => ({ ...prev, description: html ?? '' }))}
              placeholder={t('restaurantRegister.placeholderDescription')}
              minHeight={180}
              uploadImageType="restaurant"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('restaurantRegister.countryRequired')} <span className="text-red-500">*</span></label>
              <select name="country_id" value={formData.country_id} onChange={handleChange} className={`input w-full ${errors.country_id ? 'border-red-500' : ''}`}>
                <option value="">{t('common.filter')}...</option>
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>{toDisplayName(c.name, getMultilingualContent) || c.name_en || c.code || c.id}</option>
                ))}
              </select>
              {errors.country_id && <p className="mt-1 text-sm text-red-600">{errors.country_id}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('restaurantRegister.typeRequired')} <span className="text-red-500">*</span></label>
              <select name="restaurant_type_id" value={formData.restaurant_type_id} onChange={handleChange} className={`input w-full ${errors.restaurant_type_id ? 'border-red-500' : ''}`}>
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
            <input type="text" name="address" value={formData.address} onChange={handleChange} className={`input w-full ${errors.address ? 'border-red-500' : ''}`} placeholder={t('restaurantRegister.placeholderAddress')} />
            {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('restaurantRegister.cityRequired')} <span className="text-red-500">*</span></label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} className="input w-full" placeholder={t('restaurantRegister.placeholderCity')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('restaurantRegister.phoneRequired')} <span className="text-red-500">*</span></label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} className={`input w-full ${errors.phone ? 'border-red-500' : ''}`} placeholder={t('restaurantRegister.placeholderPhone')} />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('restaurant.zalo')}</label>
              <input type="text" name="zalo" value={formData.zalo} onChange={handleChange} className="input w-full" placeholder="Zalo" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('restaurantRegister.email')}</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="input w-full" placeholder={t('restaurantRegister.placeholderEmail')} />
            </div>
          </div>
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">{t('restaurantRegister.imagesSection')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <ImageUrlOrUpload
                  name="main_image"
                  value={formData.main_image}
                  onChange={(v) => setFormData((p) => ({ ...p, main_image: v }))}
                  onTypeChange={(v) => setFormData((p) => ({ ...p, main_image_type: v }))}
                  label={t('restaurantRegister.mainImage')}
                  placeholder={t('restaurantRegister.placeholderUrl')}
                  uploadType="restaurant"
                  t={t}
                />
              </div>
              <div>
                <ImageUrlOrUpload
                  name="outside_image_1"
                  value={formData.outside_image_1}
                  onChange={(v) => setFormData((p) => ({ ...p, outside_image_1: v }))}
                  onTypeChange={(v) => setFormData((p) => ({ ...p, outside_image_1_type: v }))}
                  label={t('restaurantRegister.outsideImage', { n: 1 })}
                  placeholder={t('restaurantRegister.placeholderUrl')}
                  uploadType="restaurant"
                  t={t}
                />
              </div>
              <div>
                <ImageUrlOrUpload
                  name="outside_image_2"
                  value={formData.outside_image_2}
                  onChange={(v) => setFormData((p) => ({ ...p, outside_image_2: v }))}
                  onTypeChange={(v) => setFormData((p) => ({ ...p, outside_image_2_type: v }))}
                  label={t('restaurantRegister.outsideImage', { n: 2 })}
                  placeholder={t('restaurantRegister.placeholderUrl')}
                  uploadType="restaurant"
                  t={t}
                />
              </div>
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n}>
                  <ImageUrlOrUpload
                    name={`inside_image_${n}`}
                    value={formData[`inside_image_${n}`]}
                    onChange={(v) => setFormData((p) => ({ ...p, [`inside_image_${n}`]: v }))}
                    onTypeChange={(v) => setFormData((p) => ({ ...p, [`inside_image_${n}_type`]: v }))}
                    label={t('restaurantRegister.insideImage', { n })}
                    placeholder={t('restaurantRegister.placeholderUrl')}
                    uploadType="restaurant"
                    t={t}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">{t('restaurantRegister.socialSection')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
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
            <textarea name="remark" value={formData.remark} onChange={handleChange} className="input w-full min-h-[80px]" placeholder={t('restaurantRegister.remarkPlaceholder')} rows={3} />
          </div>

          <div className="border-t pt-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-800">{t('restaurantRegister.businessHoursLabel')}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{t('restaurantRegister.businessHoursHint')}</p>
              </div>
              <button type="button" onClick={applyBusinessHoursToAll} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
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
                      <div className="font-medium text-gray-700 text-sm">{t(dayLabelKey(dayKey))}</div>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={isOpen} onChange={(e) => setBusinessHoursDay(dayKey, 'open', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-primary-600" />
                        <span className="text-xs text-gray-600">{t('restaurantRegister.open')}</span>
                      </label>
                      {isOpen ? (
                        <>
                          <input type="time" value={day?.start || '09:00'} onChange={(e) => setBusinessHoursDay(dayKey, 'start', e.target.value)} className="input w-full text-sm py-1.5" />
                          <input type="time" value={day?.end || '21:00'} onChange={(e) => setBusinessHoursDay(dayKey, 'end', e.target.value)} className="input w-full text-sm py-1.5" />
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
            <input type="checkbox" id="delivery_available" name="delivery_available" checked={formData.delivery_available} onChange={handleChange} className="w-4 h-4 rounded border-gray-300 text-primary-600" />
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

export default RestaurantEditPage
