import axios from '@services/axios'

export const restaurantApi = {
  // Public APIs
  getRestaurants: (params) => {
    return axios.get('/restaurants', { params })
  },

  searchRestaurants: (params) => {
    return axios.get('/restaurants/search', { params })
  },

  getNearbyRestaurants: (params) => {
    return axios.get('/restaurants/nearby', { params })
  },

  getRestaurantById: (id) => {
    return axios.get(`/restaurants/${id}`)
  },

  // Owner APIs
  createRestaurant: (data) => {
    return axios.post('/restaurants', data)
  },

  updateRestaurant: (id, data) => {
    return axios.put(`/restaurants/${id}`, data)
  },

  deleteRestaurant: (id) => {
    return axios.delete(`/restaurants/${id}`)
  },

  // Admin APIs
  getAllRestaurants: (params) => {
    return axios.get('/admin/restaurants', { params })
  },

  updateRestaurantStatus: (id, status) => {
    return axios.put(`/admin/restaurants/${id}/status`, { status })
  },
}
