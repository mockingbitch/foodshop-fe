import axios from '@services/axios'

/**
 * Food Categories API - theo Postman FoodShop-API.
 * List: root_only, parent_id. Get: /:id?lang=en.
 * Create/Update/Delete, Add Translation: POST /:id/translations.
 */
export const categoryApi = {
  getCategories: (params) => axios.get('/food-categories', { params }),
  getCategoryById: (id, params) => axios.get(`/food-categories/${id}`, { params }),

  createCategory: (data) => axios.post('/food-categories', data),
  updateCategory: (id, data) => axios.put(`/food-categories/${id}`, data),
  deleteCategory: (id) => axios.delete(`/food-categories/${id}`),
  addCategoryTranslation: (id, data) =>
    axios.post(`/food-categories/${id}/translations`, data),
}
