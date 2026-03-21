import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useLanguage } from '@context/LanguageContext'
import { restaurantApi } from '@services/api/restaurantApi'
import { foodApi } from '@services/api/foodApi'
import LoadingSpinner from '@components/common/LoadingSpinner'
import { formatCurrency, getImageUrl, stripHtml } from '@utils/helpers'
import { DEFAULT_FOOD_IMAGE } from '@constants'
import { Store, MapPin, Phone, Mail, UtensilsCrossed, ChevronRight, Star, Edit, Plus, Clock, Users, Hash, Truck, Globe, User, Calendar, ExternalLink, X } from 'lucide-react'

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
  const raw = value.data ?? value.items ?? value.food_items ?? value.foodItems ?? value.list
  if (Array.isArray(raw)) return raw
  if (raw && typeof raw === 'object') {
    const nested = raw.data ?? raw.items ?? raw.food_items ?? raw.foodItems ?? raw.list
    return Array.isArray(nested) ? nested : []
  }
  return []
}

const getRestaurantId = (r) => r?.id ?? r?.restaurant_id
const getRestaurantImage = (r) => {
  const raw = r?.main_image ?? r?.outside_image_1 ?? r?.images?.[0]?.url ?? r?.outside_images?.[0]?.url ?? r?.image_url ?? 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'
  return typeof raw === 'string' && !raw.startsWith('http') ? getImageUrl(raw) : raw
}
const getFoodImage = (item) =>
  item?.main_image ?? item?.image_url ?? item?.images?.[0]?.url ?? DEFAULT_FOOD_IMAGE

const resolveImgUrl = (v) => {
  if (!v) return null
  let url = null
  if (typeof v === 'object') url = v?.url ?? v?.image_url ?? null
  else if (typeof v === 'string' && v.trim()) url = v
  if (!url) return null
  return url.startsWith('http') ? url : getImageUrl(url)
}
const collectOutsideImages = (r) => {
  const out = []
  if (r?.outside_image_1) out.push(resolveImgUrl(r.outside_image_1) ?? r.outside_image_1)
  if (r?.outside_image_2) out.push(resolveImgUrl(r.outside_image_2) ?? r.outside_image_2)
  const arr = r?.outside_images
  if (Array.isArray(arr)) arr.forEach((item) => { const u = resolveImgUrl(item); if (u) out.push(u) })
  else if (arr?.url) out.push(resolveImgUrl(arr.url) ?? arr.url)
  return out
}
const collectInsideImages = (r) => {
  const out = []
  ;['inside_image_1', 'inside_image_2', 'inside_image_3', 'inside_image_4', 'inside_image_5'].forEach((key) => {
    const v = r?.[key]
    if (v) out.push(resolveImgUrl(v) ?? v)
  })
  const arr = r?.inside_images
  if (Array.isArray(arr)) arr.forEach((item) => { const u = resolveImgUrl(item); if (u) out.push(u) })
  else if (arr?.url) out.push(resolveImgUrl(arr.url) ?? arr.url)
  return out
}

const DAY_LABELS = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' }
const formatBusinessHours = (hours) => {
  if (hours == null) return null
  if (typeof hours === 'string') return hours.trim() || null
  if (typeof hours !== 'object') return null
  const parts = []
  Object.entries(DAY_LABELS).forEach(([key, label]) => {
    const day = hours[key]
    if (!day) return
    const open = day.open !== false
    const start = day.start ?? ''
    const end = day.end ?? ''
    if (open && (start || end)) parts.push(`${label} ${start}-${end}`.trim())
    else if (!open) parts.push(`${label} closed`)
  })
  return parts.length ? parts.join(', ') : null
}

const formatDate = (str) => {
  if (!str) return '—'
  try {
    const d = new Date(str)
    return Number.isNaN(d.getTime()) ? str : d.toLocaleDateString(undefined, { dateStyle: 'medium' })
  } catch {
    return str
  }
}

const PER_PAGE = 100

