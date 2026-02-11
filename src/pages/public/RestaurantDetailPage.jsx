import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useLanguage } from '@context/LanguageContext'
import { restaurantApi } from '@services/api/restaurantApi'
import { foodApi } from '@services/api/foodApi'
import LoadingSpinner from '@components/common/LoadingSpinner'
import { formatCurrency, getImageUrl } from '@utils/helpers'
import { DEFAULT_FOOD_IMAGE } from '@constants'
import { Store, MapPin, Star, UtensilsCrossed, ChevronRight, ChevronLeft, LayoutList, LayoutGrid, Mail, Phone, X, Leaf } from 'lucide-react'

const PER_PAGE = 20

const getPaginationMeta = (res, listLength = 0) => {
  const root = res?.data ?? res
  if (!root || typeof root !== 'object') {
    return { currentPage: 1, lastPage: 1, total: listLength, perPage: PER_PAGE }
  }
  let payload
  if (
    root.data &&
    typeof root.data === 'object' &&
    !Array.isArray(root.data) &&
    (root.data.current_page != null || root.data.last_page != null || root.data.total != null)
  ) {
    payload = root.data
  } else {
    payload = root
  }
  const meta = payload.meta ?? payload.pagination ?? payload
  const currentPage = Number(meta.current_page ?? meta.page ?? meta.currentPage ?? 1) || 1
  const total = Number(meta.total) >= 0 ? Number(meta.total) : listLength
  const perPage = Number(meta.per_page ?? meta.perPage ?? PER_PAGE) || PER_PAGE
  let lastPage = Number(meta.last_page ?? meta.lastPage ?? meta.total_pages ?? meta.totalPages ?? 0) || 0
  if (lastPage < 1 && total > 0 && perPage > 0) lastPage = Math.ceil(total / perPage)
  return {
    currentPage,
    lastPage: lastPage >= 1 ? lastPage : 1,
    total,
    perPage,
  }
}

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

const getRestaurantImage = (restaurant) => {
  const img =
    restaurant?.outside_image_1 ??
    restaurant?.images?.[0]?.url ??
    restaurant?.outside_images?.[0]?.url ??
    restaurant?.image_url
  return img || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'
}

const getFoodImage = (item) => {
  const path = item?.main_image ?? item?.image_url ?? item?.images?.[0]?.url ?? null
  if (!path) return DEFAULT_FOOD_IMAGE
  if (typeof path === 'string' && (path.startsWith('http') || path.startsWith('/'))) return path
  return getImageUrl(path)
}

const ensureArray = (value) => {
  if (Array.isArray(value)) return value
  if (!value || typeof value !== 'object') return []
  const raw = value.data ?? value.items ?? value.food_items ?? value.list
  if (Array.isArray(raw)) return raw
  if (raw && typeof raw === 'object') {
    const nested = raw.data ?? raw.items ?? raw.food_items
    return Array.isArray(nested) ? nested : []
  }
  return []
}

const getItemPrice = (item) => item?.price ?? item?.unit_price ?? 0
const getItemCurrency = (item) => item?.currency_code ?? item?.currency ?? 'VND'
const getRatingWidth = (rating) => (!rating ? '0%' : `${(rating / 5) * 100}%`)

