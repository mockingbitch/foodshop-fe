import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useLanguage } from '@context/LanguageContext'
import { adminApi } from '@services/api/adminApi'
import { restaurantApi } from '@services/api/restaurantApi'
import { toast } from 'react-toastify'
import LoadingSpinner from '@components/common/LoadingSpinner'
import { formatCurrency } from '@utils/helpers'
import { DEFAULT_FOOD_IMAGE } from '@constants'
import { UtensilsCrossed, Search, ToggleLeft, ToggleRight, Store, ChevronRight } from 'lucide-react'

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

const DEBOUNCE_MS = 350

const AdminFoodItemListPage = () => {
  const { id: restaurantId } = useParams()
  const { t } = useLanguage()
  const [restaurant, setRestaurant] = useState(null)
  const [foodItems, setFoodItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [updating, setUpdating] = useState(new Set())

  useEffect(() => {
    if (restaurantId) {
      restaurantApi
        .getRestaurantById(restaurantId)
        .then((res) => {
          const raw = res?.data ?? res
          const inner = raw?.data ?? raw
          const rest = inner?.restaurant ?? inner?.data ?? inner ?? raw?.restaurant ?? raw?.result ?? raw
          if (rest && typeof rest === 'object') {
            setRestaurant(rest)
          }
        })
        .catch(() => {
          setRestaurant(null)
        })
    }
  }, [restaurantId])

  const fetchFoodItems = useCallback(
    async (filters) => {
      if (!restaurantId) {
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const params = { per_page: 100 }
        if (filters.search?.trim()) params.search = filters.search.trim()
        if (filters.status) params.status = filters.status

        const res = await adminApi.getRestaurantFoodItems(restaurantId, params)
        const raw = res?.data ?? res
        const list = ensureArray(raw)
        setFoodItems(Array.isArray(list) ? list : [])
      } catch (error) {
        console.error('Error fetching food items:', error)
        setFoodItems([])
      } finally {
        setLoading(false)
      }
    },
    [restaurantId]
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFoodItems({ search: searchQuery, status: statusFilter })
    }, DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [searchQuery, statusFilter, fetchFoodItems])

  const handleStatusToggle = async (foodItemId, currentStatus) => {
    if (updating.has(foodItemId)) return

    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    setUpdating((prev) => new Set(prev).add(foodItemId))

    try {
      await adminApi.updateFoodItemStatus(foodItemId, newStatus)
      setFoodItems((prev) =>
        prev.map((item) => {
          if (item.id === foodItemId) {
            return { ...item, status: newStatus }
          }
          return item
        })
      )
      toast.success(t('common.success'))
    } catch (error) {
      console.error('Error updating food item status:', error)
      toast.error(t('common.error'))
    } finally {
      setUpdating((prev) => {
        const next = new Set(prev)
        next.delete(foodItemId)
        return next
      })
    }
  }

  const restaurantName = restaurant ? toDisplayText(restaurant.name) : null

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 mb-6 flex-wrap">
        <Link to="/admin/dashboard" className="hover:text-primary-600">{t('admin.title')}</Link>
        <ChevronRight size={14} className="flex-shrink-0" />
        <Link to="/admin/restaurants" className="hover:text-primary-600">{t('admin.manageRestaurants')}</Link>
        {restaurantName && (
          <>
            <ChevronRight size={14} className="flex-shrink-0" />
            <span className="text-gray-700 truncate max-w-[180px] sm:max-w-none">{restaurantName}</span>
          </>
        )}
        <ChevronRight size={14} className="flex-shrink-0" />
        <span className="text-gray-700">{t('admin.manageFoodItems')}</span>
      </nav>

      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-2">
          {restaurant && (
            <div className="flex items-center gap-2 text-gray-600">
              <Store size={20} />
              <span className="font-medium">{restaurantName || t('restaurant.detail')}</span>
            </div>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('admin.manageFoodItems')}</h1>
      </div>

      {/* Filters */}
      <div className="card p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
              placeholder={t('restaurant.search')}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input sm:w-48"
          >
            <option value="">{t('common.allStatus')}</option>
            <option value="active">{t('common.active')}</option>
            <option value="inactive">{t('common.inactive')}</option>
          </select>
        </div>
      </div>

      {/* Food Items List */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      ) : foodItems.length === 0 ? (
        <div className="card p-8 text-center">
          <UtensilsCrossed size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">{t('common.noData')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {foodItems.map((item) => {
            const name = toDisplayText(item.name)
            const status = item.status ?? 'active'
            const isActive = status === 'active'
            const isUpdating = updating.has(item.id)

            return (
              <div key={item.id} className="card overflow-hidden p-0 flex flex-col">
                <div className="aspect-[16/10] flex-shrink-0">
                  <img
                    src={getFoodImage(item)}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 flex flex-col flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate mb-1">{name || t('common.noData')}</h3>
                  <p className="text-primary-600 font-medium text-sm mb-2">
                    {formatCurrency(item.price ?? 0, item.currency_code ?? 'VND')}
                  </p>
                  {item.description && (
                    <p className="text-gray-500 text-xs mb-3 line-clamp-2">{toDisplayText(item.description)}</p>
                  )}
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleStatusToggle(item.id, status)}
                      disabled={isUpdating}
                      className={`flex items-center gap-2 text-sm font-medium ${
                        isActive ? 'text-green-600 hover:text-green-700' : 'text-gray-400 hover:text-gray-600'
                      } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      <span>{isActive ? t('common.active') : t('common.inactive')}</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default AdminFoodItemListPage