const OwnerRestaurantDetailPage = () => {
  const { id } = useParams()
  const { t } = useLanguage()
  const [restaurant, setRestaurant] = useState(null)
  const [foodItems, setFoodItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingFood, setLoadingFood] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [showDescriptionPopup, setShowDescriptionPopup] = useState(false)

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
      .then((resRes) => {
        const rawRes = resRes?.data ?? resRes
        let rest = rawRes?.data ?? rawRes?.restaurant ?? rawRes?.result ?? rawRes
        if (rest && typeof rest === 'object' && rest.restaurant != null) {
          rest = rest.restaurant
        }
        if (rest && typeof rest === 'object') {
          setRestaurant(rest)
        } else {
          setRestaurant(null)
        }
      })
      .catch(() => setRestaurant(null))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!id) return
    setLoadingFood(true)
    foodApi
      .getFoodItems({ restaurant_id: id, per_page: PER_PAGE })
      .then((foodRes) => {
        const raw = foodRes?.data ?? foodRes
        const list = ensureArray(raw?.data ?? raw?.food_items ?? raw)
        setFoodItems(Array.isArray(list) ? list : [])
      })
      .catch(() => setFoodItems([]))
      .finally(() => setLoadingFood(false))
  }, [id])

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto flex justify-center min-h-[320px] items-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (notFound || !restaurant) {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <div className="card p-8 text-center">
          <Store size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">{t('common.noData')}</p>
          <Link to="/owner/dashboard" className="btn btn-primary">
            {t('common.back')}
          </Link>
        </div>
      </div>
    )
  }

  const restaurantName = toDisplayText(restaurant.name)

  return (
    <div className="w-full max-w-6xl mx-auto">
      <nav className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 mb-6 flex-wrap">
        <Link to="/" className="hover:text-primary-600">{t('common.home')}</Link>
        <ChevronRight size={14} className="flex-shrink-0" />
        <Link to="/owner/dashboard" className="hover:text-primary-600">{t('owner.title')}</Link>
        <ChevronRight size={14} className="flex-shrink-0" />
        <span className="text-gray-700 truncate max-w-[140px] sm:max-w-[240px] min-w-0 inline-block" title={restaurantName || undefined}>{restaurantName || t('restaurant.detail')}</span>
      </nav>

      {/* Restaurant info */}
      <div className="card overflow-hidden p-0 mb-6 sm:mb-8">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-2/5 flex-shrink-0 aspect-[16/10] md:aspect-auto md:min-h-[240px]">
            <img
              src={getRestaurantImage(restaurant)}
              alt={restaurantName}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="w-full md:w-3/5 p-4 sm:p-6 flex flex-col">
            <Link
              to={`/owner/restaurant/${id}/edit`}
              className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 hover:text-primary-600 hover:underline block"
            >
              {restaurantName || t('restaurant.detail')}
            </Link>
            {/* Mã, trạng thái */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-2">
              {(restaurant.code != null && restaurant.code !== '') && (
                <span className="flex items-center gap-1.5">
                  <Hash size={14} className="flex-shrink-0" />
                  {restaurant.code}
                </span>
              )}
              {(restaurant.status != null && restaurant.status !== '') && (
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    restaurant.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {restaurant.status === 'active' ? t('common.active') : t('common.inactive')}
                </span>
              )}
            </div>
            {(() => {
              const description = toDisplayText(restaurant.description)
              if (!description) return <p className="text-gray-600 text-sm sm:text-base mb-4">—</p>
              return (
                <div className="mb-4">
                  <div className="overflow-hidden" style={{ maxHeight: '3.5rem' }}>
                    <div
                      className="content-html text-gray-600 text-sm sm:text-base leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: description }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDescriptionPopup(true)}
                    className="mt-2 text-sm font-medium text-primary-600 hover:text-primary-700 block"
                  >
                    {t('common.viewMore')}
                  </button>
                </div>
              )
            })()}
            {/* Địa chỉ */}
            {(restaurant.address || restaurant.city) && (
              <div className="mb-4 p-3 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{t('restaurant.address')}</p>
                <p className="flex items-start gap-2 text-sm text-gray-700">
                  <MapPin size={16} className="flex-shrink-0 mt-0.5" />
                  <span>
                    {[restaurant.address, restaurant.city].filter(Boolean).join(', ')}
                    {restaurant.country && ` — ${toDisplayText(restaurant.country.name ?? restaurant.country.code) || restaurant.country.code}`}
                  </span>
                </p>
              </div>
            )}
            {/* Thông tin cơ bản: liên hệ, giờ, đánh giá */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm text-gray-600">
              {restaurant.phone && (
                <p className="flex items-center gap-2">
                  <Phone size={16} className="flex-shrink-0" />
                  <a href={`tel:${restaurant.phone}`} className="hover:text-primary-600">{restaurant.phone}</a>
                </p>
              )}
              {restaurant.zalo && (
                <p className="flex items-center gap-2">
                  <Phone size={16} className="flex-shrink-0" />
                  <span>{t('restaurant.zalo')}: {restaurant.zalo}</span>
                </p>
              )}
              {restaurant.email && (
                <p className="flex items-center gap-2">
                  <Mail size={16} className="flex-shrink-0" />
                  <a href={`mailto:${restaurant.email}`} className="hover:text-primary-600 truncate min-w-0">{restaurant.email}</a>
                </p>
              )}
              {(() => {
                const hoursStr = (restaurant.hours != null && restaurant.hours !== '') ? restaurant.hours : formatBusinessHours(restaurant.business_hours)
                return hoursStr ? (
                  <p className="flex items-start gap-2">
                    <Clock size={16} className="flex-shrink-0 mt-0.5" />
                    <span className="break-words">{hoursStr}</span>
                  </p>
                ) : null
              })()}
              {(restaurant.reviews_count != null || restaurant.review_count != null) && (
                <p className="flex items-center gap-2">
                  <Users size={16} className="flex-shrink-0" />
                  <span>{restaurant.reviews_count ?? restaurant.review_count ?? 0} {t('restaurant.reviews')}</span>
                </p>
              )}
              {restaurant.rating != null && (
                <p className="flex items-center gap-2">
                  <Star size={16} className="text-amber-500 flex-shrink-0" />
                  <span>{Number(restaurant.rating).toFixed(1)} ({t('restaurant.rating')})</span>
                </p>
              )}
              {restaurant.country && (
                <p className="flex items-center gap-2">
                  <Globe size={16} className="flex-shrink-0" />
                  <span>{toDisplayText(restaurant.country.name ?? restaurant.country.name_en ?? restaurant.country.code) || restaurant.country.code || '—'}</span>
                </p>
              )}
              {restaurant.restaurant_type && (
                <p className="flex items-center gap-2">
                  <Store size={16} className="flex-shrink-0" />
                  <span>{toDisplayText(restaurant.restaurant_type.name ?? restaurant.restaurant_type.name_en ?? restaurant.restaurant_type.code) || restaurant.restaurant_type.code || '—'}</span>
                </p>
              )}
              {restaurant.delivery_available === true && (
                <p className="flex items-center gap-2">
                  <Truck size={16} className="flex-shrink-0" />
                  <span>{t('restaurant.delivery')}</span>
                </p>
              )}
              {restaurant.user && (
                <p className="flex items-start gap-2 sm:col-span-2">
                  <User size={16} className="flex-shrink-0 mt-0.5" />
                  <span className="min-w-0">
                    {restaurant.user.name && <span className="block">{restaurant.user.name}</span>}
                    {restaurant.user.email && (
                      <a href={`mailto:${restaurant.user.email}`} className="text-primary-600 hover:underline truncate block">{restaurant.user.email}</a>
                    )}
                    {!restaurant.user.name && !restaurant.user.email && '—'}
                  </span>
                </p>
              )}
              {restaurant.created_at && (
                <p className="flex items-center gap-2">
                  <Calendar size={16} className="flex-shrink-0" />
                  <span>{t('restaurantRegister.created')} {formatDate(restaurant.created_at)}</span>
                </p>
              )}
              {restaurant.updated_at && (
                <p className="flex items-center gap-2">
                  <Calendar size={16} className="flex-shrink-0" />
                  <span>{t('restaurantRegister.updated')} {formatDate(restaurant.updated_at)}</span>
                </p>
              )}
              {restaurant.webpage_link && (
                <p className="flex items-center gap-2">
                  <ExternalLink size={16} className="flex-shrink-0" />
                  <a href={restaurant.webpage_link} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline truncate min-w-0">{t('restaurantRegister.webpage')}</a>
                </p>
              )}
              {restaurant.facebook_link && (
                <p className="flex items-center gap-2">
                  <ExternalLink size={16} className="flex-shrink-0" />
                  <a href={restaurant.facebook_link} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline truncate min-w-0">{t('restaurantRegister.facebook')}</a>
                </p>
              )}
              {restaurant.youtube_link && (
                <p className="flex items-center gap-2">
                  <ExternalLink size={16} className="flex-shrink-0" />
                  <a href={restaurant.youtube_link} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline truncate min-w-0">{t('restaurantRegister.youtube')}</a>
                </p>
              )}
            </div>
            {restaurant.remark != null && restaurant.remark !== '' && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{t('restaurantRegister.remarkLabel')}</p>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{toDisplayText(restaurant.remark) || restaurant.remark}</p>
              </div>
            )}
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
              <Link
                to={`/owner/restaurant/${id}/edit`}
                className="btn btn-primary inline-flex items-center gap-2"
              >
                <Edit size={18} />
                {t('common.edit')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Ảnh bên ngoài & Ảnh bên trong */}
      {(() => {
        const outImgs = collectOutsideImages(restaurant)
        const inImgs = collectInsideImages(restaurant)
        if (outImgs.length === 0 && inImgs.length === 0) return null
        return (
          <div className="card p-4 sm:p-5 mb-6 sm:mb-8">
            <div className="flex flex-row flex-wrap items-start gap-x-6 gap-y-4">
              {outImgs.length > 0 && (
                <section className="flex-shrink-0">
                  <h2 className="text-base font-semibold text-gray-900 mb-2">{t('restaurantRegister.outsideImages')}</h2>
                  <div className="flex flex-wrap gap-2">
                    {outImgs.map((url, idx) => (
                      <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="block w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 hover:opacity-90 transition">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                </section>
              )}
              {inImgs.length > 0 && (
                <section className="flex-shrink-0">
                  <h2 className="text-base font-semibold text-gray-900 mb-2">{t('restaurantRegister.insideImages')}</h2>
                  <div className="flex flex-wrap gap-2">
                    {inImgs.map((url, idx) => (
                      <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="block w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 hover:opacity-90 transition">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        )
      })()}

      {showDescriptionPopup && toDisplayText(restaurant?.description) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShowDescriptionPopup(false)}
          role="dialog"
          aria-modal="true"
          aria-label={t('restaurantRegister.descriptionLabel')}
        >
          <div
            className="relative bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">{t('restaurantRegister.descriptionLabel')}</h2>
              <button
                type="button"
                onClick={() => setShowDescriptionPopup(false)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition"
                aria-label={t('common.close')}
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 min-w-0">
              <div
                className="content-html text-gray-600 leading-relaxed"
                style={{ wordBreak: 'normal', overflowWrap: 'break-word' }}
                dangerouslySetInnerHTML={{ __html: toDisplayText(restaurant.description) }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Food items list */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <UtensilsCrossed size={20} />
          {t('owner.myFoodItems')}
        </h2>
        <Link
          to={`/owner/restaurant/${id}/food-items/create`}
          className="btn btn-primary text-sm inline-flex items-center gap-1.5"
        >
          <Plus size={16} />
          {t('owner.addFoodItem')}
        </Link>
      </div>

      {loadingFood ? (
        <div className="card p-8 flex justify-center items-center min-h-[200px]">
          <LoadingSpinner />
        </div>
      ) : foodItems.length === 0 ? (
        <div className="card p-8 text-center">
          <UtensilsCrossed size={40} className="mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600 mb-4">{t('common.noData')}</p>
          <Link
            to={`/owner/restaurant/${id}/food-items/create`}
            className="btn btn-primary inline-flex items-center gap-2"
          >
            <Plus size={18} />
            {t('owner.addFoodItem')}
          </Link>
        </div>
      ) : (
        <div className="card p-4 sm:p-6">
          <ul className="space-y-0">
            {foodItems.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 sm:gap-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded transition-colors"
              >
                <Link
                  to={`/owner/restaurant/${id}/food-items/${item.id}`}
                  className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-gray-100"
                >
                  <img
                    src={getFoodImage(item)}
                    alt={toDisplayText(item.name)}
                    className="w-full h-full object-cover"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/owner/restaurant/${id}/food-items/${item.id}`}
                    className="font-medium text-gray-900 block hover:text-primary-600"
                  >
                    {toDisplayText(item.name) || t('common.noData')}
                  </Link>
                  {(toDisplayText(item.description) || item.serving_size) && (
                    <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                      {stripHtml(toDisplayText(item.description)) || item.serving_size || '—'}
                    </p>
                  )}
                  {toDisplayText(item.category?.name ?? item.food_category?.name) && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {toDisplayText(item.category?.name ?? item.food_category?.name)}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0 flex items-center gap-2 flex-wrap justify-end">
                  <span className="text-primary-600 font-semibold">
                    {formatCurrency(item.price ?? 0, item.currency_code ?? 'VND')}
                  </span>
                  <Link
                    to={`/owner/restaurant/${id}/food-items/${item.id}`}
                    className="btn btn-outline text-xs py-1.5"
                  >
                    {t('common.view')}
                  </Link>
                  <Link
                    to={`/owner/food-items/${item.id}/edit`}
                    className="btn btn-primary text-xs py-1.5 inline-flex items-center gap-1"
                  >
                    <Edit size={14} />
                    {t('common.edit')}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default OwnerRestaurantDetailPage
