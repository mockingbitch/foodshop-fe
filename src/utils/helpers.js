import { format, formatDistance, formatRelative } from 'date-fns'
import { CURRENCY_SYMBOLS, REGEX_PATTERNS } from '@constants'

/**
 * Format price input with thousands separator (e.g. 1000000 -> 1,000,000)
 * Chỉ dùng khi nhập: quá 3 số thì thêm dấu ,
 */
export const formatPriceInput = (value) => {
  if (value == null || value === '') return ''
  const str = String(value)
  const parts = str.split('.')
  const intPart = parts[0].replace(/\D/g, '')
  const decPart = parts[1] != null ? parts[1].replace(/\D/g, '') : ''
  if (intPart === '') return decPart ? `0.${decPart}` : ''
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return decPart ? `${formatted}.${decPart}` : formatted
}

/**
 * Parse price string to number (remove commas)
 */
export const parsePriceValue = (value) => {
  if (value == null || value === '') return NaN
  const cleaned = String(value).replace(/,/g, '')
  return parseFloat(cleaned)
}

/**
 * Format currency with symbol
 */
export const formatCurrency = (amount, currency = 'USD') => {
  const symbol = CURRENCY_SYMBOLS[currency] || currency
  const formattedAmount = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
  
  if (currency === 'VND' || currency === 'KRW') {
    return `${formattedAmount}${symbol}`
  }
  return `${symbol}${formattedAmount}`
}

/**
 * Format date
 */
export const formatDate = (date, formatStr = 'PPP') => {
  if (!date) return ''
  return format(new Date(date), formatStr)
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date) => {
  if (!date) return ''
  return formatDistance(new Date(date), new Date(), { addSuffix: true })
}

/**
 * Format distance in km (e.g. "1.5km" or "500m")
 */
export const formatDistanceKm = (distanceInKm) => {
  if (distanceInKm < 1) {
    return `${Math.round(distanceInKm * 1000)}m`
  }
  return `${distanceInKm.toFixed(1)}km`
}

/**
 * Truncate text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Strip HTML tags to get plain text (e.g. for excerpt preview from WYSIWYG content)
 */
export const stripHtml = (html) => {
  if (!html || typeof html !== 'string') return ''
  if (typeof document === 'undefined') {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  }
  const div = document.createElement('div')
  div.innerHTML = html
  return (div.textContent || div.innerText || '').replace(/\s+/g, ' ').trim()
}

/**
 * Validate email
 */
export const isValidEmail = (email) => {
  return REGEX_PATTERNS.EMAIL.test(email)
}

/**
 * Validate phone
 */
export const isValidPhone = (phone) => {
  return REGEX_PATTERNS.PHONE.test(phone)
}

/**
 * Validate URL
 */
export const isValidUrl = (url) => {
  return REGEX_PATTERNS.URL.test(url)
}

/**
 * Validate Zalo
 */
export const isValidZalo = (zalo) => {
  return REGEX_PATTERNS.ZALO.test(zalo)
}

/**
 * Validate file size
 */
export const isValidFileSize = (file, maxSize) => {
  return file.size <= maxSize
}

/**
 * Validate file type
 */
export const isValidFileType = (file, allowedTypes) => {
  return allowedTypes.includes(file.type)
}

/**
 * Get image URL from path (relative or absolute)
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder-image.jpg'
  if (imagePath.startsWith('http')) return imagePath
  const base = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api').replace(/\/api\/?$/, '')
  return `${base}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`
}

/**
 * Parse image path/URL from upload API response
 */
export const getImageUrlFromUploadResponse = (res) => {
  const data = res?.data ?? res
  if (Array.isArray(data) && data[0]) return data[0]
  const urls = data?.urls ?? data?.images
  if (Array.isArray(urls) && urls[0]) return urls[0]
  const inner = data?.data
  if (inner && typeof inner === 'object') {
    const arr = inner?.urls ?? inner?.images
    if (Array.isArray(arr) && arr[0]) return arr[0]
  }
  const first = data?.data?.[0] ?? data?.[0]
  if (first && typeof first === 'string') return first
  if (first && typeof first === 'object') return first.url ?? first.path ?? first.src ?? null
  return null
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371 // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c // Distance in km
  return d
}

const deg2rad = (deg) => {
  return deg * (Math.PI / 180)
}

/**
 * Generate food code
 * Format: {COUNTRY_CODE}-{RESTAURANT_CODE}-{CATEGORY_CODE}-{FOOD_CODE}
 */
export const generateFoodCode = (countryCode, restaurantCode, categoryCode, foodCode) => {
  return `${countryCode}-${restaurantCode}-${categoryCode}-${foodCode}`
}

/**
 * Parse food code
 */
