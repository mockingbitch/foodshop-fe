import { STORAGE_KEYS } from '@constants'

/**
 * Get item from localStorage
 */
export const getItem = (key) => {
  try {
    const item = localStorage.getItem(key)
    if (item == null || item === 'undefined' || item === 'null') return null
    return JSON.parse(item)
  } catch {
    return null
  }
}

/**
 * Set item to localStorage
 */
export const setItem = (key, value) => {
  try {
    if (value === undefined) {
      localStorage.removeItem(key)
      return true
    }
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

/**
 * Remove item from localStorage
 */
export const removeItem = (key) => {
  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.error(`Error removing item ${key} from localStorage:`, error)
    return false
  }
}

/**
 * Clear all items from localStorage
 */
export const clearStorage = () => {
  try {
    localStorage.clear()
    return true
  } catch (error) {
    console.error('Error clearing localStorage:', error)
    return false
  }
}

/**
 * Get auth token
 */
export const getAuthToken = () => {
  return getItem(STORAGE_KEYS.AUTH_TOKEN)
}

/**
 * Set auth token
 */
export const setAuthToken = (token) => {
  return setItem(STORAGE_KEYS.AUTH_TOKEN, token)
}

/**
 * Remove auth token
 */
export const removeAuthToken = () => {
  return removeItem(STORAGE_KEYS.AUTH_TOKEN)
}

/**
 * Get user data
 */
export const getUserData = () => {
  return getItem(STORAGE_KEYS.USER_DATA)
}

/**
 * Set user data
 */
export const setUserData = (userData) => {
  return setItem(STORAGE_KEYS.USER_DATA, userData)
}

/**
 * Remove user data
 */
export const removeUserData = () => {
  return removeItem(STORAGE_KEYS.USER_DATA)
}

/**
 * Get language
 */
export const getLanguage = () => {
  return getItem(STORAGE_KEYS.LANGUAGE) || 'en'
}

/**
 * Set language
 */
export const setLanguage = (language) => {
  return setItem(STORAGE_KEYS.LANGUAGE, language)
}

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!getAuthToken()
}
