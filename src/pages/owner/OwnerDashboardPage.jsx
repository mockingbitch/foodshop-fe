import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '@context/LanguageContext'
import { useAuth } from '@context/AuthContext'
import { restaurantApi } from '@services/api/restaurantApi'
import { foodApi } from '@services/api/foodApi'
import LoadingSpinner from '@components/common/LoadingSpinner'
import { DEFAULT_FOOD_IMAGE } from '@constants'
import { Store, UtensilsCrossed, Users, Clock, MapPin, ChevronRight } from 'lucide-react'

/** owner_id từ user (backend có thể dùng id, user_id, owner_id) */
const getOwnerId = (user) => user?.id ?? user?.user_id ?? user?.owner_id

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

/** Nhà hàng có thuộc owner này không (user_id / owner_id) */
const belongsToOwner = (restaurant, ownerId) => {
  if (!ownerId || !restaurant) return false
  const uid = restaurant.user_id ?? restaurant.owner_id
  return String(uid) === String(ownerId)
}

/** Món ăn có thuộc owner này không (qua restaurant nested hoặc owner_id trực tiếp) */
const foodBelongsToOwner = (item, ownerId) => {
  if (!ownerId || !item) return false
  const direct = item.user_id ?? item.owner_id
  if (direct != null && String(direct) === String(ownerId)) return true
  const rest = item.restaurant
  return rest && belongsToOwner(rest, ownerId)
}

const OwnerDashboardPage = () => {
  const { t } = useLanguage()
  const { user } = useAuth()
  const ownerId = getOwnerId(user)
  const [activeTab, setActiveTab] = useState('restaurants')
  const [restaurants, setRestaurants] = useState([])
  const [foodItems, setFoodItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (ownerId) {
      fetchData()
    } else {
      setLoading(false)
    }
  }, [activeTab, ownerId])

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
    if (!ownerId) return
    setLoading(true)
    try {
      if (activeTab === 'restaurants') {
        const res = await restaurantApi.getRestaurants({ owner_id: ownerId })
        const raw = res?.data
        const list = ensureArray(raw)
        const filtered = Array.isArray(list)
          ? list.filter((r) => belongsToOwner(r, ownerId))
          : []
        setRestaurants(filtered)
      } else {
        const response = await foodApi.getFoodItems({ owner_id: ownerId })
        const list = ensureArray(response?.data)
        const filtered = Array.isArray(list)
          ? list.filter((item) => foodBelongsToOwner(item, ownerId))
          : []
        setFoodItems(filtered)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      if (activeTab === 'restaurants') setRestaurants([])
      else setFoodItems([])
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
  }

  const getRatingWidth = (rating) => (!rating ? '0%' : `${(rating / 5) * 100}%`)
  const getLevel = (rating) => {
    if (!rating) return 'New'
    if (rating >= 4.5) return 'Excellent'
    if (rating >= 3.5) return 'Good'
    return 'Normal'
  }

  const getFoodImage = (food) =>
    food?.main_image ?? food?.image_url ?? food?.images?.[0]?.url ?? DEFAULT_FOOD_IMAGE

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
              <span className="text-gray-700 truncate">
                {activeTab === 'restaurants' ? t('owner.myRestaurants') : t('owner.myFoodItems')}
              </span>
            </nav>
          </div>
        </div>
      </div>

      <div className="flex gap-0 sm:gap-4 border-b border-gray-200 mb-4 sm:mb-6 overflow-x-auto -mx-1 px-1">
        <button
          type="button"
          onClick={() => setActiveTab('restaurants')}
          className={`flex-shrink-0 px-3 sm:px-4 py-3 font-medium border-b-2 transition whitespace-nowrap ${
            activeTab === 'restaurants'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <span className="flex items-center gap-2">
            <Store size={18} className="flex-shrink-0" />
            {t('owner.myRestaurants')}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('food-items')}
          className={`flex-shrink-0 px-3 sm:px-4 py-3 font-medium border-b-2 transition whitespace-nowrap ${
            activeTab === 'food-items'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <span className="flex items-center gap-2">
            <UtensilsCrossed size={18} className="flex-shrink-0" />
            {t('owner.myFoodItems')}
          </span>
        </button>
      </div>

      {activeTab === 'restaurants' ? (
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
                    src={restaurant.images?.[0]?.url || restaurant.outside_images?.[0]?.url || restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'}
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
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2 truncate min-w-0" title={toDisplayText(restaurant.name) || undefined}>
                      <Link to={`/owner/restaurant/${getRestaurantId(restaurant)}`} className="hover:text-primary-600 truncate block min-w-0">
                        {toDisplayText(restaurant.name) || restaurant.name || t('common.noData')}
                      </Link>
                    </h2>
                    <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 mb-3 sm:mb-4">
                      {toDisplayText(restaurant.description) || restaurant.description || t('common.noData')}
                    </p>
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
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {!Array.isArray(foodItems) || foodItems.length === 0 ? (
            <div className="card p-6 sm:p-12 text-center">
              <UtensilsCrossed size={40} className="mx-auto text-gray-400 mb-3 sm:mb-4" />
              <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">{t('common.noData')}</p>
              <Link to="/owner/dashboard" className="btn btn-primary inline-flex items-center gap-2 text-sm sm:text-base">
                <UtensilsCrossed size={18} className="flex-shrink-0" />
                {t('owner.addFoodItem')}
              </Link>
            </div>
          ) : (
            <section className="mb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">{t('owner.myFoodItems')}</h2>
                <Link
                  to="/owner/dashboard"
                  className="text-primary-600 hover:text-primary-700 font-medium text-sm inline-flex items-center gap-1"
                >
                  {t('owner.addFoodItem')}
                  <ChevronRight size={18} />
                </Link>
              </div>
              <div className="card p-4 sm:p-6">
                <ul className="space-y-0">
                  {foodItems.map((food, idx) => (
                    <li
                      key={food.id ?? idx}
                      className="flex items-center gap-3 sm:gap-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded transition-colors"
                    >
                      <Link
                        to={`/food-items/${food.id}`}
                        className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-gray-100"
                      >
                        <img
                          src={getFoodImage(food)}
                          alt={toDisplayText(food.name)}
                          className="w-full h-full object-cover"
                        />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link to={`/food-items/${food.id}`} className="font-medium text-gray-900 block hover:text-primary-600">
                          {toDisplayText(food.name) || t('common.noData')}
                        </Link>
                        {(toDisplayText(food.description) || food.serving_size) && (
                          <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                            {toDisplayText(food.description) || food.serving_size}
                          </p>
                        )}
                        {toDisplayText(food.category?.name ?? food.food_category?.name) && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {toDisplayText(food.category?.name ?? food.food_category?.name)}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-2 flex-wrap justify-end">
                        <span className="text-primary-600 font-semibold">
                          {formatPrice(food.price ?? 0)}
                        </span>
                        <Link
                          to={`/food-items/${food.id}`}
                          className="btn btn-outline text-xs py-1.5"
                        >
                          {t('common.view')}
                        </Link>
                        <Link
                          to={`/owner/food-items/${food.id}/edit`}
                          className="btn btn-primary text-xs py-1.5"
                        >
                          {t('common.edit')}
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

export default OwnerDashboardPage
