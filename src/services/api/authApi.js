import axios from '@services/axios'

/**
 * Authentication API - theo Postman FoodShop-API.
 * Register Owner, Owner Login, Admin Login, Logout, Me, Update Owner Profile.
 */
export const authApi = {
  registerOwner: (data) => axios.post('/auth/owner/register', data),
  loginOwner: (credentials) => axios.post('/auth/owner/login', credentials),
  loginAdmin: (credentials) => axios.post('/auth/admin/login', credentials),
  logout: () => axios.post('/auth/logout'),
  me: () => axios.get('/auth/me'),
  updateOwnerProfile: (data) => axios.put('/owner/profile', data),
}
