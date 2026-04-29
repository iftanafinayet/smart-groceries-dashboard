import { LOCATION_COORDINATES, PROVINCE_COORDINATES } from './constants'

function normalizeText(value) {
  return String(value ?? '').trim()
}

export function buildLocationLabel({ lokasi = '', kota = '', provinsi = '' }) {
  const explicitLocation = normalizeText(lokasi)
  if (explicitLocation) {
    return explicitLocation
  }

  return [normalizeText(kota), normalizeText(provinsi)].filter(Boolean).join(', ')
}

export function getCoordinatesForLocation({ kota = '', provinsi = '', lokasi = '' }) {
  const computedLocation = buildLocationLabel({ lokasi, kota, provinsi })
  if (LOCATION_COORDINATES[computedLocation]) {
    return LOCATION_COORDINATES[computedLocation]
  }

  const province = normalizeText(provinsi)
  if (PROVINCE_COORDINATES[province]) {
    return PROVINCE_COORDINATES[province]
  }

  return null
}

export function buildReportPayload(form) {
  const komoditas = normalizeText(form.komoditas)
  const provinsi = normalizeText(form.provinsi)
  const kota = normalizeText(form.kota)
  const lokasi = buildLocationLabel({ kota, provinsi, lokasi: form.lokasi })
  const coordinates = getCoordinatesForLocation({ kota, provinsi, lokasi })

  return {
    komoditas,
    harga: Number(form.harga),
    lokasi,
    provinsi,
    kota,
    lat: coordinates?.lat ?? null,
    lng: coordinates?.lng ?? null,
    catatan: normalizeText(form.catatan),
  }
}

export function parseStructuredLocation(value = '') {
  const parts = normalizeText(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

  if (parts.length < 2) {
    return { city: '', province: '' }
  }

  return {
    city: parts[0],
    province: parts.slice(1).join(', '),
  }
}

export function getRegionOptionsFromReports(reports) {
  const provinceMap = new Map()

  reports.forEach((report) => {
    const { city, province } = parseStructuredLocation(report.lokasi)
    if (!city || !province) {
      return
    }

    const cities = provinceMap.get(province) ?? new Set()
    cities.add(city)
    provinceMap.set(province, cities)
  })

  const provinces = [...provinceMap.keys()].sort((left, right) => left.localeCompare(right, 'id-ID'))
  const citiesByProvince = Object.fromEntries(
    [...provinceMap.entries()].map(([province, cities]) => [
      province,
      [...cities].sort((left, right) => left.localeCompare(right, 'id-ID')),
    ]),
  )

  return { provinces, citiesByProvince }
}
