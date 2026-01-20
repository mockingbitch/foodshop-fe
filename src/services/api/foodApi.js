import axios from '@services/axios'

export const foodApi = {
  // Public APIs
  getFoodItems: (params) => {
    return axios.get('/food-items', { params })
  },

  searchFoodItems: (params) => {
    return axios.get('/food-items/search', { params })
  },

  getFoodItemsByCategory: (categoryId, params) => {
    return axios.get(`/food-items/by-category/${categoryId}`, { params })
  },

  getBestSellerFoodItems: (params) => {
    return axios.get('/food-items/best-seller', { params })
  },

  getFoodItemById: (id) => {
    return axios.get(`/food-items/${id}`)
  },

  // Owner APIs
  createFoodItem: (data) => {
    return axios.post('/food-items', data)
  },

  updateFoodItem: (id, data) => {
    return axios.put(`/food-items/${id}`, data)
  },

  deleteFoodItem: (id) => {
    return axios.delete(`/food-items/${id}`)
  },

  confirmFoodCode: (id) => {
    return axios.post(`/food-items/${id}/confirm-code`)
  },

  // Admin APIs
  getPendingFoodCodes: (params) => {
    return axios.get('/admin/food-items/pending-codes', { params })
  },

  getRestaurantFoodItems: (restaurantId, params) => {
    return axios.get(`/admin/restaurants/${restaurantId}/food-items`, { params })
  },

  updateFoodItemStatus: (id, status) => {
    return axios.put(`/admin/food-items/${id}/status`, { status })
  },
}
