import { useEffect, useRef } from 'react'
import { formatCurrency, formatDate, formatRelativeTime } from '../../lib/market'

function CapabilityPill({ active }) {
  return (
    <span className={`confidence-pill ${active ? 'status-success' : 'status-error'}`}>
      {active ? 'Ready' : 'Missing'}
    </span>
  )
}

function resolveRiskLevel(report) {
  if (report.riskLevel) {
    return report.riskLevel
  }

  if (report.deviationPercent == null) {
    return 'needs-context'
  }

  const absoluteDeviation = Math.abs(report.deviationPercent)
  if (absoluteDeviation >= 100) {
    return 'critical'
  }
  if (absoluteDeviation >= 50) {
    return 'high'
  }
  return 'normal'
}

function RiskPill({ report }) {
  const riskLevel = resolveRiskLevel(report)
  const absoluteDeviation = Math.abs(report.deviationPercent ?? 0)

  if (riskLevel === 'critical') {
    return <span className="trend-badge trend-up">Critical {absoluteDeviation}%</span>
  }
  if (riskLevel === 'high') {
    return <span className="trend-badge trend-up">High {absoluteDeviation}%</span>
  }
  if (riskLevel === 'needs-context') {
    return <span className="trend-badge trend-steady">No baseline</span>
  }
  return <span className="trend-badge trend-down">Normal</span>
}