const RestaurantDetailPage = () => {
  const { id } = useParams()
  const { t } = useLanguage()
  const [restaurant, setRestaurant] = useState(null)
  const [foodItems, setFoodItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0, perPage: PER_PAGE })
  const [previewFood, setPreviewFood] = useState(null)

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
      foodApi.getFoodItems({ restaurant_id: id, per_page: PER_PAGE, page }),
    ])
      .then(([resRes, foodRes]) => {
        const rawRes = resRes?.data ?? resRes
        const innerRes = rawRes?.data ?? rawRes
        const rest = innerRes?.restaurant ?? innerRes?.result ?? innerRes
        if (rest && typeof rest === 'object' && !Array.isArray(rest)) {
          setRestaurant(rest)
        } else {
          setRestaurant(null)
        }

        const rawFood = foodRes?.data ?? foodRes
        const items = ensureArray(rawFood)
        setFoodItems(Array.isArray(items) ? items : [])
        setPagination(getPaginationMeta(foodRes, Array.isArray(items) ? items.length : 0))
      })
      .catch(() => {
        setRestaurant(null)
        setFoodItems([])
        setNotFound(true)
        setPagination({ currentPage: 1, lastPage: 1, total: 0, perPage: PER_PAGE })
      })
      .finally(() => setLoading(false))
  }, [id, page])

  if (loading) {
    return (
      <div className="container-custom py-12 flex justify-center min-h-[320px] items-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (notFound || !restaurant) {
    return (
      <div className="container-custom py-12">
        <div className="card p-8 text-center">
          <Store size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">{t('common.noData')}</p>
          <Link to="/restaurants" className="btn btn-primary">
            {t('restaurant.title')}
          </Link>
        </div>
      </div>
    )
  }

  const restaurantName = toDisplayText(restaurant.name)
  const description = toDisplayText(restaurant.description)
  const showPagination = pagination.total > PER_PAGE
  const from = Math.min((pagination.currentPage - 1) * pagination.perPage + 1, pagination.total)
  const to = Math.min(pagination.currentPage * pagination.perPage, pagination.total)
  const currentPage = pagination.currentPage
  const lastPage = pagination.lastPage

  return (
    <div className="container-custom py-8 sm:py-12">
      <nav className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 mb-6 flex-wrap">
        <Link to="/" className="hover:text-primary-600">{t('common.home')}</Link>
        <ChevronRight size={14} className="flex-shrink-0" />
        <Link to="/restaurants" className="hover:text-primary-600">{t('restaurant.title')}</Link>
        <ChevronRight size={14} className="flex-shrink-0" />
        <span className="text-gray-700 truncate max-w-[180px] sm:max-w-none">{restaurantName || t('restaurant.detail')}</span>
      </nav>

      {/* Restaurant info */}
      <div className="card overflow-hidden p-0 flex flex-col md:flex-row mb-8">
        <div className="w-full md:w-2/5 flex-shrink-0 aspect-[16/10] md:aspect-auto md:min-h-[280px] bg-gray-100">
          <img
            src={getRestaurantImage(restaurant)}
            alt={restaurantName}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="w-full md:w-3/5 p-6 sm:p-8 flex flex-col">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {restaurantName || t('restaurant.detail')}
          </h1>
          {description && (
            <p className="text-gray-600 leading-relaxed mb-4">{description}</p>
          )}
          <div className="space-y-2 text-sm text-gray-600 mb-4">
            {restaurant.address && (
              <p className="flex items-start gap-2 min-w-0">
                <MapPin size={18} className="flex-shrink-0 mt-0.5 text-gray-500" />
                <span>{restaurant.address}{restaurant.city ? `, ${restaurant.city}` : ''}</span>
              </p>
            )}
            {restaurant.phone && (
              <p className="flex items-center gap-2">
                <Phone size={18} className="flex-shrink-0 text-gray-500" />
                <a href={`tel:${restaurant.phone}`} className="hover:text-primary-600">{restaurant.phone}</a>
              </p>
            )}
            {restaurant.email && (
              <p className="flex items-center gap-2">
                <Mail size={18} className="flex-shrink-0 text-gray-500" />
                <a href={`mailto:${restaurant.email}`} className="hover:text-primary-600">{restaurant.email}</a>
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
            {restaurant.rating != null && (
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-16 h-2 bg-gray-200 rounded overflow-hidden">
                  <span
                    className="block h-full bg-primary-500 rounded"
                    style={{ width: getRatingWidth(restaurant.rating) }}
                  />
                </span>
                <Star size={18} className="text-amber-500 flex-shrink-0" />
                <span className="font-medium">{Number(restaurant.rating).toFixed(1)}</span>
              </span>
            )}
            {(restaurant.review_count ?? restaurant.reviews_count) != null && (
              <span className="text-gray-500">
                {restaurant.review_count ?? restaurant.reviews_count} {t('restaurant.reviews')}
              </span>
            )}
          </div>
          <div className="mt-auto pt-4 border-t border-gray-100">
            <Link
              to={`/restaurants/${id}/menu`}
              className="btn btn-primary inline-flex items-center gap-2"
            >
              <UtensilsCrossed size={18} />
              {t('restaurant.menu')}
            </Link>
          </div>
        </div>
      </div>

      {/* Food list with view toggle and pagination */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-900">{t('restaurant.bestSellers')}</h2>
        {foodItems.length > 0 && (
          <div className="flex items-center gap-1 rounded-lg border border-gray-200 p-1 bg-gray-50">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition ${viewMode === 'list' ? 'bg-white shadow text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
              title="List"
              aria-label="List view"
            >
              <LayoutList size={20} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition ${viewMode === 'grid' ? 'bg-white shadow text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
              title="Grid"
              aria-label="Grid view"
            >
              <LayoutGrid size={20} />
            </button>
          </div>
        )}
      </div>

      {foodItems.length === 0 ? (
        <div className="card p-6 text-center">
          <p className="text-gray-600 mb-2">{t('common.noData')}</p>
          <p className="text-sm text-gray-500 mb-4">{t('restaurant.menu')}</p>
          <Link to={`/restaurants/${id}/menu`} className="btn btn-outline">
            {t('restaurant.menu')}
          </Link>
        </div>
      ) : viewMode === 'grid' ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {foodItems.map((item) => (
              <article
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => setPreviewFood(item)}
                onKeyDown={(e) => e.key === 'Enter' && setPreviewFood(item)}
                className="card overflow-hidden p-0 flex flex-col h-full cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="aspect-[16/10] flex-shrink-0 bg-gray-100">
                  <img
                    src={getFoodImage(item)}
                    alt={toDisplayText(item.name)}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 flex flex-col flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1 truncate">
                    {toDisplayText(item.name) || t('common.noData')}
                  </h3>
                  <p className="text-primary-600 font-medium text-sm mb-2">
                    {formatCurrency(getItemPrice(item), getItemCurrency(item))}
                  </p>
                  <p className="text-xs text-gray-500 line-clamp-2 flex-1">
                    {toDisplayText(item.description) || '—'}
                  </p>
                </div>
              </article>
            ))}
          </div>
          {showPagination && (
            <nav
              className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 pt-6 bg-gray-50 rounded-lg px-4 py-4 sm:px-6"
              aria-label="Pagination"
            >
              <p className="text-sm text-gray-600 order-2 sm:order-1">
                {t('common.showing')} <span className="font-medium">{from}</span>–<span className="font-medium">{to}</span> {t('common.of')} <span className="font-medium">{pagination.total}</span>
              </p>
              <div className="flex items-center gap-2 order-1 sm:order-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="btn btn-outline inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={t('common.previous')}
                >
                  <ChevronLeft size={18} />
                  {t('common.previous')}
                </button>
                <span className="text-sm text-gray-700 px-3 py-1.5 bg-white border border-gray-200 rounded min-w-[80px] text-center">
                  {t('common.page')} {currentPage} / {lastPage}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                  disabled={currentPage >= lastPage}
                  className="btn btn-outline inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={t('common.next')}
                >
                  {t('common.next')}
                  <ChevronRight size={18} />
                </button>
              </div>
            </nav>
          )}
        </>
      ) : (
        <>
          <div className="card p-4 sm:p-6">
            <ul className="space-y-3">
              {foodItems.map((item) => (
                <li
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setPreviewFood(item)}
                  onKeyDown={(e) => e.key === 'Enter' && setPreviewFood(item)}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-3 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 -mx-2 px-2 rounded transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-gray-900">
                      {toDisplayText(item.name)}
                    </span>
                    {(toDisplayText(item.description) || item.serving_size) && (
                      <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                        {toDisplayText(item.description) || item.serving_size}
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0 text-primary-600 font-semibold">
                    {formatCurrency(getItemPrice(item), getItemCurrency(item))}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          {showPagination && (
            <nav
              className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 pt-6 bg-gray-50 rounded-lg px-4 py-4 sm:px-6"
              aria-label="Pagination"
            >
              <p className="text-sm text-gray-600 order-2 sm:order-1">
                {t('common.showing')} <span className="font-medium">{from}</span>–<span className="font-medium">{to}</span> {t('common.of')} <span className="font-medium">{pagination.total}</span>
              </p>
              <div className="flex items-center gap-2 order-1 sm:order-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="btn btn-outline inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={t('common.previous')}
                >
                  <ChevronLeft size={18} />
                  {t('common.previous')}
                </button>
                <span className="text-sm text-gray-700 px-3 py-1.5 bg-white border border-gray-200 rounded min-w-[80px] text-center">
                  {t('common.page')} {currentPage} / {lastPage}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                  disabled={currentPage >= lastPage}
                  className="btn btn-outline inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={t('common.next')}
                >
                  {t('common.next')}
                  <ChevronRight size={18} />
                </button>
              </div>
            </nav>
          )}
        </>
      )}

      {previewFood && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setPreviewFood(null)}
          role="dialog"
          aria-modal="true"
          aria-label={toDisplayText(previewFood.name) || t('food.detail')}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[16/10] flex-shrink-0 bg-gray-100">
              <img
                src={getFoodImage(previewFood)}
                alt={toDisplayText(previewFood.name)}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setPreviewFood(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white shadow text-gray-600 hover:text-gray-900 transition"
                aria-label={t('common.close') || 'Close'}
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {toDisplayText(previewFood.name) || t('common.noData')}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-3">
                <span className="font-semibold text-primary-600 text-lg">
                  {formatCurrency(getItemPrice(previewFood), getItemCurrency(previewFood))}
                </span>
                {(previewFood.customer_rating != null || previewFood.rating != null) && (
                  <span className="flex items-center gap-1">
                    <Star size={16} className="text-amber-500" />
                    {Number(previewFood.customer_rating ?? previewFood.rating).toFixed(1)}
                    {(previewFood.customer_review_count ?? previewFood.review_count) != null && (
                      <span className="text-gray-400">
                        ({previewFood.customer_review_count ?? previewFood.review_count})
                      </span>
                    )}
                  </span>
                )}
                {previewFood.is_vegetarian && (
                  <span className="inline-flex items-center gap-1 text-green-600">
                    <Leaf size={16} />
                    Vegetarian
                  </span>
                )}
              </div>
              {toDisplayText(previewFood.description) && (
                <p className="text-gray-600 text-sm leading-relaxed mb-3">
                  {toDisplayText(previewFood.description)}
                </p>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                {previewFood.serving_size != null && (
                  <span>{t('food.servingSize')}: {previewFood.serving_size}</span>
                )}
                {previewFood.weight != null && (
                  <span>{t('food.weight')}: {previewFood.weight}g</span>
                )}
              </div>
              {previewFood.id && (
                <Link
                  to={`/restaurants/${id}/food-items/${previewFood.id}`}
                  className="btn btn-primary inline-flex items-center gap-2"
                  onClick={() => setPreviewFood(null)}
                >
                  {t('common.view')} {t('food.detail')}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RestaurantDetailPage
