import axios from '@services/axios'

export const commonApi = {
  // Languages
  getLanguages: () => {
    return axios.get('/languages')
  },

  // Countries
  getCountries: (params) => {
    return axios.get('/countries', { params })
  },

  getCountryById: (id) => {
    return axios.get(`/countries/${id}`)
  },

  // Restaurant Types
  getRestaurantTypes: () => {
    return axios.get('/restaurant-types')
  },

  // Exchange Rates
  getExchangeRates: () => {
    return axios.get('/exchange-rates')
  },

  // Reviews
  getReviews: (type, id, params) => {
    if (type === 'food') {
      return axios.get(`/food-items/${id}/reviews`, { params })
    } else if (type === 'restaurant') {
      return axios.get(`/restaurants/${id}/reviews`, { params })
    }
  },

  createReview: (type, id, data) => {
    if (type === 'food') {
      return axios.post(`/food-items/${id}/reviews`, data)
    } else if (type === 'restaurant') {
      return axios.post(`/restaurants/${id}/reviews`, data)
    }
  },

  // Menu
  getMenus: (restaurantId) => {
    return axios.get(`/restaurants/${restaurantId}/menus`)
  },

  getMenuById: (id) => {
    return axios.get(`/menus/${id}`)
  },

  createMenu: (data) => {
    return axios.post('/menus', data)
  },

  updateMenu: (id, data) => {
    return axios.put(`/menus/${id}`, data)
  },

  deleteMenu: (id) => {
    return axios.delete(`/menus/${id}`)
  },

  // Search
  searchRestaurants: (params) => {
    return axios.get('/search/restaurants', { params })
  },

  searchFoodItems: (params) => {
    return axios.get('/search/food-items', { params })
  },

  searchFoodByCategory: (params) => {
    return axios.get('/search/food-items/by-category', { params })
  },

  searchByDistance: (params) => {
    return axios.get('/search/restaurants/by-distance', { params })
  },
}
