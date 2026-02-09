import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useLanguage } from '@context/LanguageContext'
import { restaurantApi } from '@services/api/restaurantApi'
import { foodApi } from '@services/api/foodApi'
import { DEFAULT_FOOD_IMAGE } from '@/constants'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { Store, ChevronRight, MapPin, Phone, Mail, Star } from 'lucide-react'

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
}

// const getRestaurantId = (r) => r?.id ?? r?.restaurant_id
const getRestaurantImage = (r) => r?.outside_image_1 ?? r?.images?.[0]?.url ?? r?.outside_images?.[0]?.url ?? r?.image_url ?? 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'
const getFoodImage = (item) => item?.main_image ?? item?.image_url ?? item?.images?.[0]?.url ?? DEFAULT_FOOD_IMAGE

const RestaurantDetailPage = () => {
  const { id } = useParams()
  const { t } = useLanguage()
  const [restaurant, setRestaurant] = useState(null)
  const [foodItems, setFoodItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if(!id) {
      setNotFound(true)
      setLoading(false)
      return
    }
    setLoading(true)
    setNotFound(false)
    Promise.all([
      restaurantApi.getRestaurantById(id),
      foodApi.getFoodItems({ restaurant_id : id, per_page: 100})
    ])
      .then(([resRes, foodRes]) => {
        // console.log(resRes?.data)
        const rawRes = resRes?.data ?? resRes
        // Sửa lại logic: Ưu tiên rawRes.data, rawRes.restaurant rồi mới đến bản thân rawRes
        const rest = rawRes?.data ?? rawRes?.restaurant ?? rawRes?.result ?? rawRes
        
        if (rest && typeof rest === 'object' && !rest.restaurant) {
          setRestaurant(rest)
        } else if (rest?.restaurant) {
          setRestaurant(rest.restaurant)
        } else {
          setRestaurant(rest)
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
          <Link to="/" className="btn btn-primary">
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
        <Link to={`/restaurants/${id}`} className="hover:text-primary-600">{restaurantName}</Link>
      </nav>

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
          </div>
        </div>
      </div>

      {/* Danh sách món ăn */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Store size={24} className="text-primary-600" />
          {t('restaurant.menu') || 'Menu'}
        </h2>

        {foodItems.length === 0 ? (
          <div className="card p-8 text-center bg-gray-50">
            <p className="text-gray-500">{t('common.noData')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {foodItems.map((item) => (
              <Link 
                key={item.id} 
                to={`/food/${item.id}`}
                className="card overflow-hidden p-0 flex flex-col hover:shadow-lg transition-shadow duration-300 group"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={getFoodImage(item)}
                    alt={toDisplayText(item.name)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                    {toDisplayText(item.name)}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-1">
                    {toDisplayText(item.description)}
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                    <span className="text-primary-600 font-bold">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: item.currency_code || 'VND' }).format(item.price || 0)}
                    </span>
                    <span className="text-xs text-gray-400">
                      {toDisplayText(item.category?.name || item.food_category?.name)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default RestaurantDetailPage
