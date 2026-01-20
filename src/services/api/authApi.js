import axios from '@services/axios'

export const authApi = {
  // Owner Authentication
  registerOwner: (data) => {
    return axios.post('/owner/register', data)
  },

  loginOwner: (credentials) => {
    return axios.post('/owner/login', credentials)
  },

  // Admin Authentication
  loginAdmin: (credentials) => {
    return axios.post('/admin/login', credentials)
  },

  // Common
  logout: () => {
    return axios.post('/auth/logout')
  },

  me: () => {
    return axios.get('/auth/me')
  },

  // Owner Profile
  updateOwnerProfile: (data) => {
    return axios.put('/owner/profile', data)
  },
}
