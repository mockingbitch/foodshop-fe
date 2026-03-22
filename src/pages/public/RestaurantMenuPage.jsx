import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useLanguage } from '@context/LanguageContext'
import { restaurantApi } from '@services/api/restaurantApi'
import { foodApi } from '@services/api/foodApi'
import LoadingSpinner from '@components/common/LoadingSpinner'
import { formatCurrency, getImageUrl, stripHtml, getLocalizedText } from '@utils/helpers'
import { DEFAULT_FOOD_IMAGE } from '@constants'
import { UtensilsCrossed, Store, ChevronRight, LayoutList, LayoutGrid, X, Star, Leaf } from 'lucide-react'

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
  const raw = value.data ?? value.menus ?? value.items ?? value.categories ?? value.food_items ?? value.list
  if (Array.isArray(raw)) return raw
  if (raw && typeof raw === 'object') {
    const nested = raw.data ?? raw.menus ?? raw.items ?? raw.categories ?? raw.food_items
    return Array.isArray(nested) ? nested : []
  }
  return []
}

const getItemPrice = (item) => item?.price ?? item?.unit_price ?? 0
const getItemCurrency = (item) => item?.currency_code ?? item?.currency ?? 'VND'

const getFoodImage = (item) => {
  const path = item?.main_image ?? item?.image_url ?? item?.images?.[0]?.url ?? null
  if (!path) return DEFAULT_FOOD_IMAGE
  if (typeof path === 'string' && (path.startsWith('http') || path.startsWith('/'))) return path
  return getImageUrl(path)
}

