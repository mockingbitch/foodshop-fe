import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '@context/LanguageContext'
import { newsApi } from '@services/api/newsApi'
import LoadingSpinner from '@components/common/LoadingSpinner'
import { stripHtml } from '@utils/helpers'
import { NEWS_TYPES } from '@constants'
import { ChevronRight, ChevronLeft, Newspaper, Search } from 'lucide-react'

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
  const raw = value.data ?? value.items ?? value.results ?? value.list ?? value.news
  if (Array.isArray(raw)) return raw
  if (raw && typeof raw === 'object') {
    const nested = raw.data ?? raw.items ?? raw.results ?? raw.list ?? raw.news
    return Array.isArray(nested) ? nested : []
  }
  return []
}

const getNewsId = (item) => item?.id
const getNewsImage = (item) =>
  item?.featured_image ?? item?.image ?? item?.featured_image_url ?? item?.images?.[0]?.url ?? null

const NEWS_TYPE_OPTIONS = [
  { value: '', labelKey: 'common.all' },
  { value: NEWS_TYPES.NEWS, labelKey: 'common.news' },
  { value: NEWS_TYPES.COURSE, labelKey: 'common.courses' },
  { value: NEWS_TYPES.CHEF, labelKey: 'common.chefs' },
]

const NewsListPage = () => {
  const { t } = useLanguage()
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0, perPage: PER_PAGE })
  const [selectedType, setSelectedType] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    setLoading(true)
    const params = { per_page: PER_PAGE, page }
    if (selectedType) params.type = selectedType
    if (searchQuery?.trim()) params.search = searchQuery.trim()
    newsApi
      .getNews(params)
      .then((res) => {
        const list = ensureArray(res?.data)
        setNews(Array.isArray(list) ? list : [])
        setPagination(getPaginationMeta(res, Array.isArray(list) ? list.length : 0))
      })
      .catch(() => {
        setNews([])
        setPagination({ currentPage: 1, lastPage: 1, total: 0, perPage: PER_PAGE })
      })
      .finally(() => setLoading(false))
  }, [selectedType, searchQuery, page])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setSearchQuery(searchInput)
    setPage(1)
  }

  const handleCategoryChange = (type) => {
    setSelectedType(type)
    setPage(1)
  }

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
        <span className="text-gray-700">{t('common.news')}</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">{t('common.news')}</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar: category + search */}
        <aside className="lg:w-56 xl:w-64 flex-shrink-0">
          <div className="card p-4">
            <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-3">
              {t('common.categories')}
            </h2>
            <nav className="flex flex-col gap-1">
              {NEWS_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value || 'all'}
                  type="button"
                  onClick={() => handleCategoryChange(opt.value)}
                  className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition ${
                    selectedType === opt.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t(opt.labelKey)}
                </button>
              ))}
            </nav>
          </div>
          <div className="card p-4 mt-4">
            <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-3">
              {t('common.search')}
            </h2>
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1 min-w-0">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={t('common.search')}
                  className="input pl-9 py-2 text-sm w-full"
                />
              </div>
              <button type="submit" className="btn btn-primary py-2 px-3 text-sm shrink-0">
                {t('common.search')}
              </button>
            </form>
          </div>
        </aside>

        {/* List news */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="flex justify-center min-h-[320px] items-center">
              <LoadingSpinner />
            </div>
          ) : news.length === 0 ? (
            <div className="card p-12 text-center">
              <Newspaper size={56} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600 mb-2">{t('common.noData')}</p>
              <p className="text-sm text-gray-500">{t('common.news')}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-6">
                {news.map((item, idx) => (
                  <Link
                    key={getNewsId(item) ?? idx}
                    to={`/news/${getNewsId(item)}`}
                    className="card overflow-hidden p-0 flex flex-col h-full border border-gray-100 hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-[16/10] flex-shrink-0 bg-gray-100 overflow-hidden">
                      {getNewsImage(item) ? (
                        <img
                          src={getNewsImage(item)}
                          alt={toDisplayText(item.title)}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Newspaper size={48} />
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-1 min-w-0">
                      <h2 className="font-semibold text-gray-900 line-clamp-2 mb-1">
                        {toDisplayText(item.title) || t('common.noData')}
                      </h2>
                      {(toDisplayText(item.excerpt) || toDisplayText(item.content)) && (
                        <p className="text-sm text-gray-500 line-clamp-2 flex-1">
                          {stripHtml(toDisplayText(item.excerpt) || toDisplayText(item.content)) || '—'}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>

              {showPagination && (
                <nav
                  className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 pt-6"
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
      </div>
    </div>
  )
}

export default NewsListPage
