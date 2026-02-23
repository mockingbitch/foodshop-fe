import axios from '@services/axios'

/**
 * Food Categories API - theo Postman FoodShop-API.
 * List: root_only, parent_id. Get: /:id?lang=en.
 * Create/Update/Delete, Add Translation: POST /:id/translations.
 */
export const categoryApi = {
  getCategories: (params) => axios.get('/food-categories', { params }),
  getCategoryById: (id, params) => axios.get(`/food-categories/${id}`, { params }),

  createCategory: (data) => axios.post('/admin/food-categories', data),
  updateCategory: (id, data) => axios.put(`/admin/food-categories/${id}`, data),
  deleteCategory: (id) => axios.delete(`/admin/food-categories/${id}`),
  addCategoryTranslation: (id, data) =>
    axios.post(`/admin/food-categories/${id}/translations`, data),
}
