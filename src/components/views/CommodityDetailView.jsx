import {
  formatCurrency,
  formatRelativeTime,
  getInitials,
} from '../../lib/market'

function formatMonthLabel(value) {
  return new Intl.DateTimeFormat('id-ID', {
    month: 'short',
  }).format(new Date(value))
}

export default function CommodityDetailView({ commodity }) {
  if (!commodity) {
    return null
  }

  const verificationReports = [...commodity.entries]
    .sort((left, right) => new Date(right.tanggal) - new Date(left.tanggal))
    .slice(0, 10)
  const monthlySeries = [...commodity.entries]
    .sort((left, right) => new Date(left.tanggal) - new Date(right.tanggal))
    .reduce((series, entry) => {
      const entryDate = new Date(entry.tanggal)
      const monthKey = `${entryDate.getFullYear()}-${String(entryDate.getMonth() + 1).padStart(2, '0')}`
      const current = series.get(monthKey)

      if (!current || entryDate > new Date(current.tanggal)) {
        series.set(monthKey, entry)
      }

      return series
    }, new Map())

  const chartData = [...monthlySeries.values()].slice(-6)
  const priceValues = chartData.map((entry) => entry.harga)
  const rawMinPrice = priceValues.length > 0 ? Math.min(...priceValues) : commodity.min
  const rawMaxPrice = priceValues.length > 0 ? Math.max(...priceValues) : commodity.max
  const minPrice = Math.floor(rawMinPrice / 1000) * 1000
  const maxPrice = Math.ceil(rawMaxPrice / 1000) * 1000
  const resolvedMaxPrice = maxPrice === minPrice ? maxPrice + 1000 : maxPrice
  const yTicks = []

  for (let value = minPrice; value <= resolvedMaxPrice; value += 1000) {
    yTicks.push(value)
  }

  const chartWidth = 100
  const chartHeight = 100
  const xStep = chartData.length > 1 ? chartWidth / (chartData.length - 1) : 0
  const chartPoints = chartData.map((entry, index) => {
    const ratio = (entry.harga - minPrice) / (resolvedMaxPrice - minPrice)
    return {
      x: chartData.length > 1 ? index * xStep : chartWidth / 2,
      y: chartHeight - ratio * chartHeight,
      label: formatMonthLabel(entry.tanggal),
      harga: entry.harga,
    }
  })
  const linePoints = chartPoints.map((point) => `${point.x},${point.y}`).join(' ')
  const areaPoints = linePoints ? `${linePoints} ${chartWidth},${chartHeight} 0,${chartHeight}` : ''

  return (
    <div className="view-stack">
      <section className="detail-hero">
        <div className="detail-hero__media tone-block tone-block--soft">
          <span className="material-symbols-outlined">{commodity.icon}</span>
        </div>
        <div className="detail-hero__body">
          <p className="eyebrow">{commodity.category}</p>
          <h3>{commodity.name}</h3>
          <div className="detail-price">
            <strong>{formatCurrency(commodity.latest.harga)}</strong>
            <span>{commodity.unit}</span>
          </div>
          <div className={`trend-chip trend-${commodity.trend}`}>
            <span className="material-symbols-outlined">
              {commodity.trend === 'up'
                ? 'arrow_upward'
                : commodity.trend === 'down'
                  ? 'arrow_downward'
                  : 'horizontal_rule'}
            </span>
            {commodity.deltaPercent}% vs catatan sebelumnya
          </div>
        </div>
      </section>

      <section className="commodity-detail-grid">
        <article className="surface-card">
          <div className="section-head">
            <div>
              <p className="eyebrow">Price Trend</p>
              <h3>Riwayat harga terbaru</h3>
            </div>
          </div>
          <div className="chart-card chart-card--detailed">
            <div
              className="chart-card__axis"
              style={{ gridTemplateRows: `repeat(${yTicks.length}, minmax(0, 1fr))` }}
            >
              {yTicks.slice().reverse().map((tick) => (
                <span key={tick}>{formatCurrency(tick)}</span>
              ))}
            </div>
            <div className="chart-card__stage">
              <svg viewBox="0 0 100 120" preserveAspectRatio="none" className="w-full h-full">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {yTicks.map((tick) => {
                  const ratio = (tick - minPrice) / (resolvedMaxPrice - minPrice)
                  const y = chartHeight - ratio * chartHeight

                  return (
                    <line
                      key={tick}
                      x1="0"
                      y1={y}
                      x2={chartWidth}
                      y2={y}
                      stroke="rgba(108, 122, 113, 0.18)"
                      strokeWidth="0.8"
                    />
                  )
                })}
                {areaPoints ? (
                  <polyline
                    fill="url(#chartGradient)"
                    stroke="none"
                    points={areaPoints}
                  />
                ) : null}
                {linePoints ? (
                  <polyline
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    points={linePoints}
                  />
                ) : null}
                {chartPoints.map((point) => (
                  <circle
                    key={`${point.label}-${point.harga}`}
                    cx={point.x}
                    cy={point.y}
                    r="2.2"
                    fill="white"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                ))}
                {chartPoints.map((point) => (
                  <text
                    key={`${point.label}-label`}
                    x={point.x}
                    y="113"
                    textAnchor="middle"
                    fontSize="5"
                    fill="currentColor"
                    opacity="0.75"
                  >
                    {point.label}
                  </text>
                ))}
              </svg>
            </div>
          </div>
        </article>

        <article className="surface-card commodity-reports-card">
          <div className="section-head">
            <div>
              <p className="eyebrow">Community Verification</p>
              <h3>Laporan pengguna terbaru</h3>
            </div>
          </div>
          <div className="commodity-reports-list">
            {verificationReports.map((report, index) => (
              <article className="verification-card" key={report._id ?? `${commodity.name}-${index}`}>
                <div className="verification-card__head">
                  <div className="verification-badge">
                    {getInitials(report.reportedBy?.username || report.sumber || 'SG')}
                  </div>
                  <div>
                    <strong>{report.reportedBy?.username || report.sumber || 'system'}</strong>
                    <p>{formatRelativeTime(report.tanggal)}</p>
                  </div>
                </div>
                <div className="verification-price">
                  {formatCurrency(report.harga)}
                  <span>{commodity.unit}</span>
                </div>
                <div className="tag-row">
                  <span>{report.lokasi || 'Lokasi tidak diketahui'}</span>
                  <span>{report.verifications ?? 0} verify</span>
                </div>
              </article>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}
