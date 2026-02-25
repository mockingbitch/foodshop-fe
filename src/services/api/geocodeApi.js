/**
 * Geocoding API - sử dụng Photon (Komoot), miễn phí, hỗ trợ CORS từ browser.
 * Dựa trên OpenStreetMap.
 */

const PHOTON_BASE = 'https://photon.komoot.io'

/**
 * Chuyển địa chỉ (text) thành tọa độ lat/lng.
 * @param {string} query - Địa chỉ cần tìm (vd: "123 Nguyễn Huệ, Quận 1, TP.HCM")
 * @returns {Promise<{ lat: number, lng: number, displayName: string } | null>}
 */
export const geocodeAddress = async (query) => {
  const q = String(query || '').trim()
  if (!q) return null

  const params = new URLSearchParams({
    q,
    limit: '1',
  })

  const res = await fetch(`${PHOTON_BASE}/api/?${params}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })

  if (!res.ok) throw new Error('Geocoding request failed')
  const data = await res.json()
  const features = data?.features
  if (!Array.isArray(features) || features.length === 0) return null

  const first = features[0]
  const coords = first?.geometry?.coordinates // GeoJSON: [lng, lat]
  if (!Array.isArray(coords) || coords.length < 2) return null

  const lng = parseFloat(coords[0])
  const lat = parseFloat(coords[1])
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null

  const props = first?.properties || {}
  const displayName = props.name || props.street || props.city || props.country || ''

  return {
    lat,
    lng,
    displayName,
  }
}
