import { useState, useEffect, useCallback } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useLanguage } from '@context/LanguageContext'
import { foodApi } from '@services/api/foodApi'
import LoadingSpinner from '@components/common/LoadingSpinner'
import { formatCurrency, getRatingStars, stripHtml, getLocalizedText } from '@utils/helpers'
import { DEFAULT_FOOD_IMAGE } from '@constants'
import { toast } from 'react-toastify'
import { Store, ChevronRight, ChevronLeft, Star, Leaf, MessageSquare, X } from 'lucide-react'

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

const getFoodImage = (item) =>
  item?.main_image ?? item?.image_url ?? item?.images?.[0]?.url ?? DEFAULT_FOOD_IMAGE

const getRestaurantId = (r) => r?.id ?? r?.restaurant_id

const ensureReviewsArray = (res) => {
  const raw = res?.data ?? res
  if (Array.isArray(raw)) return raw
  if (raw && typeof raw === 'object') {
    const list =
      raw.data && Array.isArray(raw.data) ? raw.data
      : Array.isArray(raw.reviews) ? raw.reviews
      : Array.isArray(raw.items) ? raw.items
      : Array.isArray(raw.results) ? raw.results
      : raw.data?.data && Array.isArray(raw.data.data) ? raw.data.data
      : raw.data?.reviews && Array.isArray(raw.data.reviews) ? raw.data.reviews
      : []
    return list
  }
  return []
}

