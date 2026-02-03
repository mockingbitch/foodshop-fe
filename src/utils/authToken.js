/**
 * Access Token — lưu trong memory + cookie (để reload vẫn còn).
 * Cookie: path=/, SameSite=Lax, max-age tùy backend (mặc định 24h).
 * Lưu ý: cookie set từ JS không phải HttpOnly → JS có thể đọc (tương tự sessionStorage).
 *
 * Refresh Token — React KHÔNG lưu, nằm trong HttpOnly Cookie (backend set).
 */

const COOKIE_NAME = 'access_token'
const COOKIE_MAX_AGE = 24 * 60 * 60 // 24h (giây)

let memoryToken = null

function getCookie(name) {
  try {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
    const value = match ? decodeURIComponent(match[2].trim()) : null
    return value && value !== 'null' ? value : null
  } catch {
    return null
  }
}

function setCookie(name, value, maxAge = COOKIE_MAX_AGE) {
  try {
    const encoded = value ? encodeURIComponent(value) : ''
    const parts = [
      `${name}=${encoded}`,
      'path=/',
      `max-age=${value ? maxAge : 0}`,
      'SameSite=Lax',
    ]
    if (typeof window !== 'undefined' && window.location?.protocol === 'https:') {
      parts.push('Secure')
    }
    document.cookie = parts.join('; ')
  } catch {
    // ignore
  }
}

function deleteCookie(name) {
  setCookie(name, null, 0)
}

/** Gọi 1 lần khi app load: khôi phục access token từ cookie vào memory (nếu có). */
export const restoreToken = () => {
  if (memoryToken) return memoryToken
  memoryToken = getCookie(COOKIE_NAME)
  return memoryToken
}

export const getToken = () => memoryToken

export const setToken = (token) => {
  const v = token && typeof token === 'string' ? token : null
  memoryToken = v
  if (v) setCookie(COOKIE_NAME, v)
  else deleteCookie(COOKIE_NAME)
}

export const clearToken = () => {
  memoryToken = null
  deleteCookie(COOKIE_NAME)
}

export const hasToken = () => !!memoryToken
