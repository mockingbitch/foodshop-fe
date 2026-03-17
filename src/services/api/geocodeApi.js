/**
 * Geocoding API - sử dụng Photon (Komoot), miễn phí, hỗ trợ CORS từ browser.
 * Dựa trên OpenStreetMap.
 */

const PHOTON_BASE = 'https://photon.komoot.io'

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

const photonSearch = async (q) => {
  const params = new URLSearchParams({
    q,
    limit: '1',
    lang: 'vi',
  })
  const res = await fetch(`${PHOTON_BASE}/api/?${params}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error('Geocoding request failed')
  return res.json()
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
    const data = await photonSearch(v)
    const features = data?.features
    if (!Array.isArray(features) || features.length === 0) continue

    const first = features[0]
    const coords = first?.geometry?.coordinates // GeoJSON: [lng, lat]
    if (!Array.isArray(coords) || coords.length < 2) continue

    const lng = parseFloat(coords[0])
    const lat = parseFloat(coords[1])
    if (Number.isNaN(lat) || Number.isNaN(lng)) continue

    const props = first?.properties || {}
    const displayName =
      props.name ||
      props.street ||
      props.city ||
      props.state ||
      props.country ||
      ''

    return { lat, lng, displayName }
  }

  return null
}
