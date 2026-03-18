import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useLanguage } from '@context/LanguageContext'
import { restaurantApi } from '@services/api/restaurantApi'
import { foodApi } from '@services/api/foodApi'
import LoadingSpinner from '@components/common/LoadingSpinner'
import { formatCurrency, getImageUrl } from '@utils/helpers'
import { DEFAULT_FOOD_IMAGE } from '@constants'
import { Store, MapPin, Star, ChevronRight, Mail, Phone, X, Leaf } from 'lucide-react'

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
    restaurant?.main_image ??
    restaurant?.outside_image_1 ??
    restaurant?.images?.[0]?.url ??
    restaurant?.outside_images?.[0]?.url ??
    restaurant?.image_url
  const raw = img || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'
  return raw.startsWith('http') ? raw : getImageUrl(raw)
}

const resolveImgUrl = (v) => {
  if (!v || typeof v !== 'string') return null
  if (v.startsWith('http')) return v
  return getImageUrl(v)
}

const collectOutsideImages = (r) => {
  const out = []
  if (r?.outside_image_1) out.push(resolveImgUrl(r.outside_image_1) ?? r.outside_image_1)
  if (r?.outside_image_2) out.push(resolveImgUrl(r.outside_image_2) ?? r.outside_image_2)
  const arr = r?.outside_images
  if (Array.isArray(arr)) arr.forEach((item) => { const u = typeof item === 'string' ? resolveImgUrl(item) : (item?.url ?? item?.image_url); if (u) out.push(u) })
  else if (arr?.url) out.push(resolveImgUrl(arr.url) ?? arr.url)
  return out
}

