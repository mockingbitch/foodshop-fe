import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '@context/LanguageContext'
import { restaurantApi } from '@services/api/restaurantApi'
import LoadingSpinner from '@components/common/LoadingSpinner'
import { Search, Store, MapPin, Star, ChevronRight, ChevronLeft } from 'lucide-react'

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

const getRestaurantImage = (restaurant) => {
  const img =
    restaurant?.outside_image_1 ??
    restaurant?.images?.[0]?.url ??
    restaurant?.outside_images?.[0]?.url ??
    restaurant?.image_url
  return img || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'
}

const ensureArray = (value) => {
  if (Array.isArray(value)) return value
  if (!value || typeof value !== 'object') return []
  const raw = value.data ?? value.restaurants ?? value.items ?? value.results ?? value.list
  if (Array.isArray(raw)) return raw
  if (raw && typeof raw === 'object') {
    const nested = raw.data ?? raw.restaurants ?? raw.items ?? raw.results ?? raw.list
    return Array.isArray(nested) ? nested : []
  }
  return []
}

const HomePage = () => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    restaurantApi
      .getRestaurants({ per_page: 24 })
      .then((res) => {
        const list = ensureArray(res?.data)
        setRestaurants(Array.isArray(list) ? list : [])
      })
      .catch(() => setRestaurants([]))
      .finally(() => setLoading(false))
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    const q = searchQuery?.trim()
    if (q) navigate(`/restaurants?search=${encodeURIComponent(q)}`)
    else navigate('/restaurants')
  }

  const getRatingWidth = (rating) => (!rating ? '0%' : `${(Number(rating) / 5) * 100}%`)

  const popularRestaurants = restaurants.slice(0, 10)
  const moreRestaurants = restaurants.slice(10, 22)

  const HorizontalSection = ({ title, list }) => {
    const scrollRef = useRef(null)
    const scroll = (dir) => {
      if (!scrollRef.current) return
      const step = 320
      scrollRef.current.scrollBy({ left: dir * step, behavior: 'smooth' })
    }
    if (!list.length) return null
    return (
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <Link
            to="/restaurants"
            className="text-primary-600 hover:text-primary-700 font-medium text-sm inline-flex items-center gap-1"
          >
            {t('common.view')} {t('common.all')}
            <ChevronRight size={18} />
          </Link>
        </div>
        <div className="relative group/section">
          <button
            type="button"
            onClick={() => scroll(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center opacity-0 group-hover/section:opacity-100 transition hover:bg-gray-50 -translate-x-1"
            aria-label="Previous"
          >
            <ChevronLeft size={20} />
          </button>
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-2 scroll-smooth scrollbar-thin"
            style={{ scrollbarWidth: 'thin' }}
          >
            {list.map((restaurant, idx) => (
              <Link
                key={getRestaurantId(restaurant) ?? idx}
                to={`/restaurants/${getRestaurantId(restaurant)}`}
                className="flex-shrink-0 w-[280px] sm:w-[300px] rounded-xl overflow-hidden bg-white border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={getRestaurantImage(restaurant)}
                    alt={toDisplayText(restaurant.name)}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  {(restaurant.rating >= 4.5 || restaurant.review_count > 50) && (
                    <span className="absolute top-2 left-2 px-2 py-1 rounded-md bg-white/95 text-xs font-medium text-gray-700 shadow-sm">
                      {t('restaurant.bestSellers')}
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {toDisplayText(restaurant.name) || t('common.noData')}
                  </h3>
                  {restaurant.address && (
                    <p className="flex items-center gap-1 text-xs text-gray-500 mt-0.5 truncate">
                      <MapPin size={12} className="flex-shrink-0" />
                      {restaurant.address}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-sm">
                    {restaurant.rating != null && (
                      <span className="flex items-center gap-1 font-medium">
                        <Star size={14} className="text-amber-500 fill-amber-500" />
                        {Number(restaurant.rating).toFixed(1)}
                      </span>
                    )}
                    {(restaurant.review_count ?? restaurant.reviews_count) != null && (
                      <span className="text-gray-400">
                        · {restaurant.review_count ?? restaurant.reviews_count} {t('restaurant.reviews')}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <button
            type="button"
            onClick={() => scroll(1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center opacity-0 group-hover/section:opacity-100 transition hover:bg-gray-50 translate-x-1"
            aria-label="Next"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </section>
    )
  }

  return (
    <div className="min-h-[70vh]">
      {/* Search bar - on top */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="container-custom py-6 sm:py-8">
          <form
            onSubmit={handleSearch}
            className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-2 sm:gap-0 bg-white rounded-full shadow-md shadow-gray-200/50 border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="flex-1 flex items-center gap-3 px-5 py-3 sm:py-4">
              <Search size={20} className="text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('restaurant.search')}
                className="flex-1 min-w-0 border-0 focus:ring-0 focus:outline-none text-gray-900 placeholder-gray-400"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 sm:py-4 bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm sm:text-base transition flex items-center justify-center gap-2 shrink-0"
            >
              <Search size={18} />
              {t('common.search')}
            </button>
          </form>
        </div>
      </div>

      {/* Content */}
      <div className="container-custom py-8 sm:py-10">
        {loading ? (
          <div className="flex justify-center min-h-[320px] items-center">
            <LoadingSpinner />
          </div>
        ) : !restaurants.length ? (
          <div className="card p-12 text-center">
            <Store size={56} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 mb-2">{t('common.noData')}</p>
            <Link to="/restaurants" className="btn btn-primary mt-2">
              {t('restaurant.title')}
            </Link>
          </div>
        ) : (
          <>
            <HorizontalSection
              title={t('restaurant.nearby')}
              list={popularRestaurants}
            />
            {moreRestaurants.length > 0 && (
              <HorizontalSection
                title={t('restaurant.title')}
                list={moreRestaurants}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default HomePage
