import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '@context/LanguageContext'
import { foodApi } from '@services/api/foodApi'
import { categoryApi } from '@services/api/categoryApi'
import LoadingSpinner from '@components/common/LoadingSpinner'
import { formatCurrency } from '@utils/helpers'
import { DEFAULT_FOOD_IMAGE } from '@constants'
import { UtensilsCrossed, Star } from 'lucide-react'

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

const DEBOUNCE_MS = 350

const FoodListPage = () => {
  const { t } = useLanguage()
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryId, setCategoryId] = useState('')

  useEffect(() => {
    categoryApi
      .getCategories()
      .then((res) => setCategories(ensureArray(res?.data)))
      .catch(() => setCategories([]))
  }, [])

  const fetchItems = useCallback((search, catId) => {
    setLoading(true)
    const params = { per_page: 50 }
    if (search?.trim()) params.search = search.trim()
    if (catId) params.category_id = Number(catId)
    foodApi
      .getFoodItems(params)
      .then((res) => setItems(ensureArray(res?.data)))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => fetchItems(searchQuery, categoryId), DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [searchQuery, categoryId, fetchItems])

  const getRatingWidth = (rating) => (!rating ? '0%' : `${(rating / 5) * 100}%`)
  const hasFilters = searchQuery.trim() || categoryId

  return (
    <div className="container-custom py-8 sm:py-12">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{t('food.title')}</h1>
        <p className="text-gray-600 text-sm sm:text-base">{t('restaurant.search')}</p>
      </div>

      <div className="card p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <UtensilsCrossed size={18} />
            </span>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('restaurant.search')}
              className="input w-full pl-10 pr-4 py-2.5"
              aria-label={t('restaurant.search')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('food.category')}</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="input w-full py-2.5"
            >
              <option value="">{t('common.all')}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {toDisplayText(c.name) || c.name_en || c.code || c.id}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.map((item, idx) => (
            <article
              key={item.id ?? idx}
              className="card overflow-hidden p-0 flex flex-col h-full"
            >
              <div className="relative group aspect-[16/10] flex-shrink-0">
                <img
                  src={getFoodImage(item)}
                  alt={toDisplayText(item.name)}
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
                    {toDisplayText(item.name) || t('common.noData')}
                  </Link>
                </h2>
                <p className="text-gray-600 text-sm line-clamp-2 mb-3 flex-1">
                  {toDisplayText(item.description) || '—'}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="font-semibold text-primary-600">
                    {formatCurrency(item.price ?? 0, item.currency_code ?? 'VND')}
                  </span>
                  {(item.category?.name || item.food_category?.name) && (
                    <span className="text-gray-500 truncate">
                      {toDisplayText(item.category?.name ?? item.food_category?.name)}
                    </span>
                  )}
                  {item.rating != null && (
                    <span className="flex items-center gap-1 text-gray-500">
                      <Star size={14} className="text-amber-500" />
                      {Number(item.rating).toFixed(1)}
                    </span>
                  )}
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <Link to={`/food-items/${item.id}`} className="btn btn-primary w-full sm:w-auto text-sm">
                    {t('common.view')}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default FoodListPage
