import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '@context/LanguageContext'
import { useAuth } from '@context/AuthContext'
import { restaurantApi } from '@services/api/restaurantApi'
import LoadingSpinner from '@components/common/LoadingSpinner'
import { Store, Users, Clock, MapPin } from 'lucide-react'

/** Chuỗi hiển thị từ name/description (string hoặc object { en, vn, kr }) */
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
/** ID nhà hàng (backend có thể trả id hoặc restaurant_id) */
const getRestaurantId = (r) => r?.id ?? r?.restaurant_id

const OwnerDashboardPage = () => {
  const { t } = useLanguage()
  const { user } = useAuth()
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) fetchData()
    else setLoading(false)
  }, [user])

  /** Rút mảng từ response (hỗ trợ data, data.data, restaurants, items, results, list, phân trang). */
  const ensureArray = (value) => {
    if (Array.isArray(value)) return value
    if (!value || typeof value !== 'object') return []
    const raw =
      value.data ??
      value.restaurants ??
      value.items ??
      value.results ??
      value.list ??
      value.food_items ??
      value.foodItems
    if (Array.isArray(raw)) return raw
    if (raw && typeof raw === 'object') {
      const nested =
        raw.data ?? raw.restaurants ?? raw.items ?? raw.results ?? raw.list ?? raw.food_items ?? raw.foodItems
      return Array.isArray(nested) ? nested : []
    }
    return []
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await restaurantApi.getOwnerRestaurants({ per_page: 15, page: 1 })
      const raw = res?.data
      const list = ensureArray(raw)
      setRestaurants(Array.isArray(list) ? list : [])
    } catch (error) {
      console.error('Error fetching data:', error)
      setRestaurants([])
    } finally {
      setLoading(false)
    }
  }

  const getRatingWidth = (rating) => (!rating ? '0%' : `${(rating / 5) * 100}%`)
  const getLevel = (rating) => {
    if (!rating) return t('common.ratingNew')
    if (rating >= 4.5) return t('common.ratingExcellent')
    if (rating >= 3.5) return t('common.ratingGood')
    return t('common.ratingNormal')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{t('owner.title')}</h1>
            <nav className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 mt-1 flex-wrap">
              <Link to="/" className="hover:text-primary-600 truncate">{t('common.home')}</Link>
              <span>/</span>
              <Link to="/owner/dashboard" className="hover:text-primary-600 truncate">{t('owner.title')}</Link>
              <span>/</span>
              <span className="text-gray-700 truncate">{t('owner.myRestaurants')}</span>
            </nav>
          </div>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {(!Array.isArray(restaurants) || restaurants.length === 0) ? (
            <div className="card p-6 sm:p-12 text-center">
              <Store size={40} className="mx-auto text-gray-400 mb-3 sm:mb-4" />
              <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">{t('common.noData')}</p>
              <Link
                to="/owner/restaurant/register"
                className="btn btn-primary inline-flex items-center gap-2 text-sm sm:text-base"
              >
                <Store size={18} className="flex-shrink-0" />
                {t('owner.addRestaurant')}
              </Link>
            </div>
          ) : Array.isArray(restaurants) && restaurants.length > 0 ? (
            (Array.isArray(restaurants) ? restaurants : []).map((restaurant, idx) => (
              <div key={getRestaurantId(restaurant) ?? idx} className="card overflow-hidden flex flex-col sm:flex-row p-0">
                <div className="w-full sm:w-1/3 relative group aspect-square sm:aspect-square sm:max-w-[200px] flex-shrink-0 rounded-l-xl overflow-hidden">
                  <img
                    src={restaurant.main_image || restaurant.images?.[0]?.url || restaurant.outside_images?.[0]?.url || restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'}
                    alt={toDisplayText(restaurant.name)}
                    className="w-full h-full object-cover"
                  />
                  <Link
                    to={`/owner/restaurant/${getRestaurantId(restaurant)}`}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition active:opacity-100"
                  >
                    <span className="text-white font-medium text-sm sm:text-base">{t('common.view')}</span>
                  </Link>
                </div>
                <div className="w-full sm:w-2/3 p-4 sm:p-6 flex flex-col justify-between min-w-0">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 truncate min-w-0" title={toDisplayText(restaurant.name) || undefined}>
                      <Link to={`/owner/restaurant/${getRestaurantId(restaurant)}`} className="hover:text-primary-600 truncate block min-w-0">
                        {toDisplayText(restaurant.name) || restaurant.name || t('common.noData')}
                      </Link>
                    </h2>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 sm:gap-4 text-xs sm:text-sm text-gray-500">
                      <span className="flex items-center gap-1"><Users size={14} className="flex-shrink-0" /> {restaurant.reviews_count || 0}</span>
                      <span className="flex items-center gap-1"><Clock size={14} className="flex-shrink-0" /> {restaurant.hours || '24/7'}</span>
                      <span className="flex items-center gap-1 min-w-0"><MapPin size={14} className="flex-shrink-0" /> <span className="truncate">{restaurant.address ? `${String(restaurant.address).slice(0, 30)}${String(restaurant.address).length > 30 ? '...' : ''}` : '—'}</span></span>
                      <span className="flex items-center gap-1">
                        <span className="inline-block w-12 sm:w-16 h-2 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                          <span className="block h-full bg-primary-500 rounded" style={{ width: getRatingWidth(restaurant.rating) }} />
                        </span>
                        {getLevel(restaurant.rating)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                    <Link to={`/owner/restaurant/${getRestaurantId(restaurant)}`} className="btn btn-outline text-xs sm:text-sm flex-1 sm:flex-initial min-w-0">
                      {t('common.view')}
                    </Link>
                    <Link to={`/owner/restaurant/${getRestaurantId(restaurant)}/edit`} className="btn btn-primary text-xs sm:text-sm flex-1 sm:flex-initial min-w-0">
                      {t('common.edit')}
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : null}
      </div>
    </div>
  )
}

export default OwnerDashboardPage