const collectInsideImages = (r) => {
  const out = []
  ;['inside_image_1', 'inside_image_2', 'inside_image_3', 'inside_image_4', 'inside_image_5'].forEach((key) => {
    const v = r?.[key]
    if (v) out.push(resolveImgUrl(v) ?? v)
  })
  const arr = r?.inside_images
  if (Array.isArray(arr)) arr.forEach((item) => { const u = typeof item === 'string' ? resolveImgUrl(item) : (item?.url ?? item?.image_url); if (u) out.push(u) })
  else if (arr?.url) out.push(resolveImgUrl(arr.url) ?? arr.url)
  return out
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

/** Lấy id danh mục món từ item (food_category_id hoặc food_category.id) */
const getCategoryId = (item) =>
  item?.food_category?.id ?? item?.food_category_id ?? item?.category?.id ?? item?.category_id ?? null

/** Lấy tên danh mục hiển thị */
const getCategoryName = (item) =>
  toDisplayText(item?.food_category?.name ?? item?.category?.name) || ''

const RestaurantDetailPage = () => {
  const { id } = useParams()
  const { t } = useLanguage()
  const [restaurant, setRestaurant] = useState(null)
  const [foodItems, setFoodItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [previewFood, setPreviewFood] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState(null)

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
        setFoodItems(Array.isArray(items) ? items : [])
      })
      .catch(() => {
        setRestaurant(null)
        setFoodItems([])
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
  const bestSellerItems = foodItems.filter(
    (i) => i.is_best_seller === true || i.is_best_seller === 1
  )
  // Danh sách category duy nhất từ foodItems (có id + name)
  const categoryMap = new Map()
  foodItems.forEach((item) => {
    const cid = getCategoryId(item)
    if (cid != null && !categoryMap.has(cid)) {
      categoryMap.set(cid, getCategoryName(item) || `Category ${cid}`)
    }
  })
  const categories = [{ id: null, name: t('common.all') }, ...Array.from(categoryMap.entries()).map(([id, name]) => ({ id, name }))]
  const filteredFoodItems =
    selectedCategoryId == null
      ? foodItems
      : foodItems.filter((item) => getCategoryId(item) === selectedCategoryId)

  // Khi filter "Tất cả": nhóm theo category để hiển thị tên category trên mỗi nhóm (thứ tự giữ theo lần xuất hiện)
  const categoryOrder = []
  const categorySeen = new Set()
  foodItems.forEach((item) => {
    const cid = getCategoryId(item)
    if (cid != null && !categorySeen.has(cid)) {
      categorySeen.add(cid)
      categoryOrder.push({ id: cid, name: categoryMap.get(cid) || getCategoryName(item) || `Category ${cid}` })
    }
  })
  const groupedByCategory =
    selectedCategoryId == null && filteredFoodItems.length > 0
      ? (() => {
          const groups = categoryOrder.map(({ id, name }) => ({
            categoryId: id,
            categoryName: name,
            items: filteredFoodItems.filter((item) => getCategoryId(item) === id),
          })).filter((g) => g.items.length > 0)
          const uncategorized = filteredFoodItems.filter((item) => getCategoryId(item) == null)
          if (uncategorized.length > 0) {
            groups.push({ categoryId: null, categoryName: t('food.otherCategory') || 'Other', items: uncategorized })
          }
          return groups
        })()
      : null

  return (
    <div className="container-custom py-8 sm:py-12">
      <nav className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 mb-6 flex-wrap">
        <Link to="/" className="hover:text-primary-600">{t('common.home')}</Link>
        <ChevronRight size={14} className="flex-shrink-0" />
        <Link to="/restaurants" className="hover:text-primary-600">{t('restaurant.title')}</Link>
        <ChevronRight size={14} className="flex-shrink-0" />
        <span className="text-gray-700 truncate max-w-[180px] sm:max-w-none">{restaurantName || t('restaurant.detail')}</span>
      </nav>

      {/* Restaurant info (header) - giữ layout như cũ nhưng gọn hơn */}
      <div className="card overflow-hidden p-0 flex flex-col md:flex-row mb-5">
        <div className="w-full md:w-[28%] flex-shrink-0 bg-gray-100 h-[126px] sm:h-[140px] md:h-[126px]">
          <button
            type="button"
            onClick={() => setPreviewImage(getRestaurantImage(restaurant))}
            className="block w-full"
            aria-label={t('common.view') || 'View'}
          >
            <img
              src={getRestaurantImage(restaurant)}
              alt={restaurantName}
              className="block w-full object-cover"
            />
          </button>
        </div>
        <div className="w-full md:w-[72%] p-3 sm:p-4 flex flex-col">
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
            {restaurantName || t('restaurant.detail')}
          </h1>
          {description && (
            <p className="text-gray-600 leading-relaxed mb-2 line-clamp-1">{description}</p>
          )}
          <div className="space-y-1 text-xs sm:text-sm text-gray-600 mb-2">
            {restaurant.address && (
              <p className="flex items-start gap-2 min-w-0">
                <MapPin size={14} className="flex-shrink-0 mt-0.5 text-gray-500" />
                <span className="break-words">{restaurant.address}{restaurant.city ? `, ${restaurant.city}` : ''}</span>
              </p>
            )}
            {restaurant.phone && (
              <p className="flex items-center gap-2">
                <Phone size={14} className="flex-shrink-0 text-gray-500" />
                <a href={`tel:${restaurant.phone}`} className="hover:text-primary-600">{restaurant.phone}</a>
              </p>
            )}
            {restaurant.email && (
              <p className="flex items-center gap-2">
                <Mail size={14} className="flex-shrink-0 text-gray-500" />
                <a href={`mailto:${restaurant.email}`} className="hover:text-primary-600 break-all">{restaurant.email}</a>
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
            {restaurant.rating != null && (
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-16 h-2 bg-gray-200 rounded overflow-hidden">
                  <span
                    className="block h-full bg-primary-500 rounded"
                    style={{ width: getRatingWidth(restaurant.rating) }}
                  />
                </span>
                <Star size={14} className="text-amber-500 flex-shrink-0" />
                <span className="font-medium">{Number(restaurant.rating).toFixed(1)}</span>
              </span>
            )}
            {(restaurant.review_count ?? restaurant.reviews_count) != null && (
              <span className="text-gray-500">
                {restaurant.review_count ?? restaurant.reviews_count} {t('restaurant.reviews')}
              </span>
            )}
          </div>

          {(() => {
            const outImgs = collectOutsideImages(restaurant)
            if (outImgs.length === 0) return null
            return (
              <div className="mt-3">
                <div className="text-xs font-semibold text-gray-700 mb-2">
                  {t('restaurantRegister.outsideImages')}
                </div>
                <div className="grid grid-cols-8 sm:grid-cols-10 gap-1">
                  {outImgs.slice(0, 10).map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPreviewImage(url)}
                      className="block aspect-square rounded overflow-hidden border border-gray-200 hover:opacity-90 transition bg-white"
                      aria-label={t('common.view') || 'View'}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )
          })()}
        </div>
      </div>

      {/* Outside & Inside images - gọn hơn */}
      {(() => {
        const inImgs = collectInsideImages(restaurant)
        if (inImgs.length === 0) return null
        return (
          <div className="md:flex gap-6 mb-6">
            {inImgs.length > 0 && (
              <section className="flex-1">
                <h2 className="text-base font-semibold text-gray-900 mb-2">{t('restaurantRegister.insideImages')}</h2>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {inImgs.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPreviewImage(url)}
                      className="block aspect-square rounded-lg overflow-hidden border border-gray-200 hover:opacity-90 transition bg-white"
                      aria-label={t('common.view') || 'View'}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>
        )
      })()}

      {/* Menu / Food list: cột trái = category, cột phải = danh sách món */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        {/* Cột trái: danh mục món */}
        {foodItems.length > 0 && categories.length > 1 && (
          <aside className="lg:w-52 xl:w-56 flex-shrink-0">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
              {t('food.category')}
            </h3>
            <nav className="bg-white rounded-lg border border-gray-200 overflow-hidden overflow-x-auto lg:overflow-visible">
              <div className="flex lg:flex-col min-w-0">
                {categories.map((cat) => (
                  <button
                    key={cat.id ?? 'all'}
                    type="button"
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`flex items-center w-full text-left px-4 py-3 border-b border-gray-100 last:border-b-0 whitespace-nowrap transition-colors ${
                      selectedCategoryId === cat.id
                        ? 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                        : 'text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-sm font-medium">{cat.name}</span>
                  </button>
                ))}
              </div>
            </nav>
          </aside>
        )}

        {/* Cột phải: danh sách món (list + ảnh trước tên) */}
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t('restaurant.menu')}</h2>

          {foodItems.length === 0 ? (
            <div className="card p-6 text-center">
              <p className="text-gray-600 mb-2">{t('common.noData')}</p>
              <p className="text-sm text-gray-500">{t('restaurant.menu')}</p>
            </div>
          ) : filteredFoodItems.length === 0 ? (
            <div className="card p-6 text-center">
              <p className="text-gray-600 mb-2">{t('common.noData')}</p>
              <p className="text-sm text-gray-500">{t('food.category')}</p>
            </div>
          ) : groupedByCategory && groupedByCategory.length > 0 ? (
            <div className="card p-4 sm:p-6 space-y-6">
              {groupedByCategory.map((group) => (
                <div key={group.categoryId ?? 'uncategorized'}>
                  <h3 className="text-base font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">
                    {group.categoryName}
                  </h3>
                  <ul className="space-y-3">
                    {group.items.map((item) => (
                      <li
                        key={item.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setPreviewFood(item)}
                        onKeyDown={(e) => e.key === 'Enter' && setPreviewFood(item)}
                        className="flex items-center gap-3 sm:gap-4 py-3 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 -mx-2 px-2 rounded transition-colors"
                      >
                        <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={getFoodImage(item)}
                            alt={toDisplayText(item.name)}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-medium text-gray-900 block">
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
              ))}
            </div>
          ) : (
            <div className="card p-4 sm:p-6">
              <ul className="space-y-3">
                {filteredFoodItems.map((item) => (
                  <li
                    key={item.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setPreviewFood(item)}
                    onKeyDown={(e) => e.key === 'Enter' && setPreviewFood(item)}
                    className="flex items-center gap-3 sm:gap-4 py-3 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 -mx-2 px-2 rounded transition-colors"
                  >
                    <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={getFoodImage(item)}
                        alt={toDisplayText(item.name)}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-medium text-gray-900 block">
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
          )}
        </div>
      </div>

      {/* Best Sellers section – đặt dưới list food items */}
      {bestSellerItems.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t('restaurant.bestSellers')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {bestSellerItems.map((item) => (
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
        </section>
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
                    {t('food.vegetarian')}
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

      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          onClick={() => setPreviewImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label={t('common.view') || 'Preview image'}
        >
          <div
            className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 hover:bg-white shadow text-gray-600 hover:text-gray-900 transition"
              aria-label={t('common.close') || 'Close'}
            >
              <X size={20} />
            </button>
            <div className="bg-black flex items-center justify-center">
              <img
                src={previewImage}
                alt=""
                className="max-h-[90vh] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RestaurantDetailPage
