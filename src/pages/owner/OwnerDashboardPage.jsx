import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '@context/LanguageContext'
import { useAuth } from '@context/AuthContext'
import { restaurantApi } from '@services/api/restaurantApi'
import { foodApi } from '@services/api/foodApi'
import LoadingSpinner from '@components/common/LoadingSpinner'
import { Store, UtensilsCrossed, Users, Clock, MapPin } from 'lucide-react'

const OwnerDashboardPage = () => {
  const { t } = useLanguage()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('restaurants')
  const [restaurants, setRestaurants] = useState([])
  const [foodItems, setFoodItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      fetchData()
    }
  }, [activeTab, user?.id])

  const ensureArray = (value) => {
    if (Array.isArray(value)) return value
    if (value && typeof value === 'object') {
      const arr = value.data ?? value.restaurants ?? value.items ?? value.food_items ?? value.foodItems
      return Array.isArray(arr) ? arr : []
    }
    return []
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'restaurants') {
        const response = await restaurantApi.getRestaurants({ owner_id: user?.id })
        setRestaurants(ensureArray(response?.data))
      } else {
        const response = await foodApi.getFoodItems({ owner_id: user?.id })
        setFoodItems(ensureArray(response?.data))
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      if (activeTab === 'restaurants') setRestaurants([])
      else setFoodItems([])
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
  }

  const getRatingWidth = (rating) => (!rating ? '0%' : `${(rating / 5) * 100}%`)
  const getLevel = (rating) => {
    if (!rating) return 'New'
    if (rating >= 4.5) return 'Excellent'
    if (rating >= 3.5) return 'Good'
    return 'Normal'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{t('owner.title')}</h1>
        <nav className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 mt-1 flex-wrap">
          <Link to="/" className="hover:text-primary-600 truncate">{t('common.home')}</Link>
          <span>/</span>
          <Link to="/owner/dashboard" className="hover:text-primary-600 truncate">{t('owner.title')}</Link>
          <span>/</span>
          <span className="text-gray-700 truncate">
            {activeTab === 'restaurants' ? t('owner.myRestaurants') : t('owner.myFoodItems')}
          </span>
        </nav>
      </div>

      <div className="flex gap-0 sm:gap-4 border-b border-gray-200 mb-4 sm:mb-6 overflow-x-auto -mx-1 px-1">
        <button
          type="button"
          onClick={() => setActiveTab('restaurants')}
          className={`flex-shrink-0 px-3 sm:px-4 py-3 font-medium border-b-2 transition whitespace-nowrap ${
            activeTab === 'restaurants'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <span className="flex items-center gap-2">
            <Store size={18} className="flex-shrink-0" />
            {t('owner.myRestaurants')}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('food-items')}
          className={`flex-shrink-0 px-3 sm:px-4 py-3 font-medium border-b-2 transition whitespace-nowrap ${
            activeTab === 'food-items'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <span className="flex items-center gap-2">
            <UtensilsCrossed size={18} className="flex-shrink-0" />
            {t('owner.myFoodItems')}
          </span>
        </button>
      </div>

      {activeTab === 'restaurants' ? (
        <div className="space-y-4 sm:space-y-6">
          {!Array.isArray(restaurants) || restaurants.length === 0 ? (
            <div className="card p-6 sm:p-12 text-center">
              <Store size={40} className="mx-auto text-gray-400 mb-3 sm:mb-4" />
              <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">{t('common.noData')}</p>
              <Link to="/owner/restaurant/register" className="btn btn-primary inline-flex items-center gap-2 text-sm sm:text-base">
                <Store size={18} className="flex-shrink-0" />
                {t('owner.addRestaurant')}
              </Link>
            </div>
          ) : (
            (Array.isArray(restaurants) ? restaurants : []).map((restaurant) => (
              <div key={restaurant.id} className="card overflow-hidden flex flex-col sm:flex-row p-0">
                <div className="w-full sm:w-1/3 relative group min-h-[180px] sm:min-h-[200px] flex-shrink-0">
                  <img
                    src={restaurant.images?.[0]?.url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                  <Link
                    to={`/restaurants/${restaurant.id}`}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition active:opacity-100"
                  >
                    <span className="text-white font-medium text-sm sm:text-base">{t('common.view')}</span>
                  </Link>
                </div>
                <div className="w-full sm:w-2/3 p-4 sm:p-6 flex flex-col justify-between min-w-0">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2 truncate">
                      <Link to={`/restaurants/${restaurant.id}`} className="hover:text-primary-600">
                        {restaurant.name}
                      </Link>
                    </h2>
                    <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 mb-3 sm:mb-4">
                      {restaurant.description || t('common.noData')}
                    </p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 sm:gap-4 text-xs sm:text-sm text-gray-500">
                      <span className="flex items-center gap-1"><Users size={14} className="flex-shrink-0" /> {restaurant.reviews_count || 0}</span>
                      <span className="flex items-center gap-1"><Clock size={14} className="flex-shrink-0" /> {restaurant.hours || '24/7'}</span>
                      <span className="flex items-center gap-1 min-w-0"><MapPin size={14} className="flex-shrink-0" /> <span className="truncate">{restaurant.address ? `${restaurant.address.slice(0, 30)}...` : '—'}</span></span>
                      <span className="flex items-center gap-1">
                        <span className="inline-block w-12 sm:w-16 h-2 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                          <span className="block h-full bg-primary-500 rounded" style={{ width: getRatingWidth(restaurant.rating) }} />
                        </span>
                        {getLevel(restaurant.rating)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                    <Link to={`/restaurants/${restaurant.id}`} className="btn btn-outline text-xs sm:text-sm flex-1 sm:flex-initial min-w-0">
                      {t('common.view')}
                    </Link>
                    <Link to={`/owner/restaurant/${restaurant.id}/edit`} className="btn btn-primary text-xs sm:text-sm flex-1 sm:flex-initial min-w-0">
                      {t('common.edit')}
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {!Array.isArray(foodItems) || foodItems.length === 0 ? (
            <div className="card p-6 sm:p-12 text-center">
              <UtensilsCrossed size={40} className="mx-auto text-gray-400 mb-3 sm:mb-4" />
              <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">{t('common.noData')}</p>
              <Link to="/owner/food-items/create" className="btn btn-primary inline-flex items-center gap-2 text-sm sm:text-base">
                <UtensilsCrossed size={18} className="flex-shrink-0" />
                {t('owner.addFoodItem')}
              </Link>
            </div>
          ) : (
            (Array.isArray(foodItems) ? foodItems : []).map((food) => (
              <div key={food.id} className="card overflow-hidden flex flex-col sm:flex-row p-0">
                <div className="w-full sm:w-1/3 relative group min-h-[180px] sm:min-h-[200px] flex-shrink-0">
                  <img
                    src={food.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800'}
                    alt={food.name}
                    className="w-full h-full object-cover"
                  />
                  <Link
                    to={`/food-items/${food.id}`}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition active:opacity-100"
                  >
                    <span className="text-white font-medium text-sm sm:text-base">{t('common.view')}</span>
                  </Link>
                </div>
                <div className="w-full sm:w-2/3 p-4 sm:p-6 flex flex-col justify-between min-w-0">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2 truncate">
                      <Link to={`/food-items/${food.id}`} className="hover:text-primary-600">
                        {food.name}
                      </Link>
                    </h2>
                    <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 mb-3 sm:mb-4">
                      {food.description || t('common.noData')}
                    </p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 sm:gap-4 text-xs sm:text-sm text-gray-500">
                      <span className="font-semibold text-primary-600">{formatPrice(food.price)}</span>
                      <span className="truncate">{food.category?.name || '—'}</span>
                      <span className="flex items-center gap-1">
                        <span className="inline-block w-12 sm:w-16 h-2 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                          <span className="block h-full bg-primary-500 rounded" style={{ width: getRatingWidth(food.rating) }} />
                        </span>
                        {getLevel(food.rating)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                    <Link to={`/food-items/${food.id}`} className="btn btn-outline text-xs sm:text-sm flex-1 sm:flex-initial min-w-0">
                      {t('common.view')}
                    </Link>
                    <Link to={`/owner/food-items/${food.id}/edit`} className="btn btn-primary text-xs sm:text-sm flex-1 sm:flex-initial min-w-0">
                      {t('common.edit')}
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default OwnerDashboardPage
