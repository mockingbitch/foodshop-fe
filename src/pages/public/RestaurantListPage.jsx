import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useLanguage } from '@context/LanguageContext'
import { restaurantApi } from '@services/api/restaurantApi'
import { SEARCH_RADIUS_KM } from '@constants'
import { commonApi } from '@services/api/commonApi'
import LoadingSpinner from '@components/common/LoadingSpinner'
import { Store, MapPin, Star, Filter, X, ChevronLeft, ChevronRight, Navigation, Search, Globe, UtensilsCrossed, Truck } from 'lucide-react'

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

const getRestaurantId = (r) => r?.id ?? r?.restaurant_id

/** Hiển thị tên đa ngôn ngữ (country/restaurant type) */
const toDisplayName = (name, getMultilingualContent) => {
  if (name == null) return ''
  if (typeof name === 'string') return name
  if (typeof name === 'object') {
    const fromContext = getMultilingualContent?.(name)
    if (fromContext) return fromContext
    const v = name.vn ?? name.vi ?? name.kr ?? name.ko ?? name.en
    if (typeof v === 'string') return v
    const first = Object.values(name).find((x) => typeof x === 'string')
    return first ?? ''
  }
  return String(name)
}

const getRestaurantImage = (restaurant) => {
  const img =
    restaurant.main_image ??
    restaurant.outside_image_1 ??
    restaurant.images?.[0]?.url ??
    restaurant.outside_images?.[0]?.url ??
    restaurant.image_url
  return img || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'
}

const ensureArray = (value) => {
  if (Array.isArray(value)) return value
  if (!value || typeof value !== 'object') return []
  const raw =
    value.data ??
    value.restaurants ??
    value.items ??
    value.results ??
    value.list
  if (Array.isArray(raw)) return raw
  if (raw && typeof raw === 'object') {
    const nested = raw.data ?? raw.restaurants ?? raw.items ?? raw.results ?? raw.list
    return Array.isArray(nested) ? nested : []
  }
  return []
}

const DEBOUNCE_MS = 350

