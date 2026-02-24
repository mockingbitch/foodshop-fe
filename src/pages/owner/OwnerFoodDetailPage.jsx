import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useLanguage } from '@context/LanguageContext'
import { foodApi } from '@services/api/foodApi'
import LoadingSpinner from '@components/common/LoadingSpinner'
import { formatCurrency } from '@utils/helpers'
import { DEFAULT_FOOD_IMAGE } from '@constants'
import { Store, ChevronRight, ChevronLeft, Star, Leaf, Edit, Hash, Users, Calendar } from 'lucide-react'

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

const OwnerFoodDetailPage = () => {
  const { restaurantId, id } = useParams()
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
          {restaurantId ? (
            <Link to={`/owner/restaurant/${restaurantId}`} className="btn btn-primary">
              {t('restaurant.detail')}
            </Link>
          ) : (
            <Link to="/owner/dashboard" className="btn btn-primary">
              {t('owner.title')}
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
  const rid = restaurantId ?? restaurantIdFromFood
  const restaurantName = typeof restaurant === 'object' ? toDisplayText(restaurant?.name) : null
  const rating = food.customer_rating ?? food.rating
  const reviewCount = food.customer_review_count ?? food.review_count

  return (
    <div className="container-custom py-8 sm:py-12">
      <nav className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 mb-2 flex-wrap">
        <Link to="/owner/dashboard" className="hover:text-primary-600">{t('owner.title')}</Link>
        <ChevronRight size={14} className="flex-shrink-0" />
        {rid ? (
          <>
            <Link
              to={`/owner/restaurant/${rid}`}
              className="hover:text-primary-600 truncate max-w-[140px] sm:max-w-[200px] inline-block min-w-0"
              title={restaurantName || undefined}
            >
              {restaurantName || t('restaurant.detail')}
            </Link>
            <ChevronRight size={14} className="flex-shrink-0" />
          </>
        ) : null}
        <span className="text-gray-700 truncate max-w-[180px] sm:max-w-none">{name || t('food.detail')}</span>
      </nav>
      <div className="mb-6">
        {rid ? (
          <Link
            to={`/owner/restaurant/${rid}`}
            className="btn btn-outline inline-flex items-center gap-2"
          >
            <ChevronLeft size={18} />
            {t('common.back')}
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn btn-outline inline-flex items-center gap-2"
          >
            <ChevronLeft size={18} />
            {t('common.back')}
          </button>
        )}
      </div>

      <div className="card overflow-hidden p-0 flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 lg:w-2/5 flex-shrink-0 aspect-[4/3] md:aspect-auto md:min-h-[320px]">
          <img
            src={getFoodImage(food)}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="w-full md:w-1/2 lg:w-3/5 p-6 sm:p-8 flex flex-col">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {name || t('food.detail')}
            </h1>
            <Link
              to={`/owner/food-items/${id}/edit`}
              className="btn btn-primary inline-flex items-center gap-2 shrink-0"
            >
              <Edit size={18} />
              {t('common.edit')}
            </Link>
          </div>
          {/* Mã món, trạng thái */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-3">
            {food.food_code && (
              <span className="flex items-center gap-1.5">
                <Hash size={14} />
                {food.food_code}
              </span>
            )}
            {food.food_code_status && (
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                {food.food_code_status}
              </span>
            )}
            {food.status != null && food.status !== '' && (
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  food.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {food.status === 'active' ? t('common.active') : t('common.inactive')}
              </span>
            )}
          </div>
          {/* Giá, loại, đánh giá */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-4">
            <span className="font-semibold text-primary-600 text-lg">
              {formatCurrency(food.price ?? 0, food.currency_code ?? 'VND')}
            </span>
            {food.price_usd != null && food.currency_code === 'VND' && (
              <span className="text-gray-500">≈ {formatCurrency(parseFloat(food.price_usd) || 0, 'USD')}</span>
            )}
            {(food.category?.name || food.food_category?.name) && (
              <span className="text-gray-500">
                {toDisplayText(food.category?.name ?? food.food_category?.name)} ({t('food.category')})
              </span>
            )}
            {rating != null && (
              <span className="flex items-center gap-1">
                <Star size={16} className="text-amber-500" />
                {Number(rating).toFixed(1)} {t('restaurant.rating')}
              </span>
            )}
            {reviewCount != null && (
              <span className="flex items-center gap-1 text-gray-500">
                <Users size={16} />
                {reviewCount} {t('restaurant.reviews')}
              </span>
            )}
            {food.is_vegetarian && (
              <span className="inline-flex items-center gap-1 text-green-600">
                <Leaf size={16} />
                {t('food.vegetarian')}
              </span>
            )}
            {food.is_best_seller && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                Best seller
              </span>
            )}
          </div>
          {/* Mô tả */}
          {description ? (
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{t('food.detail')} (description)</p>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{description}</p>
            </div>
          ) : (
            <p className="text-gray-400 text-sm italic mb-4">—</p>
          )}
          {/* Thông tin chi tiết */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 text-sm text-gray-600 mb-4 p-3 rounded-lg bg-gray-50 border border-gray-100">
            {food.serving_size != null && (
              <div>
                <p className="text-xs text-gray-500">{t('food.servingSize')}</p>
                <p className="font-medium">{food.serving_size}</p>
              </div>
            )}
            {food.weight != null && (
              <div>
                <p className="text-xs text-gray-500">{t('food.weight')}</p>
                <p className="font-medium">{food.weight}g</p>
              </div>
            )}
            {food.currency_code && (
              <div>
                <p className="text-xs text-gray-500">{t('food.currency')}</p>
                <p className="font-medium">{food.currency_code}</p>
              </div>
            )}
            {food.created_at && (
              <div>
                <p className="text-xs text-gray-500 flex items-center gap-1"><Calendar size={12} /> Created</p>
                <p className="font-medium">{new Date(food.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>
              </div>
            )}
          </div>
          {/* Link nhà hàng */}
          {rid && (
            <Link
              to={`/owner/restaurant/${rid}`}
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

export default OwnerFoodDetailPage
