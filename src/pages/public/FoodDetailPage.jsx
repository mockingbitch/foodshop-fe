import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useLanguage } from '@context/LanguageContext'
import { foodApi } from '@services/api/foodApi'
import LoadingSpinner from '@components/common/LoadingSpinner'
import { formatCurrency } from '@utils/helpers'
import { DEFAULT_FOOD_IMAGE } from '@constants'
import { Store, ChevronRight, ChevronLeft, Star, Leaf } from 'lucide-react'

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
  item?.main_image ?? item?.image_url ?? item?.images?.[0]?.url ?? DEFAULT_FOOD_IMAGE

const getRestaurantId = (r) => r?.id ?? r?.restaurant_id

const FoodDetailPage = () => {
  const { id, restaurantId: restaurantIdParam } = useParams()
  const navigate = useNavigate()
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
        let item = raw?.data ?? raw?.food_item ?? raw?.result ?? raw
        // API trả về data: { food_item, extra_images } → lấy food_item
        if (item && typeof item === 'object' && item.food_item != null) item = item.food_item
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
          {restaurantIdParam ? (
            <Link to={`/restaurants/${restaurantIdParam}`} className="btn btn-primary">
              {t('restaurant.detail')}
            </Link>
          ) : (
            <Link to="/food-items" className="btn btn-primary">
              {t('food.title')}
            </Link>
          )}
        </div>
      </div>
    )
  }

  const name = toDisplayText(food.name)
  const description = toDisplayText(food.description)
  const restaurant = food.restaurant ?? food.restaurant_id
  const restaurantIdFromFood = typeof restaurant === 'object' ? getRestaurantId(restaurant) : restaurant
  const restaurantId = restaurantIdParam ?? restaurantIdFromFood
  const restaurantName = typeof restaurant === 'object' ? toDisplayText(restaurant?.name) : null

  return (
    <div className="container-custom py-8 sm:py-12">
      <div className="mb-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-primary-600 transition"
          aria-label={t('common.back')}
        >
          <ChevronLeft size={18} />
          {t('common.back')}
        </button>
      </div>
      <nav className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 mb-6 flex-wrap">
        <Link to="/" className="hover:text-primary-600">{t('common.home')}</Link>
        <ChevronRight size={14} className="flex-shrink-0" />
        {restaurantIdParam ? (
          <>
            <Link to="/restaurants" className="hover:text-primary-600">{t('restaurant.title')}</Link>
            <ChevronRight size={14} className="flex-shrink-0" />
            <Link to={`/restaurants/${restaurantIdParam}`} className="hover:text-primary-600 truncate max-w-[120px] sm:max-w-[200px]">
              {restaurantName || t('restaurant.detail')}
            </Link>
            <ChevronRight size={14} className="flex-shrink-0" />
          </>
        ) : (
          <>
            <Link to="/food-items" className="hover:text-primary-600">{t('food.title')}</Link>
            <ChevronRight size={14} className="flex-shrink-0" />
          </>
        )}
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
            {(food.rating != null || food.customer_rating != null) && (
              <span className="flex items-center gap-1">
                <Star size={16} className="text-amber-500" />
                {Number(food.customer_rating ?? food.rating).toFixed(1)}
                {food.customer_review_count != null && (
                  <span className="text-gray-500">({food.customer_review_count} {t('restaurant.reviews')})</span>
                )}
                {food.customer_review_count == null && <span> {t('restaurant.reviews')}</span>}
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
