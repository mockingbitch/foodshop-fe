import axios from '@services/axios'

/**
 * Admin API - theo Postman FoodShop-API.
 * Dashboard Stats, List Restaurants (status, per_page), Restaurant Food Items, Update Restaurant/Food Item Status.
 * Pending Food Codes: dùng foodApi.getPendingFoodCodes (GET /food-items/pending-codes).
 */
export const adminApi = {
  getDashboardStats: () => axios.get('/admin/dashboard/stats'),

  getRestaurants: (params) => axios.get('/admin/restaurants', { params }),
  getRestaurantFoodItems: (restaurantId, params) =>
    axios.get(`/admin/restaurants/${restaurantId}/food-items`, { params }),
  updateRestaurantStatus: (id, status) =>
    axios.put(`/admin/restaurants/${id}/status`, { status }),

  updateFoodItemStatus: (id, status) =>
    axios.put(`/admin/food-items/${id}/status`, { status }),
}
