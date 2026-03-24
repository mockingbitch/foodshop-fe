import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '@context/LanguageContext'
import { foodApi } from '@services/api/foodApi'
import { categoryApi } from '@services/api/categoryApi'
import LoadingSpinner from '@components/common/LoadingSpinner'
import { formatCurrency, getLocalizedText } from '@utils/helpers'
import { DEFAULT_FOOD_IMAGE } from '@constants'
import { UtensilsCrossed, Star, Store, ChevronLeft, ChevronRight } from 'lucide-react'

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
  const raw = value.data ?? value.items ?? value.food_items ?? value.foodItems ?? value.results ?? value.list
  if (Array.isArray(raw)) return raw
  if (raw && typeof raw === 'object') {
    const nested = raw.data ?? raw.items ?? raw.food_items ?? raw.foodItems ?? raw.results ?? raw.list
    return Array.isArray(nested) ? nested : []
  }
  return []
}

const getFoodImage = (item) =>
  item?.main_image ?? item?.image_url ?? item?.images?.[0]?.url ?? DEFAULT_FOOD_IMAGE

const getRestaurantFromItem = (item) => item?.restaurant ?? item?.restaurant_id ?? null
const getRestaurantId = (r) => (r && typeof r === 'object' ? (r.id ?? r.restaurant_id) : r)

const DEBOUNCE_MS = 350
const PER_PAGE = 12

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

