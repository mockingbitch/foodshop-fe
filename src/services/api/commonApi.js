import axios from '@services/axios'

/**
 * Common/Reference API - theo Postman FoodShop-API.
 * Reference: languages, languages/:code, countries, countries/:id, restaurant-types.
 * Exchange: exchange-rates?date=, exchange-rates/convert.
 * Reviews/Menus/Search: wrapper cho food/restaurant.
 */
export const commonApi = {
  getLanguages: () => axios.get('/languages'),
  getLanguageByCode: (code) => axios.get(`/languages/${code}`),

  getCountries: (params) => axios.get('/countries', { params }),
  getCountryById: (id) => axios.get(`/countries/${id}`),

  getRestaurantTypes: () => axios.get('/restaurant-types'),

  getExchangeRates: (params) => axios.get('/exchange-rates', { params }),
  convertCurrency: (data) => axios.post('/exchange-rates/convert', data),

  getReviews: (type, id, params) => {
    if (type === 'food') return axios.get(`/food-items/${id}/reviews`, { params })
    if (type === 'restaurant') return axios.get(`/restaurants/${id}/reviews`, { params })
  },
  createReview: (type, id, data) => {
    if (type === 'food') return axios.post(`/food-items/${id}/reviews`, data)
    if (type === 'restaurant') return axios.post(`/restaurants/${id}/reviews`, data)
  },

  getMenus: (restaurantId) => axios.get(`/restaurants/${restaurantId}/menus`),
  getMenuById: (id) => axios.get(`/menus/${id}`),
  createMenu: (data) => axios.post('/menus', data),
  updateMenu: (id, data) => axios.put(`/menus/${id}`, data),
  deleteMenu: (id) => axios.delete(`/menus/${id}`),

  searchRestaurants: (params) => axios.get('/search/restaurants', { params }),
  searchFoodItems: (params) => axios.get('/search/food-items', { params }),
  searchFoodByCategory: (params) => axios.get('/search/food-items/by-category', { params }),
  searchByDistance: (params) => axios.get('/search/restaurants/by-distance', { params }),
}
