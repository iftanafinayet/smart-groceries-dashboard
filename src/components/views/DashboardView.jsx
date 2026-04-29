import { useMemo } from 'react'
import { formatCurrency, formatDate } from '../../lib/market'
import { STAPLE_FOODS } from '../../lib/constants'

function TrendBadge({ trend, deltaPercent }) {
  return (
    <span className={`trend-badge trend-${trend}`}>
      <span className="material-symbols-outlined">
        {trend === 'up' ? 'arrow_upward' : trend === 'down' ? 'arrow_downward' : 'horizontal_rule'}
      </span>
      {Math.abs(deltaPercent).toFixed(1)}%
    </span>
  )
}

export default function DashboardView({
  status,
  error,
  backendLabel,
  lastLoadedAt,
  totalReports,
  officialReports,
  userReports,
  locations,
  spotlightCards,
  latestReports,
  onRetry,
  onSelectCommodity,
  activeProvince,
  setActiveProvince,
  activeCity,
  setActiveCity,
  availableProvinces = [],
  availableCities = [],
}) {
  const filteredSpotlight = useMemo(() => {
    const staples = spotlightCards.filter((item) =>
      STAPLE_FOODS.some((food) => item.name.toLowerCase().includes(food.name.toLowerCase())),
    )

    return staples.map((commodity) => {
      const matchingReports = latestReports.filter((report) => {
        const matchesCommodity = report.komoditas === commodity.name
        const matchesProvince = activeProvince ? report.lokasi?.includes(activeProvince) : true
        const matchesCity = activeCity ? report.lokasi?.includes(activeCity) : true
        return matchesCommodity && matchesProvince && matchesCity
      })

      const latestLocal = matchingReports[0]

      return {
        ...commodity,
        latest: latestLocal || commodity.latest,
        isLocal: Boolean(latestLocal),
      }
    })
  }, [spotlightCards, latestReports, activeProvince, activeCity])

  const distributionSummary = useMemo(() => {
    if (filteredSpotlight.length === 0) {
      return {
        highest: null,
        lowest: null,
        averagePrice: 0,
      }
    }

    const sortedByPrice = [...filteredSpotlight].sort((left, right) => right.latest.harga - left.latest.harga)
    const totalPrice = filteredSpotlight.reduce((sum, item) => sum + (item.latest.harga || 0), 0)

    return {
      highest: sortedByPrice[0],
      lowest: sortedByPrice[sortedByPrice.length - 1],
      averagePrice: totalPrice / filteredSpotlight.length,
    }
  }, [filteredSpotlight])

  return (
    <div className="view-stack">
      {status === 'error' ? (
        <section className="hero-card hero-card--warning">
          <div>
            <p className="eyebrow">Connection Issue</p>
            <h3>Dashboard belum bisa mengambil data backend</h3>
            <p className="body-md text-on-surface-variant">{error}</p>
          </div>
          <button className="primary-button" type="button" onClick={onRetry}>
            <span className="material-symbols-outlined">refresh</span>
            <span>Coba lagi</span>
          </button>
        </section>
      ) : (
        <section className="hero-card">
          <div className="flex-1">
            <p className="eyebrow">Market Intelligence</p>
            <h3>Regional Overview</h3>
            <p className="body-md text-on-surface-variant">
              Monitoring harga sembako dari data official dan laporan terverifikasi pengguna.
            </p>
          </div>

          <div className="hero-card__meta">
            <span>Fetch terakhir: {lastLoadedAt ? formatDate(lastLoadedAt) : '-'}</span>
            <span>API: {backendLabel}</span>
          </div>
        </section>
      )}

      <section className="metric-grid">
        <article className="metric-card">
          <span className="material-symbols-outlined" data-weight="fill">
            monitoring
          </span>
          <div>
            <p>Total reports</p>
            <strong>{totalReports}</strong>
          </div>
        </article>
        <article className="metric-card">
          <span className="material-symbols-outlined" data-weight="fill">
            verified
          </span>
          <div>
            <p>Official source</p>
            <strong>{officialReports}</strong>
          </div>
        </article>
        <article className="metric-card">
          <span className="material-symbols-outlined" data-weight="fill">
            person_pin_circle
          </span>
          <div>
            <p>User reports</p>
            <strong>{userReports}</strong>
          </div>
        </article>
        <article className="metric-card">
          <span className="material-symbols-outlined" data-weight="fill">
            location_on
          </span>
          <div>
            <p>Lokasi aktif</p>
            <strong>{locations}</strong>
          </div>
        </article>
      </section>

      <section className="surface-card carousel-filter-card">
        <div className="section-head carousel-filter-head">
          <div>
            <p className="eyebrow">Commodity Filter</p>
            <h3>Filter carousel berdasarkan wilayah</h3>
          </div>
          <div className="carousel-filter-controls">
            <span className="material-symbols-outlined carousel-filter-icon">filter_list</span>
            <select
              className="select-field select-field--compact"
              value={activeProvince}
              onChange={(event) => {
                setActiveProvince(event.target.value)
                setActiveCity('')
              }}
            >
              <option value="">Semua Provinsi</option>
              {availableProvinces.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
            <select
              className="select-field select-field--compact"
              value={activeCity}
              onChange={(event) => setActiveCity(event.target.value)}
              disabled={!activeProvince}
            >
              <option value="">Semua Kota</option>
              {availableCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="carousel-container">
        <div className="carousel-track">
          {filteredSpotlight.map((item) => {
            const staple = STAPLE_FOODS.find((food) => item.name.toLowerCase().includes(food.name.toLowerCase()))
            return (
              <div key={item.name} className="carousel-item">
                <button
                  className={`spotlight-card spotlight-card--carousel tone-${item.tone}`}
                  type="button"
                  onClick={() => onSelectCommodity(item.name)}
                >
                  <div className="spotlight-card__header">
                    <div className="spotlight-card__title">
                      <div className="spotlight-icon">
                        <span className="material-symbols-outlined">{item.icon}</span>
                      </div>
                      <div className="spotlight-card__copy">
                        <h3 className="font-title-sm">
                          {item.name}
                          <span className="spotlight-card__unit">{staple?.unit ? ` / ${staple.unit}` : item.unit || ' / unit'}</span>
                        </h3>
                      </div>
                    </div>
                    <TrendBadge trend={item.trend} deltaPercent={item.deltaPercent} />
                  </div>

                  <div className="spotlight-price">
                    <strong>{formatCurrency(item.latest.harga)}</strong>
                    <span className={`text-xs ${item.isLocal ? 'text-success' : 'text-muted'}`}>
                      {item.isLocal ? item.latest.lokasi : 'Nasional'}
                    </span>
                  </div>

                  <div className="sparkline" aria-hidden="true">
                    {item.sparkline.map((height, index) => (
                      <span key={`${item.name}-${index}`} style={{ height: `${height}%` }} />
                    ))}
                  </div>
                </button>
              </div>
            )
          })}
        </div>
      </section>

      <section className="dashboard-grid max-w-md max-h-md">
        <article className="surface-card max-w-md max-h-md">
          <div className="section-head">
            <div>
              <p className="eyebrow">Inventory</p>
              <h3>Commodity Distribution</h3>
              <p className="body-sm text-on-surface-variant">
                Overview of market availability across all reporting locations.
              </p>
            </div>
          </div>

          <div className="feed-list">
            {spotlightCards.map((item) => {
              const staple = STAPLE_FOODS.find((food) => item.name.toLowerCase().includes(food.name.toLowerCase()))
              return (
                    <div
                      key={item.name}
                      className="flex justify-between items-center p-4 border-b border-slate-200 last:border-0"
                    >
                      <div className="flex gap-2 items-center">

                    <div className={`spotlight-icon tone-${item.tone}`}>
                      <span className="material-symbols-outlined">{item.icon}</span>
                    </div>
                    <div>
                      <strong>
                        {item.name}
                        <span className="distribution-unit">{staple?.unit ? ` / ${staple.unit}` : item.unit || ' / unit'}</span>
                      </strong>
                    </div>
                  </div>
                  <strong className="text-primary">{formatCurrency(item.latest.harga)}</strong>
                </div>
              )
            })}
          </div>
        </article>

        <article className="surface-card">
          <div className="section-head">
            <div>
              <p className="eyebrow">Market Snapshot</p>
              <h3>Ringkasan distribusi harga</h3>
              <p className="body-sm text-on-surface-variant">
                Sorotan cepat dari komoditas yang tampil di carousel saat ini.
              </p>
            </div>
          </div>

          <div className="impact-list">
            <article>
              <strong>Harga rata-rata</strong>
              <p>{formatCurrency(distributionSummary.averagePrice)}</p>
            </article>
            <article>
              <strong>Komoditas tertinggi</strong>
              <p>
                {distributionSummary.highest
                  ? `${distributionSummary.highest.name} • ${formatCurrency(distributionSummary.highest.latest.harga)}`
                  : '-'}
              </p>
            </article>
            <article>
              <strong>Komoditas terendah</strong>
              <p>
                {distributionSummary.lowest
                  ? `${distributionSummary.lowest.name} • ${formatCurrency(distributionSummary.lowest.latest.harga)}`
                  : '-'}
              </p>
            </article>
            <article>
              <strong>Cakupan filter</strong>
              <p>
                {activeProvince || 'Semua provinsi'}
                {activeCity ? ` • ${activeCity}` : ''}
              </p>
            </article>
          </div>
        </article>
      </section>
    </div>
  )
}
