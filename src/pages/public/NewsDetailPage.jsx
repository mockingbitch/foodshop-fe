import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useLanguage } from '@context/LanguageContext'
import { newsApi } from '@services/api/newsApi'
import LoadingSpinner from '@components/common/LoadingSpinner'
import { formatDate } from '@utils/helpers'
import { ChevronRight, Newspaper } from 'lucide-react'

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

const NewsDetailPage = () => {
  const { id } = useParams()
  const { t } = useLanguage()
  const [news, setNews] = useState(null)
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
    newsApi
      .getNewsById(id)
      .then((res) => {
        const raw = res?.data ?? res
        const item = raw?.data ?? raw?.news ?? raw?.result ?? raw
        if (item && typeof item === 'object' && !Array.isArray(item)) {
          setNews(item)
        } else {
          setNotFound(true)
        }
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

      <article className="card overflow-hidden p-0 max-w-4xl mx-auto">
        {imageUrl && (
          <div className="w-full aspect-[16/10] sm:aspect-[21/9] bg-gray-100 overflow-hidden">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
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
              className="content-html"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          ) : toDisplayText(news.excerpt) ? (
            <p className="text-gray-600">{toDisplayText(news.excerpt)}</p>
          ) : null}
        </div>
      </article>
    </div>
  )
}

export default NewsDetailPage
