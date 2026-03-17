/**
 * Geocoding API - Google Geocoding API (requires API key).
 */

// NOTE:
// - In dev, call via Vite proxy to avoid CORS: `/google-maps/...` (see `vite.config.js`).
// - In production, calling Google Geocoding directly from browser may be blocked by CORS;
//   prefer calling from your backend and proxy the request.
const GOOGLE_GEOCODE_BASE =
  import.meta?.env?.DEV
    ? '/google-maps/maps/api/geocode/json'
    : 'https://maps.googleapis.com/maps/api/geocode/json'

const normalizeQuery = (q) => {
  const s = String(q || '').trim()
  if (!s) return ''
  // Photon đôi khi không match tốt với tiền tố tiếng Việt kiểu "số", "ngõ/ngách", ký hiệu viết tắt...
  // Nên thử thêm vài biến thể query "đơn giản" hơn.
  return s
    .replace(/\b(số|so)\s+/gi, '')
    .replace(/\b(ngõ|ngo|ngach|ngách)\s+/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const buildQueryVariants = (q) => {
  const base = String(q || '').trim()
  const simple = normalizeQuery(base)
  const withCountry = base && !/vietnam|việt\s*nam/i.test(base) ? `${base}, Vietnam` : base
  const simpleWithCountry = simple && !/vietnam|việt\s*nam/i.test(simple) ? `${simple}, Vietnam` : simple
  const variants = [base, withCountry, simple, simpleWithCountry]
    .map((x) => String(x || '').trim())
    .filter(Boolean)
  // unique (preserve order)
  return [...new Set(variants)]
}

const googleGeocode = async (address) => {
  const key = import.meta?.env?.VITE_GOOGLE_MAPS_API_KEY ?? 'AIzaSyDrNcRp0IiI_4tqDwHAjime8FLvK2gRcAQ'
  console.log(key);
  
  if (!key) {
    if (import.meta?.env?.DEV) {
      // eslint-disable-next-line no-console
      console.warn('[geocode] Missing VITE_GOOGLE_MAPS_API_KEY; returning null')
    }
    return null
  }

  const params = new URLSearchParams({
    address,
    key,
    language: 'vi',
    region: 'vn',
  })

  let res
  try {
    res = await fetch(`${GOOGLE_GEOCODE_BASE}?${params}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    })
  } catch (err) {
    if (import.meta?.env?.DEV) {
      // eslint-disable-next-line no-console
      console.warn('[geocode] Fetch failed (likely CORS/network)', { address, err })
    }
    return null
  }

  if (!res.ok) {
    if (import.meta?.env?.DEV) {
      // eslint-disable-next-line no-console
      console.warn('[geocode] HTTP not OK', { address, status: res.status, statusText: res.statusText })
    }
    return null
  }

  const data = await res.json()

  if (data?.status !== 'OK' || !Array.isArray(data?.results) || data.results.length === 0) {
    if (import.meta?.env?.DEV) {
      // eslint-disable-next-line no-console
      console.warn('[geocode] Google status not OK', { address, ...data })
    }
    return null
  }
  const first = data.results[0]
  const loc = first?.geometry?.location
  const lat = parseFloat(loc?.lat)
  const lng = parseFloat(loc?.lng)
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null

  return {
    lat,
    lng,
    displayName: first?.formatted_address || '',
  }
}

/**
 * Chuyển địa chỉ (text) thành tọa độ lat/lng.
 * @param {string} query - Địa chỉ cần tìm (vd: "123 Nguyễn Huệ, Quận 1, TP.HCM")
 * @returns {Promise<{ lat: number, lng: number, displayName: string } | null>}
 */
export const geocodeAddress = async (query) => {
  const q = String(query || '').trim()
  if (!q) return null

  const variants = buildQueryVariants(q)
  for (const v of variants) {
    const fromGoogle = await googleGeocode(v)
    if (fromGoogle) return fromGoogle
  }

  return null
}
