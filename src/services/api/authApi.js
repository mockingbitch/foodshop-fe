import axios from '@services/axios'

/**
 * Auth API - paths match FoodShop backend (Postman collection).
 * baseURL = VITE_API_BASE_URL (e.g. http://localhost:8000/api)
 */
export const authApi = {
  // Owner Authentication
  registerOwner: (data) => {
    return axios.post('/auth/owner/register', data)
  },

  loginOwner: (credentials) => {
    return axios.post('/auth/owner/login', credentials)
  },

  // Admin Authentication
  loginAdmin: (credentials) => {
    return axios.post('/auth/admin/login', credentials)
  },

  // Common (axios đã withCredentials: true → cookie tự gửi)
  logout: () => {
    return axios.post('/auth/logout')
  },

  /** GET /auth/me với cookie (refresh token). Backend trả { user, token } (access token mới) → lưu token vào memory. */
  me: () => {
    return axios.get('/auth/me')
  },

  // Owner Profile
  updateOwnerProfile: (data) => {
    return axios.put('/owner/profile', data)
  },
}