const FoodListPage = () => {
  const { t, currentLanguage } = useLanguage()
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0, perPage: PER_PAGE })

  // Track last filters to decide whether to debounce or fetch immediately.
  const prevFiltersRef = useRef({ searchQuery: '', categoryId: '' })
  const skipFetchOnNextPageRef = useRef(false)

  useEffect(() => {
    categoryApi
      .getCategories()
      .then((res) => setCategories(ensureArray(res?.data)))
      .catch(() => setCategories([]))
  }, [])

  const fetchItems = useCallback((search, catId, pageNum) => {
    setLoading(true)
    const params = { per_page: PER_PAGE, page: pageNum }
    if (search?.trim()) params.search = search.trim()
    if (catId) params.category_id = Number(catId)
    foodApi
      .getFoodItems(params)
      .then((res) => {
        const list = ensureArray(res?.data)
        setItems(Array.isArray(list) ? list : [])
        setPagination(getPaginationMeta(res, Array.isArray(list) ? list.length : 0))
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (skipFetchOnNextPageRef.current) {
      skipFetchOnNextPageRef.current = false
      return
    }

    const filtersChanged =
      prevFiltersRef.current.searchQuery !== searchQuery || prevFiltersRef.current.categoryId !== categoryId

    // Update ref so the next effect run (e.g. page change) doesn't double-fetch.
    if (filtersChanged) {
      prevFiltersRef.current = { searchQuery, categoryId }
      if (page !== 1) {
        skipFetchOnNextPageRef.current = true
        setPage(1)
      }
    }

    if (filtersChanged) {
      const timer = setTimeout(() => fetchItems(searchQuery, categoryId, 1), DEBOUNCE_MS)
      return () => clearTimeout(timer)
    }

    fetchItems(searchQuery, categoryId, page)
  }, [searchQuery, categoryId, page, fetchItems])

  const getRatingWidth = (rating) => (!rating ? '0%' : `${(rating / 5) * 100}%`)
  const hasFilters = searchQuery.trim() || categoryId
  const currentPage = pagination.currentPage
  const lastPage = pagination.lastPage
  const showPagination = lastPage > 1
  const safeTotal = pagination.total > 0 ? pagination.total : items.length
  const from = Math.min((currentPage - 1) * pagination.perPage + 1, safeTotal || 0)
  const to = Math.min(currentPage * pagination.perPage, safeTotal || 0)

  return (
    <div className="container-custom py-8 sm:py-12">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{t('food.title')}</h1>
        <p className="text-gray-600 text-sm sm:text-base">{t('food.searchByName')}</p>
      </div>

      <div className="card p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="food-search" className="block text-sm font-medium text-gray-700 mb-1">{t('food.searchByName')}</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <UtensilsCrossed size={18} />
              </span>
              <input
                id="food-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('food.searchByName')}
                className="input w-full pl-10 pr-4 py-2.5"
                aria-label={t('food.searchByName')}
              />
            </div>
          </div>
          <div>
            <label htmlFor="food-category" className="block text-sm font-medium text-gray-700 mb-1">{t('food.category')}</label>
            <select
              id="food-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="input w-full py-2.5"
            >
              <option value="">{t('common.all')}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {getLocalizedText(c.name, currentLanguage) || c.name_en || c.code || c.id}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center min-h-[280px] items-center">
          <LoadingSpinner />
        </div>
      ) : !items.length ? (
        <div className="card p-8 sm:p-12 text-center">
          <UtensilsCrossed size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-2">{t('common.noData')}</p>
          {hasFilters && <p className="text-sm text-gray-500">{t('restaurant.noResults')}</p>}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {items.map((item) => (
            <article
              key={item.id}
              className="card overflow-hidden p-0 flex flex-col h-full"
            >
              <div className="relative group h-44 sm:h-48 flex-shrink-0 overflow-hidden bg-gray-100">
                <img
                  src={getFoodImage(item)}
                  alt={getLocalizedText(item.name, currentLanguage)}
                  className="w-full h-full object-cover"
                />
                <Link
                  to={`/food-items/${item.id}`}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition"
                >
                  <span className="text-white font-medium text-sm">{t('common.view')}</span>
                </Link>
              </div>
              <div className="p-4 sm:p-5 flex flex-col flex-1 min-w-0">
                <h2 className="text-lg font-bold text-gray-900 mb-1 truncate">
                  <Link to={`/food-items/${item.id}`} className="hover:text-primary-600">
                    {getLocalizedText(item.name, currentLanguage) || t('common.noData')}
                  </Link>
                </h2>
                {(() => {
                  const restaurant = getRestaurantFromItem(item)
                  const restaurantName = restaurant && typeof restaurant === 'object' ? toDisplayText(restaurant.name) : null
                  const restaurantId = restaurant ? getRestaurantId(restaurant) : null
                  if (!restaurantName) return null
                  return (
                    <p className="flex items-center gap-1.5 text-xs text-gray-500 mb-2 min-w-0">
                      <Store size={12} className="flex-shrink-0 text-gray-400" />
                      <span className="truncate">
                        {restaurantId ? (
                          <Link to={`/restaurants/${restaurantId}`} className="hover:text-primary-600">
                            {restaurantName}
                          </Link>
                        ) : (
                          restaurantName
                        )}
                      </span>
                    </p>
                  )
                })()}
                <div className="flex flex-wrap items-center gap-3 text-sm mb-3">
                  <span className="font-semibold text-primary-600">
                    {formatCurrency(item.price ?? 0, item.currency_code ?? 'VND')}
                  </span>
                  {(item.category?.name || item.food_category?.name) && (
                    <span className="text-gray-500 truncate">
                      {getLocalizedText(item.category?.name ?? item.food_category?.name, currentLanguage)}
                    </span>
                  )}
                  {item.rating != null && (
                    <span className="flex items-center gap-1 text-gray-500">
                      <Star size={14} className="text-amber-500" />
                      {Number(item.rating).toFixed(1)}
                    </span>
                  )}
                </div>
                <div className="pt-3 border-t border-gray-100">
                  <Link to={`/food-items/${item.id}`} className="btn btn-primary w-full sm:w-auto text-sm">
                    {t('common.view')}
                  </Link>
                </div>
              </div>
            </article>
            ))}
          </div>

          {showPagination && (
            <nav
              className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 pt-6"
              aria-label="Pagination"
            >
              <p className="text-sm text-gray-600 order-2 sm:order-1">
                {t('common.showing')} <span className="font-medium">{from}</span>-<span className="font-medium">{to}</span>{' '}
                {t('common.of')} <span className="font-medium">{safeTotal}</span>
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
    </div>
  )
}

export default FoodListPage
