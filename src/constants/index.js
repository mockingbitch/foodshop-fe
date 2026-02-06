// API Configuration - lấy từ .env (VITE_API_BASE_URL). Sau khi sửa .env cần restart dev server (npm run dev).
// Dev: dùng /api để đi qua Vite proxy → tránh CORS khi backend chưa set Access-Control-Allow-Origin.
const _apiBase = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api'
export const API_BASE_URL = import.meta.env.DEV ? '/api' : String(_apiBase).replace(/\/+$/, '')
export const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 30000

// Upload Configuration
export const MAX_FILE_SIZE = import.meta.env.VITE_MAX_FILE_SIZE || 5242880 // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
export const MAX_RESTAURANT_OUTSIDE_IMAGES = 2
export const MAX_RESTAURANT_INSIDE_IMAGES = 5
export const MAX_FOOD_EXTRA_IMAGES = 5
export const MAX_CATEGORY_IMAGES = 5

// Map Configuration
export const DEFAULT_LAT = parseFloat(import.meta.env.VITE_DEFAULT_LAT) || 21.028511 // Hanoi
export const DEFAULT_LNG = parseFloat(import.meta.env.VITE_DEFAULT_LNG) || 105.804817
export const SEARCH_RADIUS_KM = parseInt(import.meta.env.VITE_SEARCH_RADIUS_KM) || 10

// App Configuration
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Food Shop'
export const DEFAULT_LANGUAGE = import.meta.env.VITE_DEFAULT_LANGUAGE || 'en'
export const SUPPORTED_LANGUAGES = ['en', 'vi', 'ko']

// Language Labels
export const LANGUAGE_LABELS = {
  en: 'English',
  vi: 'Tiếng Việt',
  ko: '한국어',
}

// User Roles
export const USER_ROLES = {
  OWNER: 'owner',
  RESTAURANT_OWNER: 'restaurant_owner',
  ADMIN: 'admin',
}

/** Các role được coi là owner (dashboard owner). */
export const OWNER_ROLES = ['owner', 'restaurant_owner']

// Restaurant Types
export const RESTAURANT_TYPES = {
  GENERAL: 'general',
  SNACK_BAR: 'snack_bar',
  BUFFET: 'buffet',
}

// Restaurant Status
export const RESTAURANT_STATUS = {
  ACTIVE: 'active',
  HIDDEN: 'hidden',
}

// Food Item Status
export const FOOD_STATUS = {
  ACTIVE: 'active',
  HIDDEN: 'hidden',
}

// Food Code Status
export const FOOD_CODE_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
}

// News/Course/Chef Types
export const NEWS_TYPES = {
  NEWS: 'news',
  COURSE: 'course',
  CHEF: 'chef',
}

// News Type Labels
export const NEWS_TYPE_LABELS = {
  news: 'News',
  course: 'Course',
  chef: 'Chef',
}

// Pagination
export const DEFAULT_PAGE_SIZE = 12
export const PAGE_SIZE_OPTIONS = [12, 24, 36, 48]

// Sort Options
export const SORT_OPTIONS = {
  NEWEST: 'newest',
  OLDEST: 'oldest',
  PRICE_LOW: 'price_low',
  PRICE_HIGH: 'price_high',
  RATING_HIGH: 'rating_high',
  NAME_AZ: 'name_az',
  NAME_ZA: 'name_za',
}

// Filter Options
export const FILTER_OPTIONS = {
  ALL: 'all',
  BEST_SELLER: 'best_seller',
  VEGETARIAN: 'vegetarian',
  DELIVERY_AVAILABLE: 'delivery_available',
}

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  LANGUAGE: 'language',
  THEME: 'theme',
}

// Date Formats
export const DATE_FORMATS = {
  FULL: 'PPP',
  SHORT: 'PP',
  TIME: 'p',
  DATETIME: 'PPp',
}

// Regex Patterns
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/,
  ZALO: /^[0-9]{9,11}$/,
}

// Error Messages (hiển thị cho user, không đổ full message từ backend)
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to access this resource.',
  FORBIDDEN: 'Access forbidden.',
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  FILE_TOO_LARGE: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
  INVALID_FILE_TYPE: 'Invalid file type. Please upload an image file.',
}

/**
 * Trả về key dịch lỗi (errors.xxx) để hiển thị đa ngôn ngữ qua t() hoặc translate().
 * @param {import('axios').AxiosError} error
 * @returns {string} key ví dụ 'errors.networkError'
 */
export function getErrorMessageKey(error) {
  if (!error?.response) return 'errors.networkError'
  const { status, data } = error.response
  switch (status) {
    case 401:
      return 'errors.unauthorized'
    case 403:
      return 'errors.forbidden'
    case 404:
      return 'errors.notFound'
    case 422:
      return 'errors.validationError'
    case 500:
    case 502:
    case 503:
      return 'errors.serverError'
    default:
      return 'errors.networkError'
  }
}

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  LOGOUT_SUCCESS: 'Logout successful!',
  REGISTER_SUCCESS: 'Registration successful!',
  UPDATE_SUCCESS: 'Update successful!',
  CREATE_SUCCESS: 'Created successfully!',
  DELETE_SUCCESS: 'Deleted successfully!',
  UPLOAD_SUCCESS: 'Upload successful!',
}

// Exchange Rate API
export const EXCHANGE_RATE_API = import.meta.env.VITE_EXCHANGE_RATE_API || 
  'https://portal.vietcombank.com.vn/Usercontrols/TVPortal.TyGia/pXML.aspx'

// Currency Codes
export const CURRENCY_CODES = {
  USD: 'USD',
  VND: 'VND',
  KRW: 'KRW',
  EUR: 'EUR',
  GBP: 'GBP',
}

// Currency Symbols
export const CURRENCY_SYMBOLS = {
  USD: '$',
  VND: '₫',
  KRW: '₩',
  EUR: '€',
  GBP: '£',
}

export { DEFAULT_FOOD_IMAGE } from './images.js'
