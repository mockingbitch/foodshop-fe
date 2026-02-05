import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useLanguage } from '@context/LanguageContext'
import { restaurantApi } from '@services/api/restaurantApi'
import { foodApi } from '@services/api/foodApi'
import LoadingSpinner from '@components/common/LoadingSpinner'
import { formatCurrency } from '@utils/helpers'
import { Store, MapPin, Phone, Mail, UtensilsCrossed, ChevronRight, Star, Edit, Plus } from 'lucide-react'

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
const getRestaurantImage = (r) =>
  r?.outside_image_1 ?? r?.images?.[0]?.url ?? r?.outside_images?.[0]?.url ?? r?.image_url ?? 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'
const getFoodImage = (item) =>
  item?.main_image ?? item?.image_url ?? item?.images?.[0]?.url ?? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800'

const OwnerRestaurantDetailPage = () => {
  const { id } = useParams()
  const { t } = useLanguage()
  const [restaurant, setRestaurant] = useState(null)
  const [foodItems, setFoodItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) {
      setNotFound(true)
      setLoading(false)
      return
    }
    setLoading(true)
    setNotFound(false)
    Promise.all([
      restaurantApi.getRestaurantById(id),
      foodApi.getFoodItems({ restaurant_id: id, per_page: 100 }),
    ])
      .then(([resRes, foodRes]) => {
        const rawRes = resRes?.data ?? resRes
        const rest = rawRes?.data ?? rawRes?.restaurant ?? rawRes?.result ?? rawRes
        if (rest && typeof rest === 'object') {
          setRestaurant(rest)
        } else {
          setRestaurant(null)
        }
        const list = ensureArray(foodRes?.data)
        setFoodItems(Array.isArray(list) ? list : [])
      })
      .catch(() => {
        setRestaurant(null)
        setFoodItems([])
        setNotFound(true)
      })
      .finally(() => setLoading(false))
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
        <span className="text-gray-700 truncate max-w-[180px] sm:max-w-none">{restaurantName || t('restaurant.detail')}</span>
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
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              {restaurantName || t('restaurant.detail')}
            </h1>
            <p className="text-gray-600 text-sm sm:text-base mb-4 line-clamp-3">
              {toDisplayText(restaurant.description) || '—'}
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              {restaurant.address && (
                <p className="flex items-start gap-2">
                  <MapPin size={16} className="flex-shrink-0 mt-0.5" />
                  <span>{restaurant.address}</span>
                </p>
              )}
              {restaurant.phone && (
                <p className="flex items-center gap-2">
                  <Phone size={16} className="flex-shrink-0" />
                  <span>{restaurant.phone}</span>
                </p>
              )}
              {restaurant.email && (
                <p className="flex items-center gap-2">
                  <Mail size={16} className="flex-shrink-0" />
                  <span>{restaurant.email}</span>
                </p>
              )}
              {restaurant.rating != null && (
                <p className="flex items-center gap-2">
                  <Star size={16} className="text-amber-500 flex-shrink-0" />
                  <span>{Number(restaurant.rating).toFixed(1)} {t('restaurant.reviews')}</span>
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
              <Link
                to={`/owner/restaurant/${getRestaurantId(restaurant)}/edit`}
                className="btn btn-primary inline-flex items-center gap-2"
              >
                <Edit size={18} />
                {t('common.edit')}
              </Link>
              <Link
                to={`/owner/food-items/create?restaurant_id=${id}`}
                className="btn btn-outline inline-flex items-center gap-2"
              >
                <Plus size={18} />
                {t('owner.addFoodItem')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Food items list */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <UtensilsCrossed size={20} />
          {t('owner.myFoodItems')}
        </h2>
        <Link
          to={`/owner/food-items/create?restaurant_id=${id}`}
          className="btn btn-primary text-sm inline-flex items-center gap-1.5"
        >
          <Plus size={16} />
          {t('owner.addFoodItem')}
        </Link>
      </div>

      {foodItems.length === 0 ? (
        <div className="card p-8 text-center">
          <UtensilsCrossed size={40} className="mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600 mb-4">{t('common.noData')}</p>
          <Link
            to={`/owner/food-items/create?restaurant_id=${id}`}
            className="btn btn-primary inline-flex items-center gap-2"
          >
            <Plus size={18} />
            {t('owner.addFoodItem')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {foodItems.map((item) => (
            <div key={item.id} className="card overflow-hidden p-0 flex flex-col">
              <div className="aspect-[16/10] flex-shrink-0">
                <img
                  src={getFoodImage(item)}
                  alt={toDisplayText(item.name)}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 flex flex-col flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate mb-1">
                  {toDisplayText(item.name) || t('common.noData')}
                </h3>
                <p className="text-primary-600 font-medium text-sm mb-2">
                  {formatCurrency(item.price ?? 0, item.currency_code ?? 'VND')}
                </p>
                <p className="text-gray-500 text-xs mb-3 line-clamp-2">
                  {toDisplayText(item.description) || toDisplayText(item.category?.name ?? item.food_category?.name) || '—'}
                </p>
                <div className="flex gap-2 mt-auto pt-2 border-t border-gray-100">
                  <Link
                    to={`/food-items/${item.id}`}
                    className="btn btn-outline text-xs flex-1 min-w-0"
                  >
                    {t('common.view')}
                  </Link>
                  <Link
                    to={`/owner/food-items/${item.id}/edit`}
                    className="btn btn-primary text-xs flex-1 min-w-0 inline-flex items-center justify-center gap-1"
                  >
                    <Edit size={14} />
                    {t('common.edit')}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default OwnerRestaurantDetailPage