const RestaurantMenuPage = () => {
  const { id } = useParams()
  const { t, currentLanguage } = useLanguage()
  const [restaurant, setRestaurant] = useState(null)
  const [menus, setMenus] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
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
      foodApi.getFoodItems({ restaurant_id: id, per_page: 100 }),
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
        if (Array.isArray(items) && items.length > 0) {
          setMenus([
            {
              id: 'menu',
              name: null,
              categories: [{ id: 'all', name: null, items }],
            },
          ])
        } else {
          setMenus([])
        }
      })
      .catch(() => {
        setRestaurant(null)
        setMenus([])
        setNotFound(true)
      })
      .finally(() => setLoading(false))
  }, [id])

  const getMenuSections = (menu) => {
    const categories = menu?.categories ?? menu?.sections ?? []
    if (Array.isArray(categories) && categories.length > 0) return categories
    const items = menu?.items ?? menu?.food_items ?? menu?.foodItems ?? []
    if (Array.isArray(items) && items.length > 0) return [{ name: null, items }]
    return []
  }

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

  const allMenuItems = menus.flatMap((menu) =>
    getMenuSections(menu).flatMap((s) => s.items ?? s.food_items ?? s.foodItems ?? [])
  )
  const bestSellerItems = allMenuItems.filter(
    (i) => i.is_best_seller === true || i.is_best_seller === 1
  )

  return (
    <div className="container-custom py-8 sm:py-12">
      <nav className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 mb-6 flex-wrap">
        <Link to="/" className="hover:text-primary-600">{t('common.home')}</Link>
        <ChevronRight size={14} className="flex-shrink-0" />
        <Link to="/restaurants" className="hover:text-primary-600">{t('restaurant.title')}</Link>
        <ChevronRight size={14} className="flex-shrink-0" />
        <Link to={`/restaurants/${id}`} className="hover:text-primary-600 truncate max-w-[120px] sm:max-w-[200px]">
          {restaurantName || t('restaurant.detail')}
        </Link>
        <ChevronRight size={14} className="flex-shrink-0" />
        <span className="text-gray-700">{t('restaurant.menu')}</span>
      </nav>

      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
            {restaurantName || t('restaurant.detail')}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">{t('restaurant.menu')}</p>
        </div>
        {menus.length > 0 && (
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

      {/* Best sellers section (mục riêng) */}
      {bestSellerItems.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t('restaurant.bestSellers')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {bestSellerItems.map((item, itemIdx) => (
              <article
                key={item.id ?? itemIdx}
                role="button"
                tabIndex={0}
                onClick={() => setPreviewFood(item)}
                onKeyDown={(e) => e.key === 'Enter' && setPreviewFood(item)}
                className="card overflow-hidden p-0 flex flex-col h-full cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="h-44 sm:h-48 flex-shrink-0 overflow-hidden bg-gray-100">
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
                  <p className="text-primary-600 font-medium text-sm">
                    {formatCurrency(getItemPrice(item), getItemCurrency(item))}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {menus.length === 0 ? (
        <div className="card p-8 sm:p-12 text-center">
          <UtensilsCrossed size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-2">{t('common.noData')}</p>
          <p className="text-sm text-gray-500 mb-4">{t('restaurant.menu')}</p>
          <Link to={`/restaurants/${id}`} className="btn btn-outline">
            {t('restaurant.detail')}
          </Link>
        </div>
      ) : viewMode === 'grid' ? (
        <>
        <h2 className="text-xl font-bold text-gray-900 mb-4">{t('restaurant.menu')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {allMenuItems.map((item, itemIdx) => (
            <article
              key={item.id ?? itemIdx}
              role="button"
              tabIndex={0}
              onClick={() => setPreviewFood(item)}
              onKeyDown={(e) => e.key === 'Enter' && setPreviewFood(item)}
              className="card overflow-hidden p-0 flex flex-col h-full cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div className="h-44 sm:h-48 flex-shrink-0 overflow-hidden bg-gray-100">
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
                <p className="text-primary-600 font-medium text-sm">
                  {formatCurrency(getItemPrice(item), getItemCurrency(item))}
                </p>
              </div>
            </article>
          ))}
        </div>
        </>
      ) : (
        <>
        <div className="space-y-8">
          {menus.map((menu, menuIdx) => {
            const sections = getMenuSections(menu)
            const menuName = toDisplayText(menu.name)
            return (
              <section key={menu.id ?? menuIdx} className="card p-4 sm:p-6">
                {menuName && (
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    {menuName}
                  </h2>
                )}
                <div className="space-y-6">
                  {sections.map((section, sectionIdx) => {
                    const sectionName = toDisplayText(section.name)
                    const items = section.items ?? section.food_items ?? section.foodItems ?? []
                    if (items.length === 0) return null
                    return (
                      <div key={section.id ?? sectionIdx}>
                        {sectionName && (
                          <h3 className="text-base font-medium text-gray-800 mb-3">{sectionName}</h3>
                        )}
                        <ul className="space-y-3">
                          {items.map((item, itemIdx) => (
                            <li
                              key={item.id ?? itemIdx}
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
                              </div>
                              <div className="flex-shrink-0 text-primary-600 font-semibold">
                                {formatCurrency(getItemPrice(item), getItemCurrency(item))}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
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
            className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] min-h-0 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-[min(42vh,300px)] max-h-[min(42vh,300px)] flex-shrink-0 overflow-hidden bg-gray-100 rounded-t-xl">
              <img
                src={getFoodImage(previewFood)}
                alt={toDisplayText(previewFood.name)}
                className="absolute inset-0 h-full w-full object-cover object-center"
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
                    {t('food.vegetarian')}
                  </span>
                )}
              </div>
              {(getLocalizedText(previewFood.food_category?.name ?? previewFood.category?.name, currentLanguage)) && (
                <p className="text-sm text-gray-600 mb-3">
                  <span className="font-medium text-gray-500">{t('food.category')}: </span>
                  {getLocalizedText(previewFood.food_category?.name ?? previewFood.category?.name, currentLanguage)}
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

      <div className="mt-8">
        <Link to={`/restaurants/${id}`} className="btn btn-outline inline-flex items-center gap-2">
          <Store size={18} />
          {t('restaurant.detail')}
        </Link>
      </div>
    </div>
  )
}

export default RestaurantMenuPage
