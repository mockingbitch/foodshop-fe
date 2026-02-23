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

    const newStatus = currentStatus === 'active' ? 'hidden' : 'active'
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
            <option value="hidden">{t('common.hidden')}</option>
            <option value="pending">{t('common.pending')}</option>
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
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider py-3 px-4 w-16">
                    <span className="sr-only">{t('common.image')}</span>
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider py-3 px-4">
                    {t('restaurant.title')}
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider py-3 px-4 hidden sm:table-cell">
                    {t('restaurant.address')}
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider py-3 px-4 w-20">
                    {t('common.rating')}
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider py-3 px-4 w-28">
                    {t('common.status')}
                  </th>
                  <th className="text-right text-xs font-semibold text-gray-600 uppercase tracking-wider py-3 px-4 w-40">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {restaurants.map((restaurant) => {
                  const id = getRestaurantId(restaurant)
                  const name = toDisplayText(restaurant.name)
                  const status = restaurant.status ?? 'active'
                  const isActive = status === 'active' // hidden | pending hiển thị như inactive
                  const isUpdating = updating.has(id)

                  return (
                    <tr key={id} className="bg-white hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <img
                          src={getRestaurantImage(restaurant)}
                          alt=""
                          className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-900">{name || t('common.noData')}</span>
                      </td>
                      <td className="py-3 px-4 hidden sm:table-cell text-sm text-gray-500 max-w-[200px] truncate">
                        {restaurant.address ? (
                          <span className="font-normal flex items-center gap-1">
                            <MapPin size={14} className="flex-shrink-0 text-gray-400" />
                            {restaurant.address}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {restaurant.rating != null ? (
                          <span className="inline-flex items-center gap-1 text-sm text-gray-700">
                            <Star size={14} className="text-amber-500 flex-shrink-0" />
                            {Number(restaurant.rating).toFixed(1)}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleStatusToggle(id, status)}
                          disabled={isUpdating}
                          className={`inline-flex items-center gap-1.5 text-sm font-medium ${
                            isActive ? 'text-green-600 hover:text-green-700' : 'text-gray-500 hover:text-gray-700'
                          } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                          {isActive ? t('common.visible') : t('common.hidden')}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to={`/admin/restaurants/${id}/food-items`}
                          className="text-sm font-medium text-primary-600 hover:text-primary-700"
                        >
                          {t('admin.manageFoodItems')} →
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminRestaurantListPage
