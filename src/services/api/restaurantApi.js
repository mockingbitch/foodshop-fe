import axios from '@services/axios'

/**
 * Restaurants API - theo Postman FoodShop-API.
 * List: country_id, restaurant_type_id, delivery_available, search, per_page.
 * Search: name, per_page. Nearby: latitude, longitude, radius (1-100).
 * Owner list: per_page, page (includes hidden/disable).
 */
export const restaurantApi = {
  getRestaurants: (params) => axios.get('/restaurants', { params }),
  getOwnerRestaurants: (params) => axios.get('/owner/restaurants', { params }),
  searchRestaurants: (params) => axios.get('/restaurants/search', { params }),
  getNearbyRestaurants: (params) => axios.get('/restaurants/nearby', { params }),
  getRestaurantById: (id) => axios.get(`/restaurants/${id}`),

  createRestaurant: (data) => axios.post('/restaurants', data),
  updateRestaurant: (id, data) => axios.put(`/restaurants/${id}`, data),
  deleteRestaurant: (id) => axios.delete(`/restaurants/${id}`),

  getRestaurantReviews: (restaurantId, params) =>
    axios.get(`/restaurants/${restaurantId}/reviews`, { params }),
  createRestaurantReview: (restaurantId, data) =>
    axios.post(`/restaurants/${restaurantId}/reviews`, data),
  getRestaurantMenus: (restaurantId) =>
    axios.get(`/restaurants/${restaurantId}/menus`),
}