export const parseFoodCode = (foodCode) => {
  if (!foodCode) return null
  const parts = foodCode.split('-')
  if (parts.length !== 4) return null
  return {
    countryCode: parts[0],
    restaurantCode: parts[1],
    categoryCode: parts[2],
    foodCode: parts[3],
  }
}

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function
 */
export const throttle = (func, limit) => {
  let inThrottle
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Deep clone object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Get rating stars
 */
export const getRatingStars = (rating) => {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)
  
  return {
    full: fullStars,
    half: hasHalfStar ? 1 : 0,
    empty: emptyStars,
  }
}

/**
 * Generate slug from text
 */
export const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')
}

/**
 * Group array by key
 */
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key]
    if (!result[group]) {
      result[group] = []
    }
    result[group].push(item)
    return result
  }, {})
}

/**
 * Sort array by key
 */
export const sortBy = (array, key, order = 'asc') => {
  return [...array].sort((a, b) => {
    if (order === 'asc') {
      return a[key] > b[key] ? 1 : -1
    }
    return a[key] < b[key] ? 1 : -1
  })
}

/**
 * Get unique values from array
 */
export const unique = (array, key) => {
  if (key) {
    return [...new Map(array.map(item => [item[key], item])).values()]
  }
  return [...new Set(array)]
}

/**
 * Check if object is empty
 */
export const isEmpty = (obj) => {
  return Object.keys(obj).length === 0
}

/**
 * Sleep function for async operations
 */
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Copy to clipboard
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    return false
  }
}

/**
 * Download file
 */
export const downloadFile = (url, filename) => {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Non-empty trimmed string check (skip empty / whitespace-only for locale fallback)
 */
const isNonEmptyStr = (s) => typeof s === 'string' && s.trim() !== ''

/**
 * Chuẩn hoá giá trị đa ngôn ngữ từ API: object, mảng translations, hoặc chuỗi JSON.
 * Nhiều backend (vd. Laravel) serialize `{ en, vn, kr }` thành string — cần parse thì mới đổi theo ngôn ngữ.
 */
const normalizeMultilingualValue = (val) => {
  if (val == null) return null
  if (Array.isArray(val)) return { translations: val }
  if (typeof val === 'string') {
    const t = val.trim()
    if (!t) return null
    const looksJson = (t.startsWith('{') && t.endsWith('}')) || (t.startsWith('[') && t.endsWith(']'))
    if (looksJson) {
      try {
        const parsed = JSON.parse(t)
        if (Array.isArray(parsed)) return { translations: parsed }
        if (parsed && typeof parsed === 'object') return parsed
      } catch {
        return { __plain: t }
      }
    }
    return { __plain: t }
  }
  if (typeof val === 'object') return val
  return { __plain: String(val) }
}

/**
 * Get localized text from multilingual value based on language code.
 * Handles: string (plain or JSON), object { en, vn, vi, kr, ko }, translations array [{ language_code, name }]
 * Prefers `lang`, then falls back to any other non-empty string value.
 * @param val - The multilingual value (string, object, or translations array)
 * @param lang - App language: 'en' | 'vi' | 'ko'
 * @returns Localized string
 */
export const getLocalizedText = (val, lang) => {
  const normalized = normalizeMultilingualValue(val)
  if (normalized == null) return ''

  if (normalized.__plain != null && typeof normalized.__plain === 'string') {
    return normalized.__plain.trim()
  }

  const obj = normalized
  const langMap = {
    en: ['en', 'EN'],
    vi: ['vn', 'VN', 'vi', 'VI'],
    ko: ['kr', 'KR', 'ko', 'KO'],
  }
  const keys = langMap[lang] || ['en', 'EN']

  for (const k of keys) {
    if (isNonEmptyStr(obj[k])) return obj[k].trim()
  }

  const arr = obj.translations
  if (Array.isArray(arr)) {
    for (const item of arr) {
      const lc = String(item.language_code || item.languageCode || '').toUpperCase()
      const match =
        (lang === 'vi' && (lc === 'VN' || lc === 'VI')) ||
        (lang === 'ko' && (lc === 'KR' || lc === 'KO')) ||
        (lang === 'en' && lc === 'EN')
      if (match) {
        const n = item.name ?? item.description
        if (isNonEmptyStr(n)) return String(n).trim()
      }
    }
    const first = arr.find((x) => isNonEmptyStr(x.name))
    if (first) return String(first.name).trim()
  }

  const fallbackOrder = ['vn', 'vi', 'en', 'kr', 'ko', 'VN', 'VI', 'EN', 'KR', 'KO']
  for (const k of fallbackOrder) {
    if (isNonEmptyStr(obj[k])) return obj[k].trim()
  }

  const first = Object.entries(obj)
    .filter(([key]) => key !== 'translations' && key !== '__plain')
    .map(([, v]) => v)
    .find((x) => isNonEmptyStr(x))
  return first != null ? String(first).trim() : ''
}
