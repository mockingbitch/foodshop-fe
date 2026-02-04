import axios from '@services/axios'

/**
 * News API - theo Postman FoodShop-API.
 * List: type, search, per_page. By Type: /by-type/:type.
 */
export const newsApi = {
  getNews: (params) => axios.get('/news', { params }),
  getNewsByType: (type, params) => axios.get(`/news/by-type/${type}`, { params }),
  getNewsById: (id) => axios.get(`/news/${id}`),

  createNews: (data) => axios.post('/news', data),
  updateNews: (id, data) => axios.put(`/news/${id}`, data),
  deleteNews: (id) => axios.delete(`/news/${id}`),
}