const FoodDetailPage = () => {
  const { id, restaurantId: restaurantIdParam } = useParams()
  const navigate = useNavigate()
  const { t, currentLanguage } = useLanguage()
  const [food, setFood] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewForm, setReviewForm] = useState({ reviewerName: '', rating: 5, comment: '' })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [showDescriptionPopup, setShowDescriptionPopup] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)

  useEffect(() => {
    if (!id) {
      setNotFound(true)
      setLoading(false)
      return
    }
    setLoading(true)
    setNotFound(false)
    foodApi
      .getFoodItemById(id)
      .then((res) => {
        const raw = res?.data ?? res
        let item = raw?.data ?? raw?.food_item ?? raw?.result ?? raw
        // API trả về data: { food_item, extra_images } → lấy food_item
        if (item && typeof item === 'object' && item.food_item != null) item = item.food_item
        if (item && typeof item === 'object') setFood(item)
        else setNotFound(true)
      })
      .catch(() => {
        setNotFound(true)
      })
      .finally(() => setLoading(false))
  }, [id])

  const fetchReviews = useCallback(() => {
    if (!id) return
    setReviewsLoading(true)
    foodApi
      .getFoodItemReviews(id, { per_page: 50 })
      .then((res) => setReviews(ensureReviewsArray(res)))
      .catch(() => setReviews([]))
      .finally(() => setReviewsLoading(false))
  }, [id])

  useEffect(() => {
    if (id && food) fetchReviews()
  }, [id, food, fetchReviews])

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!id || submittingReview) return
    const reviewerName = reviewForm.reviewerName?.trim()
    const comment = reviewForm.comment?.trim()
    if (!reviewerName) {
      toast.error(t('food.reviewerNameRequired') || 'Vui lòng nhập tên của bạn')
      return
    }
    if (!comment) {
      toast.error(t('food.reviewCommentRequired') || 'Vui lòng nhập nội dung đánh giá')
      return
    }
    setSubmittingReview(true)
    try {
      await foodApi.createFoodItemReview(id, {
        reviewer_name: reviewerName,
        rating: Math.min(5, Math.max(1, Number(reviewForm.rating) || 5)),
        comment,
      })
      toast.success(t('common.success'))
      setReviewForm({ reviewerName: '', rating: 5, comment: '' })
      fetchReviews()
    } catch (err) {
      console.error(err)
      toast.error(err?.response?.data?.message || t('common.error'))
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return (
      <div className="container-custom py-12 flex justify-center min-h-[320px] items-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (notFound || !food) {
    return (
      <div className="container-custom py-12">
        <div className="card p-8 text-center">
          <p className="text-gray-600 mb-4">{t('common.noData')}</p>
          {restaurantIdParam ? (
            <Link to={`/restaurants/${restaurantIdParam}`} className="btn btn-primary">
              {t('restaurant.detail')}
            </Link>
          ) : (
            <Link to="/food-items" className="btn btn-primary">
              {t('food.title')}
            </Link>
          )}
        </div>
      </div>
    )
  }

  const name = getLocalizedText(food.name, currentLanguage)
  const description = toDisplayText(food.description)
  const restaurant = food.restaurant ?? food.restaurant_id
  const restaurantIdFromFood = typeof restaurant === 'object' ? getRestaurantId(restaurant) : restaurant
  const restaurantId = restaurantIdParam ?? restaurantIdFromFood
  const restaurantName = typeof restaurant === 'object' ? toDisplayText(restaurant?.name) : null

  return (
    <div className="container-custom py-8 sm:py-12">
      <div className="mb-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-primary-600 transition"
          aria-label={t('common.back')}
        >
          <ChevronLeft size={18} />
          {t('common.back')}
        </button>
      </div>
      <nav className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 mb-6 flex-wrap">
        <Link to="/" className="hover:text-primary-600">{t('common.home')}</Link>
        <ChevronRight size={14} className="flex-shrink-0" />
        {restaurantIdParam ? (
          <>
            <Link to="/restaurants" className="hover:text-primary-600">{t('restaurant.title')}</Link>
            <ChevronRight size={14} className="flex-shrink-0" />
            <Link to={`/restaurants/${restaurantIdParam}`} className="hover:text-primary-600 truncate max-w-[120px] sm:max-w-[200px]">
              {restaurantName || t('restaurant.detail')}
            </Link>
            <ChevronRight size={14} className="flex-shrink-0" />
          </>
        ) : (
          <>
            <Link to="/food-items" className="hover:text-primary-600">{t('food.title')}</Link>
            <ChevronRight size={14} className="flex-shrink-0" />
          </>
        )}
        <span className="text-gray-700 truncate max-w-[180px] sm:max-w-none">{name || t('food.detail')}</span>
      </nav>

      <div className="card overflow-hidden p-0 flex flex-col md:flex-row">
        <button
          type="button"
          onClick={() => setPreviewImage(getFoodImage(food))}
          className="w-full md:w-2/5 lg:w-1/3 flex-shrink-0 block aspect-[4/3] md:aspect-[4/3] md:max-h-[min(36vh,280px)] overflow-hidden rounded-l-lg cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-left"
          aria-label={t('common.view') || 'Xem ảnh'}
        >
          <img
            src={getFoodImage(food)}
            alt={name}
            className="w-full h-full object-cover"
          />
        </button>
        <div className="w-full md:w-3/5 lg:w-2/3 p-6 sm:p-8 flex flex-col">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {name || t('food.detail')}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-4">
            <span className="font-semibold text-primary-600 text-lg">
              {formatCurrency(food.price ?? 0, food.currency_code ?? 'VND')}
            </span>
            {(food.category?.name || food.food_category?.name) && (
              <span className="text-gray-500">
                {getLocalizedText(food.category?.name ?? food.food_category?.name, currentLanguage)}
              </span>
            )}
            {(food.rating != null || food.customer_rating != null) && (
              <span className="flex items-center gap-1">
                <Star size={16} className="text-amber-500" />
                {Number(food.customer_rating ?? food.rating).toFixed(1)}
                {food.customer_review_count != null && (
                  <span className="text-gray-500">({food.customer_review_count} {t('restaurant.reviews')})</span>
                )}
                {food.customer_review_count == null && <span> {t('restaurant.reviews')}</span>}
              </span>
            )}
            {food.is_vegetarian && (
              <span className="inline-flex items-center gap-1 text-green-600">
                <Leaf size={16} />
                {t('food.vegetarian')}
              </span>
            )}
          </div>
          {description && (
            <div className="mb-4">
              <h2 className="text-base font-semibold text-gray-900 mb-3">{t('restaurantRegister.descriptionLabel')}</h2>
              <p className="text-gray-600 leading-relaxed line-clamp-2">
                {stripHtml(description)}
              </p>
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowDescriptionPopup(true)}
                  className="btn btn-outline text-sm py-1.5 px-3"
                >
                  {t('common.viewMore')}
                </button>
              </div>
            </div>
          )}

          {showDescriptionPopup && description && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
              onClick={() => setShowDescriptionPopup(false)}
              role="dialog"
              aria-modal="true"
              aria-label={t('restaurantRegister.descriptionLabel')}
            >
              <div
                className="relative bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">{t('restaurantRegister.descriptionLabel')}</h2>
                  <button
                    type="button"
                    onClick={() => setShowDescriptionPopup(false)}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition"
                    aria-label={t('common.close')}
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="p-4 sm:p-6 overflow-y-auto flex-1 min-w-0">
                  <div
                    className="content-html text-gray-600 leading-relaxed"
                    style={{ wordBreak: 'normal', overflowWrap: 'break-word' }}
                    dangerouslySetInnerHTML={{ __html: description }}
                  />
                </div>
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
            {food.serving_size != null && (
              <span>{t('food.servingSize')}: {food.serving_size}</span>
            )}
            {food.weight != null && (
              <span>{t('food.weight')}: {food.weight}g</span>
            )}
          </div>
          {restaurantId && (
            <Link
              to={`/restaurants/${restaurantId}`}
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium mt-auto pt-4 border-t border-gray-100"
            >
              <Store size={18} />
              {restaurantName || t('restaurant.detail')}
            </Link>
          )}
        </div>
      </div>

      {/* Review section - list reviews trước đó + form thêm mới */}
      <section className="mt-8 sm:mt-10" aria-labelledby="food-reviews-heading">
        <h2 id="food-reviews-heading" className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MessageSquare size={22} />
          {t('food.reviews')}
        </h2>

        {reviewsLoading ? (
          <div className="card p-8 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            {reviews.length > 0 && (
              <>
                <h3 className="text-sm font-medium text-gray-700 mb-3">{t('food.previousReviews')}</h3>
                <ul className="space-y-4 mb-6" role="list">
                {reviews.map((r) => {
                  const userName = r.reviewer_name ?? r.user_name ?? r.user?.name ?? r.customer_name ?? t('common.guest')
                  const rating = Number(r.rating ?? r.score ?? 0)
                  const stars = getRatingStars(rating)
                  const comment = r.comment ?? r.content ?? r.body ?? ''
                  const createdAt = r.created_at ?? r.created_at_formatted ?? ''
                  return (
                    <li key={r.id ?? `${userName}-${createdAt}`} className="card p-4">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 text-gray-600 font-medium">
                          {(userName || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">{userName}</span>
                            <span className="flex items-center gap-0.5 text-amber-500">
                              {[...Array(stars.full)].map((_, i) => (
                                <Star key={`f-${i}`} size={14} className="fill-current" />
                              ))}
                              {stars.half > 0 && <Star size={14} className="fill-current opacity-80" />}
                              {[...Array(stars.empty)].map((_, i) => (
                                <Star key={`e-${i}`} size={14} className="text-gray-300" />
                              ))}
                            </span>
                            {createdAt && (
                              <span className="text-xs text-gray-400">
                                {typeof createdAt === 'string' && createdAt.length > 10
                                  ? new Date(createdAt).toLocaleDateString()
                                  : createdAt}
                              </span>
                            )}
                          </div>
                          {comment && <p className="text-gray-600 text-sm leading-relaxed">{comment}</p>}
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
              </>
            )}
            {!reviewsLoading && reviews.length === 0 && (
              <p className="text-gray-500 text-sm mb-4">{t('food.noReviews')}</p>
            )}

            <div className="card p-4 sm:p-6">
              <h3 className="text-base font-medium text-gray-900 mb-3">{t('food.addReview')}</h3>
              <form onSubmit={handleSubmitReview} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('food.reviewerName')}</label>
                  <input
                    type="text"
                    value={reviewForm.reviewerName}
                    onChange={(e) => setReviewForm((prev) => ({ ...prev, reviewerName: e.target.value }))}
                    className="input w-full"
                    placeholder={t('food.reviewerNamePlaceholder')}
                    maxLength={100}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.rating')}</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setReviewForm((prev) => ({ ...prev, rating: value }))}
                        className="p-1 rounded hover:bg-amber-50 transition"
                        aria-label={`${value} ${t('common.rating')}`}
                      >
                        <Star
                          size={28}
                          className={
                            value <= (reviewForm.rating || 0)
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-gray-300'
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('food.reviewComment')}</label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                    className="input w-full min-h-[100px] resize-y"
                    placeholder={t('food.reviewCommentPlaceholder')}
                    rows={4}
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn btn-primary inline-flex items-center gap-2"
                >
                  {submittingReview ? <LoadingSpinner /> : <MessageSquare size={18} />}
                  {submittingReview ? t('common.loading') + '...' : t('food.submitReview')}
                </button>
              </form>
            </div>
          </>
        )}
      </section>

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
              aria-label={t('common.close') || 'Đóng'}
            >
              <X size={20} />
            </button>
            <div className="bg-black flex items-center justify-center">
              <img
                src={previewImage}
                alt={name}
                className="max-h-[90vh] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FoodDetailPage
