import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '@context/LanguageContext'
import { adminApi } from '@services/api/adminApi'
import { toast } from 'react-toastify'
import LoadingSpinner from '@components/common/LoadingSpinner'
import { Store, MapPin, Star, Search, ToggleLeft, ToggleRight } from 'lucide-react'

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
    restaurant.outside_image_1 ??
    restaurant.images?.[0]?.url ??
    restaurant.outside_images?.[0]?.url ??
    restaurant.image_url
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

const DEBOUNCE_MS = 350

const AdminRestaurantListPage = () => {
  const { t } = useLanguage()
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [updating, setUpdating] = useState(new Set())

  const fetchRestaurants = useCallback(
    async (filters) => {
      setLoading(true)
      try {
        const params = { per_page: 100 }
        if (filters.search?.trim()) params.search = filters.search.trim()
        if (filters.status) params.status = filters.status

        const res = await adminApi.getRestaurants(params)
        const raw = res?.data ?? res
        const list = ensureArray(raw)
        setRestaurants(Array.isArray(list) ? list : [])
      } catch (error) {
        console.error('Error fetching restaurants:', error)
        setRestaurants([])
      } finally {
        setLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRestaurants({ search: searchQuery, status: statusFilter })
    }, DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [searchQuery, statusFilter, fetchRestaurants])

  const handleStatusToggle = async (restaurantId, currentStatus) => {
    if (updating.has(restaurantId)) return

    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    setUpdating((prev) => new Set(prev).add(restaurantId))

    try {
      await adminApi.updateRestaurantStatus(restaurantId, newStatus)
      setRestaurants((prev) =>
        prev.map((r) => {
          const id = getRestaurantId(r)
          if (id === restaurantId) {
            return { ...r, status: newStatus }
          }
          return r
        })
      )
      toast.success(t('common.success'))
    } catch (error) {
      console.error('Error updating restaurant status:', error)
      toast.error(t('common.error'))
    } finally {
      setUpdating((prev) => {
        const next = new Set(prev)
        next.delete(restaurantId)
        return next
      })
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('admin.manageRestaurants')}</h1>
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

      {/* Restaurant List */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      ) : restaurants.length === 0 ? (
        <div className="card p-8 text-center">
          <Store size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">{t('common.noData')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {restaurants.map((restaurant) => {
            const id = getRestaurantId(restaurant)
            const name = toDisplayText(restaurant.name)
            const status = restaurant.status ?? 'active'
            const isActive = status === 'active'
            const isUpdating = updating.has(id)

            return (
              <div key={id} className="card overflow-hidden p-0 flex flex-col">
                <div className="aspect-[16/10] flex-shrink-0">
                  <img
                    src={getRestaurantImage(restaurant)}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 flex flex-col flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate mb-1">{name || t('common.noData')}</h3>
                  {restaurant.address && (
                    <p className="text-gray-500 text-xs mb-2 flex items-center gap-1">
                      <MapPin size={12} />
                      <span className="truncate">{restaurant.address}</span>
                    </p>
                  )}
                  {restaurant.rating != null && (
                    <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                      <Star size={14} className="text-amber-500" />
                      {Number(restaurant.rating).toFixed(1)}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleStatusToggle(id, status)}
                      disabled={isUpdating}
                      className={`flex items-center gap-2 text-sm font-medium ${
                        isActive ? 'text-green-600 hover:text-green-700' : 'text-gray-400 hover:text-gray-600'
                      } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      <span>{isActive ? t('common.active') : t('common.inactive')}</span>
                    </button>
                    <Link
                      to={`/admin/restaurants/${id}/food-items`}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      {t('admin.manageFoodItems')} →
                    </Link>
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

export default AdminRestaurantListPage
