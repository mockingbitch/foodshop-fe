import axios from '@services/axios'

/**
 * Food Items API - theo Postman FoodShop-API.
 * List: restaurant_id, category_id, best_seller, vegetarian, search, per_page.
 * Search: search, per_page. By Category: /by-category/:categoryId. Best-seller: restaurant_id, per_page.
 */
export const foodApi = {
  getFoodItems: (params) => axios.get('/food-items', { params }),
  searchFoodItems: (params) => axios.get('/food-items/search', { params }),
  getFoodItemsByCategory: (categoryId, params) =>
    axios.get(`/food-items/by-category/${categoryId}`, { params }),
  getBestSellerFoodItems: (params) => axios.get('/food-items/best-seller', { params }),
  getFoodItemById: (id) => axios.get(`/food-items/${id}`),

  createFoodItem: (data) => axios.post('/food-items', data),
  updateFoodItem: (id, data) => axios.put(`/food-items/${id}`, data),
  deleteFoodItem: (id) => axios.delete(`/food-items/${id}`),
  confirmFoodCode: (id) => axios.post(`/food-items/${id}/confirm-code`),

  getFoodItemReviews: (foodItemId, params) =>
    axios.get(`/food-items/${foodItemId}/reviews`, { params }),
  createFoodItemReview: (foodItemId, data) =>
    axios.post(`/food-items/${foodItemId}/reviews`, data),

  /** Postman Admin: Pending Food Codes - GET /api/food-items/pending-codes */
  getPendingFoodCodes: (params) => axios.get('/food-items/pending-codes', { params }),
}
