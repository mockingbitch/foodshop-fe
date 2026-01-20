import axios from '@services/axios'

export const adminApi = {
  // Dashboard
  getDashboardStats: () => {
    return axios.get('/admin/dashboard/stats')
  },

  // Restaurants Management
  getRestaurants: (params) => {
    return axios.get('/admin/restaurants', { params })
  },

  getRestaurantFoodItems: (id, params) => {
    return axios.get(`/admin/restaurants/${id}/food-items`, { params })
  },

  updateRestaurantStatus: (id, status) => {
    return axios.put(`/admin/restaurants/${id}/status`, { status })
  },

  updateFoodItemStatus: (id, status) => {
    return axios.put(`/admin/food-items/${id}/status`, { status })
  },

  // Food Code Management
  getPendingCodes: (params) => {
    return axios.get('/admin/food-codes/pending', { params })
  },

  confirmCode: (id) => {
    return axios.post(`/admin/food-codes/${id}/confirm`)
  },

  rejectCode: (id, reason) => {
    return axios.post(`/admin/food-codes/${id}/reject`, { reason })
  },
}
