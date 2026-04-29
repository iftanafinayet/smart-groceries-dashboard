const commodityMeta = {
  beras: { icon: 'rice_bowl', tone: 'gold', unit: '/ kg', category: 'Beras' },
  gula: { icon: 'cookie', tone: 'white', unit: '/ kg', category: 'Gula Pasir' },
  minyak: { icon: 'water_drop', tone: 'orange', unit: '/ Liter', category: 'Minyak Goreng & Mentega' },
  daging: { icon: 'set_meal', tone: 'red', unit: '/ kg', category: 'Daging Sapi & Daging Ayam' },
  telur: { icon: 'egg', tone: 'yellow-light', unit: '/ kg', category: 'Telur Ayam' },
  susu: { icon: 'glass_cup', tone: 'blue', unit: '/ Liter', category: 'Susu' },
  jagung: { icon: 'grass', tone: 'yellow', unit: '/ kg', category: 'Jagung' },
  elpiji: { icon: 'propane_tank', tone: 'purple', unit: '/ Tabung', category: 'Minyak Tanah atau Gas ELPIJI' },
  garam: { icon: 'scatter_plot', tone: 'gray', unit: '/ kg', category: 'Garam Beriodium' },
}

export const spotlightOrder = [
  'Beras',
  'Gula Pasir',
  'Minyak Goreng & Mentega',
  'Daging Sapi & Daging Ayam',
  'Telur Ayam',
  'Susu',
  'Jagung',
  'Minyak Tanah atau Gas ELPIJI',
  'Garam Beriodium',
]

export function formatCurrency(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 'Rp0'
  }

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDate(value) {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function formatRelativeTime(value) {
  if (!value) {
    return '-'
  }

  const diffMs = new Date(value).getTime() - Date.now()
  const diffMinutes = Math.round(diffMs / 60000)
  const formatter = new Intl.RelativeTimeFormat('id-ID', { numeric: 'auto' })

  if (Math.abs(diffMinutes) < 60) {
    return formatter.format(diffMinutes, 'minute')
  }

  const diffHours = Math.round(diffMinutes / 60)
  if (Math.abs(diffHours) < 24) {
    return formatter.format(diffHours, 'hour')
  }

  const diffDays = Math.round(diffHours / 24)
  return formatter.format(diffDays, 'day')
}

export function getCommodityMeta(name = '') {
  const lowerName = name.toLowerCase()
  const key = Object.keys(commodityMeta).find((item) => lowerName.includes(item))
  return key
    ? commodityMeta[key]
    : { icon: 'shopping_basket', tone: 'neutral', unit: '', category: 'General Goods' }
}

function buildSparkline(index, total) {
  const base = [28, 42, 36, 54, 62, 48]
  return base.map((value, offset) => {
    const adjustment = ((index + offset + total) % 4) * 6
    return Math.max(18, Math.min(90, value + adjustment - index * 2))
  })
}

export function getInitials(value = '') {
  const parts = value.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) {
    return 'SG'
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

export function summarisePrices(prices) {
  const groups = new Map()

  prices.forEach((price) => {
    const name = price.komoditas ?? 'Komoditas'
    const record = groups.get(name) ?? {
      name,
      entries: [],
      latest: price,
      min: price.harga,
      max: price.harga,
    }

    record.entries.push(price)
    record.min = Math.min(record.min, price.harga)
    record.max = Math.max(record.max, price.harga)

    if (new Date(price.tanggal) > new Date(record.latest.tanggal)) {
      record.latest = price
    }

    groups.set(name, record)
  })

  return [...groups.values()]
    .map((group, index, items) => {
      const sortedEntries = [...group.entries].sort(
        (left, right) => new Date(right.tanggal) - new Date(left.tanggal),
      )
      const latest = sortedEntries[0]
      const previous = sortedEntries[1]
      const deltaValue = previous ? latest.harga - previous.harga : 0
      const deltaPercent =
        previous && previous.harga
          ? Number(((deltaValue / previous.harga) * 100).toFixed(1))
          : 0
      const meta = getCommodityMeta(group.name)

      return {
        ...group,
        latest,
        previous,
        deltaValue,
        deltaPercent,
        trend: deltaPercent > 0 ? 'up' : deltaPercent < 0 ? 'down' : 'steady',
        ...meta,
        sparkline: buildSparkline(index, items.length),
      }
    })
    .sort((left, right) => {
      const leftPriority = spotlightOrder.indexOf(left.name)
      const rightPriority = spotlightOrder.indexOf(right.name)

      if (leftPriority === -1 && rightPriority === -1) {
        return new Date(right.latest.tanggal) - new Date(left.latest.tanggal)
      }

      if (leftPriority === -1) return 1
      if (rightPriority === -1) return -1
      return leftPriority - rightPriority
    })
}
