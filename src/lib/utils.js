export function clampPercent(value) {
  if (!Number.isFinite(value)) {
    return 0
  }
  return Math.round(value * 10) / 10
}

export function toCsv(rows) {
  if (rows.length === 0) {
    return ''
  }

  const headers = Object.keys(rows[0])
  const escape = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`
  const lines = rows.map((row) => headers.map((header) => escape(row[header])).join(','))
  return [headers.join(','), ...lines].join('\n')
}

export function downloadTextFile(filename, content, type) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