const RestaurantListPage = () => {
  const [searchParams] = useSearchParams()
  const { t, getMultilingualContent } = useLanguage()
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') ?? '')
  const [countryId, setCountryId] = useState('')
  const [restaurantTypeId, setRestaurantTypeId] = useState('')
  const [deliveryOnly, setDeliveryOnly] = useState(false)
  const [countries, setCountries] = useState([])
  const [restaurantTypes, setRestaurantTypes] = useState([])
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0, perPage: PER_PAGE })
  const [nearbyMode, setNearbyMode] = useState(false)
  const [nearbyIntent, setNearbyIntent] = useState(false)
  const [userLat, setUserLat] = useState(null)
  const [userLng, setUserLng] = useState(null)
  const [locationError, setLocationError] = useState(null)
  const [gettingLocation, setGettingLocation] = useState(false)

  useEffect(() => {
    Promise.all([commonApi.getCountries(), commonApi.getRestaurantTypes()])
      .then(([countriesRes, typesRes]) => {
        const countryList = Array.isArray(countriesRes?.data) ? countriesRes.data : (countriesRes?.data?.data ?? countriesRes?.data?.countries ?? [])
        const typeList = Array.isArray(typesRes?.data) ? typesRes.data : (typesRes?.data?.data ?? typesRes?.data ?? [])
        setCountries(Array.isArray(countryList) ? countryList : [])
        setRestaurantTypes(Array.isArray(typeList) ? typeList : [])
      })
      .catch(() => {
        setCountries([])
        setRestaurantTypes([])
      })
  }, [])

  const fetchRestaurants = useCallback(
    async (filters, pageNum = 1) => {
      setLoading(true)
      setLocationError(null)
      try {
        const params = { per_page: PER_PAGE, page: pageNum }
        if (filters.search?.trim()) params.search = filters.search.trim()
        if (filters.country_id) params.country_id = Number(filters.country_id)
        if (filters.restaurant_type_id) params.restaurant_type_id = Number(filters.restaurant_type_id)
        if (filters.delivery_available === true) params.delivery_available = true
        if (filters.nearbyMode && filters.lat != null && filters.lng != null) {
          params.lat = filters.lat
          params.lng = filters.lng
          params.radius = SEARCH_RADIUS_KM
        }
        const res = await restaurantApi.getRestaurants(params)
        const list = ensureArray(res?.data)
        const arr = Array.isArray(list) ? list : []
        setRestaurants(arr)
        setPagination(getPaginationMeta(res, arr.length))
      } catch (err) {
        console.error(err)
        setRestaurants([])
        setPagination({ currentPage: 1, lastPage: 1, total: 0, perPage: PER_PAGE })
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const handleFindNearby = () => {
    if (!navigator.geolocation) {
      setLocationError(t('restaurant.locationRequired'))
      return
    }
    setGettingLocation(true)
    setLocationError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude)
        setUserLng(pos.coords.longitude)
        setNearbyMode(true)
        setNearbyIntent(false)
        setPage(1)
        setGettingLocation(false)
      },
      (err) => {
        setGettingLocation(false)
        setNearbyIntent(false)
        if (err.code === 1) { // PERMISSION_DENIED
          setLocationError(t('restaurant.locationDenied'))
        } else {
          setLocationError(t('restaurant.locationError'))
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }

  const handleNearbyChange = (e) => {
    if (e.target.checked) {
      setNearbyIntent(true)
      handleFindNearby()
    } else {
      setNearbyMode(false)
      setNearbyIntent(false)
      setUserLat(null)
      setUserLng(null)
      setLocationError(null)
      setPage(1)
    }
  }

  useEffect(() => {
    setPage(1)
  }, [searchQuery, countryId, restaurantTypeId, deliveryOnly, nearbyMode])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRestaurants(
        {
          search: searchQuery,
          country_id: countryId || undefined,
          restaurant_type_id: restaurantTypeId || undefined,
          delivery_available: deliveryOnly || undefined,
          nearbyMode,
          lat: userLat,
          lng: userLng,
        },
        page
      )
    }, DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [searchQuery, countryId, restaurantTypeId, deliveryOnly, nearbyMode, userLat, userLng, page, fetchRestaurants])

  const hasActiveFilters = searchQuery.trim() || countryId || restaurantTypeId || deliveryOnly || nearbyMode
  const clearFilters = () => {
    setSearchQuery('')
    setCountryId('')
    setRestaurantTypeId('')
    setDeliveryOnly(false)
    setNearbyMode(false)
    setNearbyIntent(false)
    setUserLat(null)
    setUserLng(null)
    setLocationError(null)
  }

  const getRatingWidth = (rating) => (!rating ? '0%' : `${(rating / 5) * 100}%`)

  const showPagination = pagination.total > PER_PAGE
  const from = Math.min((pagination.currentPage - 1) * pagination.perPage + 1, pagination.total)
  const to = Math.min(pagination.currentPage * pagination.perPage, pagination.total)
  const currentPage = pagination.currentPage
  const lastPage = pagination.lastPage

  return (
    <div className="container-custom py-8 sm:py-12">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{t('restaurant.title')}</h1>
        <p className="text-gray-600 text-sm sm:text-base">{t('restaurant.search')}</p>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 sm:mb-8 space-y-4">
        {/* Search bar - prominent */}
        <div className="relative group">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('restaurant.search')}
            className="input w-full pl-12 pr-12 py-3.5 text-base rounded-xl border-gray-200 bg-white shadow-sm hover:shadow-md focus:shadow-md transition-shadow placeholder:text-gray-400"
            aria-label={t('restaurant.search')}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Clear search"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Filter card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4">
              <div className="flex items-center gap-2 text-gray-700">
                <Filter size={18} className="text-primary-500" />
                <span className="text-sm font-medium">{t('common.filter')}</span>
              </div>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-primary-600 hover:bg-primary-50 transition-colors"
                >
                  <X size={14} />
                  {t('common.clearFilters')}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Country */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <Globe size={16} className="text-gray-400" />
                  {t('restaurant.filterCountry')}
                </label>
                <select
                  value={countryId}
                  onChange={(e) => setCountryId(e.target.value)}
                  className="input w-full py-2.5 rounded-lg border-gray-200 focus:border-primary-400"
                  aria-label={t('restaurant.filterCountry')}
                >
                  <option value="">{t('common.all')}</option>
                  {countries.map((c) => (
                    <option key={c.id} value={c.id}>
                      {toDisplayName(c.name, getMultilingualContent) || c.name_en || c.code || c.id}
                    </option>
                  ))}
                </select>
              </div>

              {/* Restaurant type */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <UtensilsCrossed size={16} className="text-gray-400" />
                  {t('restaurant.filterType')}
                </label>
                <select
                  value={restaurantTypeId}
                  onChange={(e) => setRestaurantTypeId(e.target.value)}
                  className="input w-full py-2.5 rounded-lg border-gray-200 focus:border-primary-400"
                  aria-label={t('restaurant.filterType')}
                >
                  <option value="">{t('common.all')}</option>
                  {restaurantTypes.map((rt) => (
                    <option key={rt.id} value={rt.id}>
                      {toDisplayName(rt.name, getMultilingualContent) || rt.name_en || rt.type || rt.id}
                    </option>
                  ))}
                </select>
              </div>

              {/* Delivery */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <Truck size={16} className="text-gray-400" />
                  {t('restaurant.deliveryOnly')}
                </label>
                <label className="flex items-center gap-2 cursor-pointer h-[42px]">
                  <input
                    type="checkbox"
                    checked={deliveryOnly}
                    onChange={(e) => setDeliveryOnly(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">{t('restaurant.deliveryOnly')}</span>
                </label>
              </div>

              {/* Find nearby */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <Navigation size={16} className="text-gray-400" />
                  {t('restaurant.findNearby')}
                </label>
                <label className="flex items-center gap-2 cursor-pointer h-[42px]">
                  <input
                    type="checkbox"
                    checked={nearbyMode || (gettingLocation && nearbyIntent)}
                    onChange={handleNearbyChange}
                    disabled={gettingLocation}
                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 disabled:opacity-50"
                  />
                  <span className="text-sm font-medium text-gray-700">{t('restaurant.findNearby')}</span>
                  {gettingLocation && (
                    <span className="text-xs text-gray-500">({t('common.loading')})</span>
                  )}
                </label>
                {nearbyMode && (
                  <span className="text-xs text-primary-600 font-medium">
                    {t('restaurant.nearby')} ({SEARCH_RADIUS_KM}km)
                  </span>
                )}
                {locationError && (
                  <p className="text-xs text-red-600">{locationError}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center min-h-[280px] items-center">
          <LoadingSpinner />
        </div>
      ) : !restaurants.length ? (
        <div className="card p-8 sm:p-12 text-center">
          <Store size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-2">{t('common.noData')}</p>
          <p className="text-sm text-gray-500">
            {hasActiveFilters ? t('restaurant.noResults') : null}
          </p>
        </div>
      ) : (
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {restaurants.map((restaurant, idx) => (
            <article
              key={getRestaurantId(restaurant) ?? idx}
              className="card overflow-hidden p-0 flex flex-col h-full"
            >
              <div className="relative group aspect-square flex-shrink-0 rounded-t-xl overflow-hidden">
                <img
                  src={getRestaurantImage(restaurant)}
                  alt={toDisplayText(restaurant.name)}
                  className="w-full h-full object-cover"
                />
                <Link
                  to={`/restaurants/${getRestaurantId(restaurant)}`}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition"
                >
                  <span className="text-white font-medium text-sm">{t('common.view')}</span>
                </Link>
              </div>
              <div className="p-4 sm:p-5 flex flex-col flex-1 min-w-0">
                <h2 className="text-lg font-bold text-gray-900 mb-1 truncate">
                  <Link
                    to={`/restaurants/${getRestaurantId(restaurant)}`}
                    className="hover:text-primary-600"
                  >
                    {toDisplayText(restaurant.name) || t('common.noData')}
                  </Link>
                </h2>
                <p className="text-gray-600 text-sm line-clamp-2 mb-3 flex-1">
                  {toDisplayText(restaurant.description) || '—'}
                </p>
                <div className="space-y-1.5 text-xs sm:text-sm text-gray-500">
                  {restaurant.address && (
                    <p className="flex items-start gap-1.5 min-w-0">
                      <MapPin size={14} className="flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{restaurant.address}</span>
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-3">
                    {restaurant.rating != null && (
                      <span className="flex items-center gap-1">
                        <span className="inline-block w-12 h-1.5 bg-gray-200 rounded overflow-hidden">
                          <span
                            className="block h-full bg-primary-500 rounded"
                            style={{ width: getRatingWidth(restaurant.rating) }}
                          />
                        </span>
                        <Star size={14} className="text-amber-500 flex-shrink-0" />
                        <span>{Number(restaurant.rating).toFixed(1)}</span>
                      </span>
                    )}
                    {(restaurant.review_count ?? restaurant.reviews_count) != null && (
                      <span className="text-gray-400">
                        ({restaurant.review_count ?? restaurant.reviews_count} {t('restaurant.reviews')})
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <Link
                    to={`/restaurants/${getRestaurantId(restaurant)}`}
                    className="btn btn-primary w-full sm:w-auto text-sm"
                  >
                    {t('common.view')}
                  </Link>
                </div>
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
      )}
    </div>
  )
}

export default RestaurantListPage
