import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useLanguage } from '@context/LanguageContext'
import { foodApi } from '@services/api/foodApi'
import LoadingSpinner from '@components/common/LoadingSpinner'
import { formatCurrency } from '@utils/helpers'
import { Store, ChevronRight, Star, Leaf } from 'lucide-react'

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

const getFoodImage = (item) =>
  item?.main_image ?? item?.image_url ?? item?.images?.[0]?.url ?? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800'

const getRestaurantId = (r) => r?.id ?? r?.restaurant_id

const FoodDetailPage = () => {
  const { id } = useParams()
  const { t } = useLanguage()
  const [food, setFood] = useState(null)
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
    foodApi
      .getFoodItemById(id)
      .then((res) => {
        const raw = res?.data ?? res
        const item = raw?.data ?? raw?.food_item ?? raw?.result ?? raw
        if (item && typeof item === 'object') setFood(item)
        else setNotFound(true)
      })
      .catch(() => {
        setNotFound(true)
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="container-custom py-12 flex justify-center min-h-[320px] items-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (notFound || !food) {
    return (
      <div className="container-custom py-12">
        <div className="card p-8 text-center">
          <p className="text-gray-600 mb-4">{t('common.noData')}</p>
          <Link to="/food-items" className="btn btn-primary">
            {t('food.title')}
          </Link>
        </div>
      </div>
    )
  }

  const name = toDisplayText(food.name)
  const description = toDisplayText(food.description)
  const restaurant = food.restaurant ?? food.restaurant_id
  const restaurantId = typeof restaurant === 'object' ? getRestaurantId(restaurant) : restaurant
  const restaurantName = typeof restaurant === 'object' ? toDisplayText(restaurant?.name) : null

  return (
    <div className="container-custom py-8 sm:py-12">
      <nav className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 mb-6 flex-wrap">
        <Link to="/" className="hover:text-primary-600">{t('common.home')}</Link>
        <ChevronRight size={14} className="flex-shrink-0" />
        <Link to="/food-items" className="hover:text-primary-600">{t('food.title')}</Link>
        <ChevronRight size={14} className="flex-shrink-0" />
        <span className="text-gray-700 truncate max-w-[180px] sm:max-w-none">{name || t('food.detail')}</span>
      </nav>

      <div className="card overflow-hidden p-0 flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 lg:w-2/5 flex-shrink-0 aspect-[4/3] md:aspect-auto md:min-h-[320px]">
          <img
            src={getFoodImage(food)}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="w-full md:w-1/2 lg:w-3/5 p-6 sm:p-8 flex flex-col">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {name || t('food.detail')}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-4">
            <span className="font-semibold text-primary-600 text-lg">
              {formatCurrency(food.price ?? 0, food.currency_code ?? 'VND')}
            </span>
            {(food.category?.name || food.food_category?.name) && (
              <span className="text-gray-500">
                {toDisplayText(food.category?.name ?? food.food_category?.name)}
              </span>
            )}
            {food.rating != null && (
              <span className="flex items-center gap-1">
                <Star size={16} className="text-amber-500" />
                {Number(food.rating).toFixed(1)} {t('restaurant.reviews')}
              </span>
            )}
            {food.is_vegetarian && (
              <span className="inline-flex items-center gap-1 text-green-600">
                <Leaf size={16} />
                Vegetarian
              </span>
            )}
          </div>
          {description && (
            <p className="text-gray-600 leading-relaxed mb-4">{description}</p>
          )}
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
            {food.serving_size != null && (
              <span>{t('food.servingSize')}: {food.serving_size}</span>
            )}
            {food.weight != null && (
              <span>{t('food.weight')}: {food.weight}g</span>
            )}
          </div>
          {restaurantId && (
            <Link
              to={`/restaurants/${restaurantId}`}
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium mt-auto pt-4 border-t border-gray-100"
            >
              <Store size={18} />
              {restaurantName || t('restaurant.detail')}
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default FoodDetailPage
