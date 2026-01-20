import axios from '@services/axios'

export const categoryApi = {
  // Public APIs
  getCategories: (params) => {
    return axios.get('/food-categories', { params })
  },

  getCategoryById: (id) => {
    return axios.get(`/food-categories/${id}`)
  },

  // Admin APIs
  createCategory: (data) => {
    return axios.post('/food-categories', data)
  },

  updateCategory: (id, data) => {
    return axios.put(`/food-categories/${id}`, data)
  },

  deleteCategory: (id) => {
    return axios.delete(`/food-categories/${id}`)
  },

  addTranslation: (id, data) => {
    return axios.post(`/food-categories/${id}/translations`, data)
  },
}
