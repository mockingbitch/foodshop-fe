import axios from '@services/axios'

export const newsApi = {
  // Public APIs
  getNews: (params) => {
    return axios.get('/news', { params })
  },

  getNewsByType: (type, params) => {
    return axios.get(`/news/by-type/${type}`, { params })
  },

  getNewsById: (id) => {
    return axios.get(`/news/${id}`)
  },

  // Admin APIs
  createNews: (data) => {
    return axios.post('/news', data)
  },

  updateNews: (id, data) => {
    return axios.put(`/news/${id}`, data)
  },

  deleteNews: (id) => {
    return axios.delete(`/news/${id}`)
  },
}
