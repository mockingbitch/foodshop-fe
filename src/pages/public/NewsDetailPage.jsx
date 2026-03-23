import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useLanguage } from '@context/LanguageContext'
import { newsApi } from '@services/api/newsApi'
import { restaurantApi } from '@services/api/restaurantApi'
import LoadingSpinner from '@components/common/LoadingSpinner'
import { formatDate } from '@utils/helpers'
import { ChevronRight, Newspaper, MapPin, Star } from 'lucide-react'

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

const getNewsImage = (item) =>
  item?.featured_image ?? item?.image ?? item?.featured_image_url ?? item?.images?.[0]?.url ?? null

const ensureArray = (value) => {
  if (Array.isArray(value)) return value
  if (!value || typeof value !== 'object') return []
  const raw = value.data ?? value.items ?? value.results ?? value.list ?? value.news
  if (Array.isArray(raw)) return raw
  if (raw && typeof raw === 'object') {
    const nested = raw.data ?? raw.items ?? raw.results ?? raw.list ?? raw.news
    return Array.isArray(nested) ? nested : []
  }
  return []
}

const ensureRestaurantsArray = (value) => {
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

const getRestaurantId = (r) => r?.id ?? r?.restaurant_id

const getRestaurantImage = (restaurant) => {
  const img =
    restaurant?.main_image ??
    restaurant?.outside_image_1 ??
    restaurant?.images?.[0]?.url ??
    restaurant?.outside_images?.[0]?.url ??
    restaurant?.image_url
  return img || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'
}

const NewsDetailPage = () => {
  const { id } = useParams()
  const { t } = useLanguage()
  const [news, setNews] = useState(null)
  const [latestNews, setLatestNews] = useState([])
  const [restaurants, setRestaurants] = useState([])
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
      newsApi.getNewsById(id),
      newsApi.getNews({ per_page: 5 }),
      restaurantApi.getRestaurants({ per_page: 5 }),
    ])
      .then(([detailRes, listRes, restRes]) => {
        const raw = detailRes?.data ?? detailRes
        const item = raw?.data ?? raw?.news ?? raw?.result ?? raw
        if (item && typeof item === 'object' && !Array.isArray(item)) {
          setNews(item)
        } else {
          setNotFound(true)
        }

        const listRaw = listRes?.data ?? listRes
        const list = ensureArray(listRaw)
        const filtered = (Array.isArray(list) ? list : []).filter((x) => String(x?.id ?? '') !== String(id))
        setLatestNews(filtered.slice(0, 5))

        const restList = ensureRestaurantsArray(restRes?.data ?? restRes)
        setRestaurants(Array.isArray(restList) ? restList.slice(0, 5) : [])
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="container-custom py-12 flex justify-center min-h-[320px] items-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (notFound || !news) {
    return (
      <div className="container-custom py-12">
        <div className="card p-8 text-center">
          <Newspaper size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">{t('common.noData')}</p>
          <Link to="/news" className="btn btn-primary">
            {t('common.news')}
          </Link>
        </div>
      </div>
    )
  }

  const title = toDisplayText(news.title)
  const contentHtml = toDisplayText(news.content)
  const imageUrl = getNewsImage(news)
  const publishedAt = news.published_at ?? news.created_at ?? news.date

  return (
    <div className="container-custom py-8 sm:py-12">
      <nav className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 mb-6 flex-wrap">
        <Link to="/" className="hover:text-primary-600">{t('common.home')}</Link>
        <ChevronRight size={14} className="flex-shrink-0" />
        <Link to="/news" className="hover:text-primary-600">{t('common.news')}</Link>
        <ChevronRight size={14} className="flex-shrink-0" />
        <span className="text-gray-700 truncate max-w-[200px] sm:max-w-none">{title || t('common.news')}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-6 items-start">
        {/* Left column: detail */}
        <article className="card p-0 overflow-visible">
          {imageUrl && (
            <div className="w-full aspect-[16/10] sm:aspect-[21/9] bg-gray-100 overflow-hidden rounded-t-xl">
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-6 sm:p-8 w-full min-w-0 overflow-visible box-border">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 break-words">
              {title || t('common.noData')}
            </h1>
            {publishedAt && (
              <p className="text-sm text-gray-500 mb-6">
                {formatDate(publishedAt, 'PPP')}
              </p>
            )}
            {toDisplayText(news.excerpt) && !contentHtml && (
              <p className="text-gray-600 mb-6">{toDisplayText(news.excerpt)}</p>
            )}
            {contentHtml ? (
              <div
                className="content-html w-full min-w-0 overflow-visible"
                style={{ wordBreak: 'normal', overflowWrap: 'break-word' }}
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />
            ) : toDisplayText(news.excerpt) ? (
              <p className="text-gray-600">{toDisplayText(news.excerpt)}</p>
            ) : null}
          </div>
        </article>

        {/* Right column: latest 5 news + restaurants */}
        <aside className="lg:sticky lg:top-20">
          <div className="card p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                {t('common.news')}
              </h2>
              <Link to="/news" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                {t('common.view')} {t('common.all')}
              </Link>
            </div>
            <div className="space-y-3">
              {latestNews.slice(0, 5).map((item) => {
                const itemTitle = toDisplayText(item?.title) || t('common.noData')
                const itemImage = getNewsImage(item)
                const date = item?.published_at ?? item?.created_at ?? item?.date
                return (
                  <Link
                    key={item?.id}
                    to={`/news/${item?.id}`}
                    className="flex gap-3 p-2 rounded-lg hover:bg-gray-50 transition min-w-0"
                  >
                    <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                      {itemImage ? (
                        <img src={itemImage} alt={itemTitle} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Newspaper size={22} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-gray-900 line-clamp-2">
                        {itemTitle}
                      </div>
                      {date && (
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(date, 'PPP')}
                        </div>
                      )}
                    </div>
                  </Link>
                )
              })}
              {latestNews.length === 0 && (
                <p className="text-sm text-gray-500">{t('common.noData')}</p>
              )}
            </div>
          </div>

          {/* Khối nhà hàng - 5 nhà hàng */}
          <div className="card p-4 sm:p-5 mt-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                {t('common.restaurants')}
              </h2>
              <Link to="/restaurants" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                {t('common.view')} {t('common.all')}
              </Link>
            </div>
            <div className="space-y-3">
              {restaurants.slice(0, 5).map((restaurant, idx) => {
                const restName = toDisplayText(restaurant?.name) || t('common.noData')
                const restImage = getRestaurantImage(restaurant)
                return (
                  <Link
                    key={getRestaurantId(restaurant) ?? idx}
                    to={`/restaurants/${getRestaurantId(restaurant)}`}
                    className="flex gap-3 p-2 rounded-lg hover:bg-gray-50 transition min-w-0"
                  >
                    <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                      <img src={restImage} alt={restName} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-gray-900 line-clamp-2">
                        {restName}
                      </div>
                      {restaurant.address && (
                        <p className="flex items-center gap-1 text-xs text-gray-500 mt-0.5 truncate">
                          <MapPin size={12} className="flex-shrink-0" />
                          {restaurant.address}
                        </p>
                      )}
                      {restaurant.rating != null && (
                        <div className="flex items-center gap-1 mt-1 text-xs">
                          <Star size={12} className="text-amber-500 fill-amber-500 flex-shrink-0" />
                          <span>{Number(restaurant.rating).toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                )
              })}
              {restaurants.length === 0 && (
                <p className="text-sm text-gray-500">{t('common.noData')}</p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default NewsDetailPage