export default function AdminView({
  totalReports,
  officialReports,
  userReports,
  latestReports,
  adminStats,
  adminStatus,
  adminMessage,
  adminCapabilities,
  adminInsights,
  adminActionStatus,
  adminActionMessage,
  moderationSearch,
  userSearch,
  selectedAdminUser,
  selectedAdminUserReports,
  scraperLogs,
  broadcastMessage,
  broadcastStatus,
  broadcastFeedback,
  onModerationSearchChange,
  onUserSearchChange,
  onSelectUser,
  onBroadcastMessageChange,
  onApproveReport,
  onRejectReport,
  onUserRoleChange,
  onUserBanToggle,
  onForceScrape,
  onSendBroadcast,
  onExportData,
}) {
  const logContainerRef = useRef(null)

  useEffect(() => {
    if (!logContainerRef.current) {
      return
    }

    logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
  }, [scraperLogs])

  const capabilityRows = [
    { name: 'Moderasi laporan', description: 'Persist approve/reject + feedback ke user.', active: adminCapabilities.moderation },
    { name: 'Manajemen user', description: 'Role, ban, dan drill-down riwayat laporan user.', active: adminCapabilities.users },
    { name: 'Force scraping', description: 'Manual trigger dengan lock agar tidak double-run.', active: adminCapabilities.forceScrape },
    { name: 'Broadcast', description: 'Notifikasi global tersimpan dan terkirim ke user.', active: adminCapabilities.broadcast },
    { name: 'Export penuh', description: 'Ekspor data historis dari backend.', active: adminCapabilities.exportServer },
  ]

  return (
    <div className="view-stack admin-view">
      <section className="metric-grid">
        <article className="metric-card">
          <span className="material-symbols-outlined">shield_person</span>
          <div>
            <p>Admin API</p>
            <strong>{adminStatus === 'success' ? 'Connected' : adminStatus === 'loading' ? 'Loading' : 'Limited'}</strong>
          </div>
        </article>
        <article className="metric-card">
          <span className="material-symbols-outlined">pending_actions</span>
          <div>
            <p>Pending moderation</p>
            <strong>{adminStats.pendingReports ?? adminInsights.moderationQueue.length}</strong>
          </div>
        </article>
        <article className="metric-card">
          <span className="material-symbols-outlined">warning</span>
          <div>
            <p>Outlier flagged</p>
            <strong>{adminInsights.anomalies.length}</strong>
          </div>
        </article>
        <article className="metric-card">
          <span className="material-symbols-outlined">sync_alt</span>
          <div>
            <p>Scraper runtime</p>
            <strong>{adminStats.isScraping ? 'Running' : 'Idle'}</strong>
          </div>
        </article>
      </section>

      <section className="hero-card">
        <div>
          <p className="eyebrow">Admin Control Center</p>
          <h3>Moderasi, feedback ke user, dan operasi scraper sekarang terhubung ke backend aktif.</h3>
          <p>
            Queue moderasi, user management, log scraper, broadcast, dan export sekarang memakai route backend
            yang sama dengan dashboard.
          </p>
        </div>
        <div className="hero-card__meta">
          <span>User reports: {adminStats.totalReports || userReports}</span>
          <span>Official records: {officialReports}</span>
          <span>All loaded records: {totalReports || latestReports.length}</span>
          <span>Last official scrape: {adminStats.lastScrapeDate ? formatDate(adminStats.lastScrapeDate) : '-'}</span>
          <span>Total users: {adminStats.totalUsers ?? '-'}</span>
          <span>Banned users: {adminStats.bannedUsers ?? '-'}</span>
        </div>
      </section>

      {adminMessage ? (
        <section className="hero-card hero-card--warning">
          <div>
            <p className="eyebrow">Backend Status</p>
            <h3>Status `/api/admin/stats`</h3>
            <p>{adminMessage}</p>
          </div>
        </section>
      ) : null}

      {adminActionMessage ? (
        <section className={`hero-card ${adminActionStatus === 'error' ? 'hero-card--warning' : ''}`}>
          <div>
            <p className="eyebrow">Action Feedback</p>
            <h3>Admin action result</h3>
            <p>{adminActionMessage}</p>
          </div>
        </section>
      ) : null}

      <section className="admin-board-grid">
        <article className="surface-card">
          <div className="section-head">
            <div>
              <p className="eyebrow">Moderation Queue</p>
              <h3>Laporan user yang perlu keputusan admin</h3>
            </div>
            <label className="input-group" style={{ minWidth: '220px' }}>
              <span>Filter queue</span>
              <input
                value={moderationSearch}
                onChange={(event) => onModerationSearchChange(event.target.value)}
                placeholder="Cari komoditas, lokasi, user"
              />
            </label>
          </div>
          <div className="admin-stack">
            {adminInsights.moderationQueue.map((report) => {
              const reportId = report._id ?? report.moderationKey
              return (
                <article className="admin-row" key={reportId}>
                  <div className="admin-row__main">
                    <div className="admin-row__title">
                      <strong>{report.komoditas}</strong>
                      <RiskPill report={report} />
                    </div>
                    <p>
                      {report.reportedBy?.username || 'anonymous'} melaporkan {formatCurrency(report.harga)} di{' '}
                      {report.lokasi || 'lokasi tidak diketahui'} {formatRelativeTime(report.tanggal)}.
                    </p>
                    <div className="tag-row">
                      <span>Reference: {report.referencePrice ? formatCurrency(report.referencePrice) : 'Tidak ada'}</span>
                      <span>{report.referenceDate ? `Official ${formatRelativeTime(report.referenceDate)}` : 'Perlu baseline manual'}</span>
                      <span>{report.verifications ?? 0} verifikasi</span>
                    </div>
                    {report.catatan ? <p>Catatan user: {report.catatan}</p> : null}
                  </div>
                  <div className="admin-row__actions">
                    <button className="ghost-button ghost-button--inline" type="button" onClick={() => onRejectReport(reportId)}>
                      Reject with note
                    </button>
                    <button className="primary-button" type="button" onClick={() => onApproveReport(reportId)}>
                      Approve + reward
                    </button>
                  </div>
                </article>
              )
            })}
            {adminInsights.moderationQueue.length === 0 ? (
              <article className="admin-empty-state">
                <strong>Tidak ada laporan yang menunggu review.</strong>
                <p>Ubah filter atau tunggu laporan user baru masuk.</p>
              </article>
            ) : null}
          </div>
        </article>

        <article className="surface-card">
          <div className="section-head">
            <div>
              <p className="eyebrow">User Management</p>
              <h3>User watchlist dan drill-down history</h3>
            </div>
            <label className="input-group" style={{ minWidth: '220px' }}>
              <span>Filter user</span>
              <input
                value={userSearch}
                onChange={(event) => onUserSearchChange(event.target.value)}
                placeholder="Cari username"
              />
            </label>
          </div>
          <div className="admin-stack">
            {adminInsights.userSummaries.map((user) => {
              const userId = user._id ?? user.id
              const isBanned = Boolean(user.isBanned ?? user.banned)
              return (
                <article className="admin-row" key={userId ?? user.username}>
                  <div className="admin-row__main">
                    <div className="admin-row__title">
                      <button className="subtle-link" type="button" onClick={() => onSelectUser(user)} style={{ padding: 0 }}>
                        <strong>{user.username}</strong>
                      </button>
                      <span className={`confidence-pill ${isBanned ? 'status-error' : 'status-success'}`}>
                        {isBanned ? 'Banned' : user.role}
                      </span>
                    </div>
                    <p>
                      {user.reportCount ?? 0} laporan, {user.approvedCount ?? 0} approved, {user.pendingCount ?? 0} pending, {user.rejectedCount ?? 0} rejected.
                    </p>
                    <div className="tag-row">
                      <span>{user.points} pts</span>
                      <span>{user.latestReportAt ? `Last seen ${formatRelativeTime(user.latestReportAt)}` : 'Belum ada report'}</span>
                    </div>
                  </div>
                  <div className="admin-row__actions admin-row__actions--stacked">
                    <select value={user.role} onChange={(event) => onUserRoleChange(userId, event.target.value)}>
                      <option value="user">user</option>
                      <option value="editor">editor</option>
                      <option value="admin">admin</option>
                    </select>
                    <button className="ghost-button ghost-button--inline" type="button" onClick={() => onUserBanToggle(user)}>
                      {isBanned ? 'Unban user' : 'Ban user'}
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        </article>

        <article className="surface-card">
          <div className="section-head">
            <div>
              <p className="eyebrow">Selected User</p>
              <h3>{selectedAdminUser?.username || 'Pilih user'}</h3>
            </div>
          </div>
          <div className="admin-stack">
            {selectedAdminUser ? (
              <>
                <article className="admin-empty-state">
                  <strong>{selectedAdminUser.username}</strong>
                  <p>
                    {selectedAdminUser.reportCount ?? 0} total report, {selectedAdminUser.points} poin, role {selectedAdminUser.role}.
                  </p>
                </article>
                {selectedAdminUserReports.slice(0, 6).map((report) => (
                  <article className="feed-item" key={report._id}>
                    <div className="feed-item__body">
                      <div className="feed-item__row">
                        <strong>{report.komoditas}</strong>
                        <span>{report.moderationStatus}</span>
                      </div>
                      <p>
                        {report.lokasi || 'Lokasi tidak diketahui'} • {formatCurrency(report.harga)}
                      </p>
                      <div className="tag-row">
                        <span>{formatRelativeTime(report.tanggal)}</span>
                        <span>{report.reviewedBy?.username ? `Reviewed by ${report.reviewedBy.username}` : 'Belum direview'}</span>
                      </div>
                      {report.reviewNote ? <p>Catatan admin: {report.reviewNote}</p> : null}
                      {report.catatan ? <p>Catatan user: {report.catatan}</p> : null}
                    </div>
                  </article>
                ))}
              </>
            ) : (
              <article className="admin-empty-state">
                <strong>Belum ada user yang dipilih.</strong>
                <p>Klik nama user di panel kiri untuk melihat riwayat lengkap laporan mereka.</p>
              </article>
            )}
          </div>
        </article>
        <article className="surface-card">
          <div className="section-head">
            <div>
              <p className="eyebrow">Operations</p>
              <h3>Force scrape, broadcast, dan log scraper</h3>
            </div>
          </div>
          <div className="admin-ops-grid">
            <article className="admin-op-card">
              <strong>Manual scraping</strong>
              <p>Trigger manual memakai lock backend, jadi dua admin tidak bisa menjalankan scrape bersamaan.</p>
              <button
                className="primary-button"
                type="button"
                onClick={onForceScrape}
                disabled={adminStats.isScraping}
              >
                <span className="material-symbols-outlined">
                  {adminStats.isScraping ? 'progress_activity' : 'play_arrow'}
                </span>
                <span>{adminStats.isScraping ? 'Scraping in progress...' : 'Trigger scrape'}</span>
              </button>
              {adminStats.isScraping ? (
                <div className="progress-strip progress-strip--active">
                  <span className="progress-strip__bar progress-strip__bar--animated" />
                  <div>
                    <strong>Scraper sedang berjalan</strong>
                    <p>Log akan terus diperbarui sampai proses selesai.</p>
                  </div>
                </div>
              ) : null}
            </article>
            <article className="admin-op-card">
              <strong>Broadcast to users</strong>
              <p>Pesan ini masuk ke feed notifikasi user dan bisa ditandai read per akun.</p>
              <label className="input-group input-group--stacked">
                <span>Pesan broadcast</span>
                <textarea
                  rows="5"
                  value={broadcastMessage}
                  onChange={(event) => onBroadcastMessageChange(event.target.value)}
                  placeholder="Contoh: Harga beras naik tajam di Jakarta Pusat, mohon update harga pasar terdekat."
                />
              </label>
              <button className="primary-button" type="button" onClick={onSendBroadcast}>
                <span className="material-symbols-outlined">campaign</span>
                <span>{broadcastStatus === 'submitting' ? 'Mengirim...' : 'Kirim broadcast'}</span>
              </button>
              {broadcastFeedback ? (
                <div className={`submit-message submit-message--${broadcastStatus === 'error' ? 'error' : 'success'}`}>
                  {broadcastFeedback}
                </div>
              ) : null}
            </article>
          </div>
        </article>

        <article className="surface-card">
          <div className="section-head">
            <div>
              <p className="eyebrow">Scraper Logs</p>
              <h3>Progress terbaru</h3>
            </div>
          </div>
          <div className="admin-stack admin-stack--logs" ref={logContainerRef}>
            {(scraperLogs || []).slice(-12).map((log, index) => (
              <article className="admin-empty-state" key={`${log.createdAt ?? index}-${index}`}>
                <strong>{log.createdAt ? formatDate(log.createdAt) : `Log ${index + 1}`}</strong>
                <p>{log.message ?? log}</p>
              </article>
            ))}
            {(scraperLogs || []).length === 0 ? (
              <article className="admin-empty-state">
                <strong>Belum ada log scraper.</strong>
                <p>Log akan tampil setelah cron atau manual scrape dijalankan.</p>
              </article>
            ) : null}
          </div>
        </article>
        <article className="surface-card">
          <div className="section-head">
            <div>
              <p className="eyebrow">Outlier Board</p>
              <h3>Deteksi anomali harga</h3>
            </div>
          </div>
          <div className="admin-stack">
            {adminInsights.anomalies.map((report) => (
              <article className="feed-item" key={report._id ?? `${report.komoditas}-${report.tanggal}`}>
                <div className="feed-avatar source-user">
                  <span className="material-symbols-outlined">error</span>
                </div>
                <div className="feed-item__body">
                  <div className="feed-item__row">
                    <strong>{report.komoditas}</strong>
                    <span>{Math.abs(report.deviationPercent ?? 0)}%</span>
                  </div>
                  <p>
                    {formatCurrency(report.harga)} vs official {formatCurrency(report.referencePrice)}
                  </p>
                  <div className="tag-row">
                    <span>{report.lokasi || 'Lokasi tidak diketahui'}</span>
                    <span>{report.reportedBy?.username || 'anonymous'}</span>
                  </div>
                </div>
              </article>
            ))}
            {adminInsights.anomalies.length === 0 ? (
              <article className="admin-empty-state">
                <strong>Tidak ada outlier di atas ambang 50%.</strong>
                <p>Ambang saat ini membandingkan laporan user dengan harga official terbaru per komoditas.</p>
              </article>
            ) : null}
          </div>
        </article>

        <article className="surface-card">
          <div className="section-head">
            <div>
              <p className="eyebrow">Export</p>
              <h3>Download data</h3>
            </div>
          </div>
          <div className="admin-stack">
            <article className="admin-op-card admin-op-card--compact">
              <strong>Snapshot JSON</strong>
              <p>Download data yang sedang dimuat di dashboard saat ini.</p>
              <button className="ghost-button" type="button" onClick={() => onExportData('json')}>
                Download JSON
              </button>
            </article>
            <article className="admin-op-card admin-op-card--compact">
              <strong>Snapshot CSV</strong>
              <p>Format cepat untuk analisis spreadsheet.</p>
              <button className="ghost-button" type="button" onClick={() => onExportData('csv')}>
                Download CSV
              </button>
            </article>
            <article className="admin-op-card admin-op-card--compact">
              <strong>Full backend export</strong>
              <p>Export historis dari backend dengan metadata moderasi.</p>
              <button className="primary-button" type="button" onClick={() => onExportData('server')}>
                Export Full Dataset
              </button>
            </article>
          </div>
        </article>
      </section>
    </div>
  )
}
