/**
 * Access Token — lưu trong memory + cookie (để reload vẫn còn).
 * Cookie: path=/, SameSite=Lax.
 * - Ghi nhớ đăng nhập (remember): max-age 7 ngày + cookie remember_me.
 * - Không ghi nhớ: session cookie (hết phiên khi đóng trình duyệt).
 * Lưu ý: cookie set từ JS không phải HttpOnly → JS có thể đọc (tương tự sessionStorage).
 *
 * Refresh Token — React KHÔNG lưu, nằm trong HttpOnly Cookie (backend set).
 */

const COOKIE_NAME = 'access_token'
const REMEMBER_ME_COOKIE = 'remember_me'
const COOKIE_MAX_AGE_REMEMBER = 7 * 24 * 60 * 60 // 7 ngày (giây)

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

/**
 * @param {string} name
 * @param {string|null} value
 * @param {number|undefined} maxAge - giây. undefined = session cookie (đóng browser là hết).
 */
function setCookie(name, value, maxAge) {
  try {
    const encoded = value ? encodeURIComponent(value) : ''
    const parts = [`${name}=${encoded}`, 'path=/', 'SameSite=Lax']
    if (value && maxAge != null && maxAge > 0) {
      parts.push(`max-age=${maxAge}`)
    } else if (!value) {
      parts.push('max-age=0')
    }
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

/**
 * @param {string|null} token
 * @param {{ remember?: boolean }} [options] - remember: true = cookie 7 ngày + ghi nhớ user trong localStorage
 */
export const setToken = (token, options = {}) => {
  const v = token && typeof token === 'string' ? token : null
  memoryToken = v
  if (v) {
    const remember = !!options.remember
    if (remember) {
      setCookie(COOKIE_NAME, v, COOKIE_MAX_AGE_REMEMBER)
      setCookie(REMEMBER_ME_COOKIE, '1', COOKIE_MAX_AGE_REMEMBER)
    } else {
      setCookie(COOKIE_NAME, v) // session cookie, không truyền maxAge
    }
  } else {
    deleteCookie(COOKIE_NAME)
    deleteCookie(REMEMBER_ME_COOKIE)
  }
}

export const clearToken = () => {
  memoryToken = null
  deleteCookie(COOKIE_NAME)
  deleteCookie(REMEMBER_ME_COOKIE)
}

export const hasToken = () => !!memoryToken

/** Có đang dùng chế độ "ghi nhớ đăng nhập" (cookie 7 ngày) hay không. */
export const getRememberMe = () => !!getCookie(REMEMBER_ME_COOKIE)
