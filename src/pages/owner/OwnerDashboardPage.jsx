import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '@context/LanguageContext'
import { useAuth } from '@context/AuthContext'
import { restaurantApi } from '@services/api/restaurantApi'
import { foodApi } from '@services/api/foodApi'
import { commonApi } from '@services/api/commonApi'
import LoadingSpinner from '@components/common/LoadingSpinner'
import { Store, UtensilsCrossed, Users, Clock, MapPin, Plus, X } from 'lucide-react'
import { toast } from 'react-toastify'

const initialFormData = {
  country_id: '',
  restaurant_type_id: '',
  name: '',
  description: '',
  city: '',
  address: '',
  phone: '',
  zalo: '',
  email: '',
  latitude: '',
  longitude: '',
  delivery_available: true,
}

const OwnerDashboardPage = () => {
  const { t } = useLanguage()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('restaurants')
  const [restaurants, setRestaurants] = useState([])
  const [foodItems, setFoodItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [addFormData, setAddFormData] = useState(initialFormData)
  const [addFormErrors, setAddFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [countries, setCountries] = useState([])
  const [restaurantTypes, setRestaurantTypes] = useState([])

  useEffect(() => {
    if (user?.id) {
      fetchData()
    } else {
      // user chưa có hoặc không có id → tắt loading để không treo spinner
      setLoading(false)
    }
  }, [activeTab, user?.id])

  useEffect(() => {
    if (showAddForm && activeTab === 'restaurants') {
      Promise.all([commonApi.getCountries(), commonApi.getRestaurantTypes()])
        .then(([countriesRes, typesRes]) => {
          const countryList = Array.isArray(countriesRes?.data) ? countriesRes.data : (countriesRes?.data?.data ?? countriesRes?.data?.countries ?? [])
          const typeList = Array.isArray(typesRes?.data) ? typesRes.data : (typesRes?.data?.data ?? typesRes?.data ?? [])
          setCountries(Array.isArray(countryList) ? countryList : [])
          setRestaurantTypes(Array.isArray(typeList) ? typeList : [])
        })
        .catch(() => {
          setCountries([])
          setRestaurantTypes([])
        })
    }
  }, [showAddForm, activeTab])

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

  const handleAddFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setAddFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (addFormErrors[name]) setAddFormErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validateAddForm = () => {
    const err = {}
    if (!addFormData.name?.trim()) err.name = t('common.required')
    if (!addFormData.country_id) err.country_id = t('common.required')
    if (!addFormData.restaurant_type_id) err.restaurant_type_id = t('common.required')
    if (!addFormData.address?.trim()) err.address = t('common.required')
    if (!addFormData.phone?.trim()) err.phone = t('common.required')
    setAddFormErrors(err)
    return Object.keys(err).length === 0
  }

  const handleAddRestaurantSubmit = async (e) => {
    e.preventDefault()
    if (!validateAddForm() || submitting) return
    setSubmitting(true)
    try {
      const payload = {
        country_id: Number(addFormData.country_id),
        restaurant_type_id: Number(addFormData.restaurant_type_id),
        name: { en: addFormData.name?.trim() || '', vn: addFormData.name?.trim() || '' },
        description: { en: addFormData.description?.trim() || '' },
        city: addFormData.city?.trim() || '',
        address: addFormData.address?.trim() || '',
        phone: addFormData.phone?.trim() || '',
        zalo: addFormData.zalo?.trim() || '',
        email: addFormData.email?.trim() || '',
        latitude: addFormData.latitude ? parseFloat(addFormData.latitude) : undefined,
        longitude: addFormData.longitude ? parseFloat(addFormData.longitude) : undefined,
        delivery_available: !!addFormData.delivery_available,
      }
      await restaurantApi.createRestaurant(payload)
      toast.success(t('common.success'))
      setAddFormData(initialFormData)
      setShowAddForm(false)
      if (user?.id) fetchData()
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const closeAddForm = () => {
    setShowAddForm(false)
    setAddFormData(initialFormData)
    setAddFormErrors({})
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
          {/* Nút mở form Add Restaurant */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowAddForm((v) => !v)}
              className="btn btn-primary inline-flex items-center gap-2"
            >
              {showAddForm ? <X size={18} /> : <Plus size={18} />}
              {showAddForm ? t('common.cancel') : t('owner.addRestaurant')}
            </button>
          </div>

          {/* Form Add Restaurant */}
          {showAddForm && (
            <div className="card p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('owner.addRestaurant')}</h2>
              <form onSubmit={handleAddRestaurantSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('restaurant.title')} (name) *</label>
                    <input
                      type="text"
                      name="name"
                      value={addFormData.name}
                      onChange={handleAddFormChange}
                      className={`input w-full ${addFormErrors.name ? 'border-red-500' : ''}`}
                      placeholder="Restaurant name"
                    />
                    {addFormErrors.name && <p className="mt-1 text-sm text-red-600">{addFormErrors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('restaurant.detail')} (description)</label>
                    <input
                      type="text"
                      name="description"
                      value={addFormData.description}
                      onChange={handleAddFormChange}
                      className="input w-full"
                      placeholder="Short description"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                    <select
                      name="country_id"
                      value={addFormData.country_id}
                      onChange={handleAddFormChange}
                      className={`input w-full ${addFormErrors.country_id ? 'border-red-500' : ''}`}
                    >
                      <option value="">{t('common.filter')}...</option>
                      {countries.map((c) => (
                        <option key={c.id} value={c.id}>{c.name ?? c.name_en ?? c.code ?? c.id}</option>
                      ))}
                    </select>
                    {addFormErrors.country_id && <p className="mt-1 text-sm text-red-600">{addFormErrors.country_id}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant type *</label>
                    <select
                      name="restaurant_type_id"
                      value={addFormData.restaurant_type_id}
                      onChange={handleAddFormChange}
                      className={`input w-full ${addFormErrors.restaurant_type_id ? 'border-red-500' : ''}`}
                    >
                      <option value="">{t('common.filter')}...</option>
                      {restaurantTypes.map((rt) => (
                        <option key={rt.id} value={rt.id}>{rt.name ?? rt.name_en ?? rt.type ?? rt.id}</option>
                      ))}
                    </select>
                    {addFormErrors.restaurant_type_id && <p className="mt-1 text-sm text-red-600">{addFormErrors.restaurant_type_id}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('restaurant.address')} *</label>
                  <input
                    type="text"
                    name="address"
                    value={addFormData.address}
                    onChange={handleAddFormChange}
                    className={`input w-full ${addFormErrors.address ? 'border-red-500' : ''}`}
                    placeholder="Street address"
                  />
                  {addFormErrors.address && <p className="mt-1 text-sm text-red-600">{addFormErrors.address}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={addFormData.city}
                      onChange={handleAddFormChange}
                      className="input w-full"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('restaurant.phone')} *</label>
                    <input
                      type="text"
                      name="phone"
                      value={addFormData.phone}
                      onChange={handleAddFormChange}
                      className={`input w-full ${addFormErrors.phone ? 'border-red-500' : ''}`}
                      placeholder="Phone"
                    />
                    {addFormErrors.phone && <p className="mt-1 text-sm text-red-600">{addFormErrors.phone}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('restaurant.zalo')}</label>
                    <input
                      type="text"
                      name="zalo"
                      value={addFormData.zalo}
                      onChange={handleAddFormChange}
                      className="input w-full"
                      placeholder="Zalo"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={addFormData.email}
                      onChange={handleAddFormChange}
                      className="input w-full"
                      placeholder="restaurant@example.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                    <input
                      type="text"
                      name="latitude"
                      value={addFormData.latitude}
                      onChange={handleAddFormChange}
                      className="input w-full"
                      placeholder="10.7769"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                    <input
                      type="text"
                      name="longitude"
                      value={addFormData.longitude}
                      onChange={handleAddFormChange}
                      className="input w-full"
                      placeholder="106.7009"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="delivery_available"
                    name="delivery_available"
                    checked={addFormData.delivery_available}
                    onChange={handleAddFormChange}
                    className="w-4 h-4 rounded border-gray-300 text-primary-600"
                  />
                  <label htmlFor="delivery_available" className="text-sm font-medium text-gray-700">{t('restaurant.delivery')}</label>
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" disabled={submitting} className="btn btn-primary">
                    {submitting ? t('common.loading') : t('common.save')}
                  </button>
                  <button type="button" onClick={closeAddForm} className="btn btn-outline">
                    {t('common.cancel')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {(!Array.isArray(restaurants) || restaurants.length === 0) && !showAddForm ? (
            <div className="card p-6 sm:p-12 text-center">
              <Store size={40} className="mx-auto text-gray-400 mb-3 sm:mb-4" />
              <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">{t('common.noData')}</p>
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="btn btn-primary inline-flex items-center gap-2 text-sm sm:text-base"
              >
                <Store size={18} className="flex-shrink-0" />
                {t('owner.addRestaurant')}
              </button>
            </div>
          ) : Array.isArray(restaurants) && restaurants.length > 0 ? (
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
          ) : null}
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
