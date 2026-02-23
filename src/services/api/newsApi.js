import axios from '@services/axios'

/**
 * News API - theo Postman FoodShop-API.
 * List: type, search, per_page. By Type: /by-type/:type.
 */
export const newsApi = {
  getNews: (params) => axios.get('/news', { params }),
  getAdminNews: (params) => axios.get('/admin/news', { params }),
  getNewsByType: (type, params) => axios.get(`/news/by-type/${type}`, { params }),
  getNewsById: (id) => axios.get(`/news/${id}`),
  getAdminNewsById: (id) => axios.get(`/admin/news/${id}`),

  createNews: (data) => axios.post('/admin/news', data),
  updateNews: (id, data) => axios.put(`/admin/news/${id}`, data),
  deleteNews: (id) => axios.delete(`/admin/news/${id}`),
}
