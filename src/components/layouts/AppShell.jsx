import { useMemo, useState } from 'react'

const desktopNav = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', roles: ['user', 'editor', 'admin'] },
  { id: 'report', label: 'Report Price', icon: 'add_location_alt', roles: ['user', 'editor', 'admin'] },
  { id: 'commodity', label: 'Commodities', icon: 'shopping_basket', roles: ['user', 'editor', 'admin'] },
  { id: 'admin', label: 'System Administration', icon: 'admin_panel_settings', roles: ['admin'] },
]

const footerNav = [
  { id: 'settings', label: 'Settings', icon: 'settings', roles: ['user', 'editor', 'admin'] },
  { id: 'support', label: 'Support', icon: 'help', roles: ['user', 'editor', 'admin'] },
]

const mobileNav = [
  { id: 'dashboard', label: 'Trends', icon: 'trending_up', roles: ['user', 'editor', 'admin'] },
  { id: 'report', label: 'Report', icon: 'add_circle', roles: ['user', 'editor', 'admin'] },
  { id: 'commodity', label: 'Search', icon: 'search', roles: ['user', 'editor', 'admin'] },
  { id: 'admin', label: 'System Administration', icon: 'shield_person', roles: ['admin'] },
]

function NavButton({ item, activeView, onChange }) {
  const active = activeView === item.id
  return (
    <button
      className={`nav-link ${active ? 'is-active' : ''}`}
      type="button"
      onClick={() => onChange(item.id)}
    >
      <span className="material-symbols-outlined">{item.icon}</span>
      <span>{item.label}</span>
    </button>
  )
}

export default function AppShell({
  userRole = 'user',
  activeView,
  onChangeView,
  onLogout,
  onRefresh,
  autoRefreshEnabled,
  onToggleAutoRefresh,
  query,
  onQueryChange,
  status,
  latestUpdate,
  topbarMetaLabel,
  notifications = [],
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  children,
}) {
  const [showNotifications, setShowNotifications] = useState(false)
  const unreadCount = notifications.filter((item) => !item.isRead).length
  const filteredDesktopNav = useMemo(
    () => desktopNav.filter((item) => item.roles.includes(userRole)),
    [userRole],
  )
  const filteredFooterNav = useMemo(
    () => footerNav.filter((item) => item.roles.includes(userRole)),
    [userRole],
  )
  const filteredMobileNav = useMemo(
    () => mobileNav.filter((item) => item.roles.includes(userRole)),
    [userRole],
  )

  return (
    <div className="app-shell">
      <aside className="rail">
        <div className="rail__brand">
          <div className="rail__badge rail__badge--large">
            <img src="/Logo.svg" alt="Logo" style={{ width: '180px', height: '180px', objectFit: 'contain' }} />
          </div>
          <div>
            <h1>Smart Groceries</h1>
            <p>Fiscal Reliability</p>
          </div>
        </div>

        <nav className="rail__nav">
          {filteredDesktopNav.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              activeView={activeView}
              onChange={onChangeView}
            />
          ))}
        </nav>

        <div className="rail__footer">
          <button className="primary-button" type="button" onClick={() => onChangeView('report')}>
            <span className="material-symbols-outlined">add</span>
            <span>Report New Price</span>
          </button>
          <button className="ghost-button" type="button" onClick={onRefresh}>
            <span className="material-symbols-outlined">refresh</span>
            <span>Refresh Data</span>
          </button>
          <div className="rail__support">
            {filteredFooterNav.map((item) => (
              <button key={item.id} className="subtle-link" type="button">
                <span className="material-symbols-outlined">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Market Intelligence</p>
            <h2>
              {activeView === 'dashboard' && 'Regional overview'}
              {activeView === 'report' && 'Contribute data'}
              {activeView === 'commodity' && 'Commodity detail'}
              {activeView === 'admin' && 'System administration'}
            </h2>
          </div>

          <div className="topbar__actions">
            <label className="search-field">
              <span className="material-symbols-outlined">search</span>
              <input
                type="search"
                placeholder="Cari komoditas atau lokasi"
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
              />
            </label>

            <button className="ghost-button ghost-button--inline" type="button" onClick={onToggleAutoRefresh}>
              <span className="material-symbols-outlined">
                {autoRefreshEnabled ? 'timer' : 'timer_off'}
              </span>
              <span>{autoRefreshEnabled ? 'Auto 60s' : 'Auto Off'}</span>
            </button>

            <div className="topbar__status-group">
              <div className={`status-pill status-${status}`}>
                <span className="material-symbols-outlined">
                  {status === 'success' ? 'cloud_done' : status === 'error' ? 'cloud_off' : 'sync'}
                </span>
                {latestUpdate || 'Belum ada data'}
              </div>

              <button
                className={`icon-button topbar-icon ${unreadCount > 0 ? 'topbar-icon--has-alert' : ''}`}
                type="button"
                aria-label="Notifications"
                style={{ position: 'relative' }}
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <span className="material-symbols-outlined">notifications</span>
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      width: '8px',
                      height: '8px',
                      background: 'var(--danger)',
                      borderRadius: '999px',
                      border: '2px solid white',
                    }}
                  />
                )}
              </button>

              <button
                className="icon-button topbar-icon"
                type="button"
                aria-label="Logout"
                onClick={onLogout}
              >
                <span className="material-symbols-outlined">logout</span>
              </button>
            </div>

            {showNotifications && (
              <div
                className="surface-card"
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: '28px',
                  width: '320px',
                  zIndex: 100,
                  marginTop: '12px',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  padding: '16px',
                }}
              >
                <div className="section-head" style={{ marginBottom: '12px' }}>
                  <strong>Notifications</strong>
                  <button
                    className="subtle-link"
                    style={{ padding: 0 }}
                    type="button"
                    onClick={onMarkAllNotificationsRead}
                  >
                    Mark all read
                  </button>
                </div>
                <div className="admin-stack">
                  {notifications.map((n) => (
                    <article
                      key={n._id ?? n.createdAt}
                      className="feed-item"
                      style={{
                        padding: '10px',
                        borderColor: n.isRead ? 'rgba(91, 115, 103, 0.14)' : 'rgba(0, 90, 194, 0.28)',
                      }}
                    >
                      <div className="feed-item__body">
                        <strong>{n.title}</strong>
                        <p style={{ fontSize: '0.85rem' }}>{n.body}</p>
                        <div className="tag-row">
                          <span>{n.isRead ? 'Read' : 'Unread'}</span>
                          {n.metadata?.moderationStatus ? <span>{n.metadata.moderationStatus}</span> : null}
                        </div>
                      </div>
                      {!n.isRead ? (
                        <button
                          className="ghost-button ghost-button--inline"
                          type="button"
                          onClick={() => onMarkNotificationRead?.(n._id)}
                        >
                          Read
                        </button>
                      ) : null}
                    </article>
                  ))}
                  {notifications.length === 0 && <p className="text-on-surface-variant">No notifications</p>}
                </div>
              </div>
            )}

          </div>
        </header>

        <main className="workspace__content">{children}</main>

        <nav className="mobile-nav">
          {filteredMobileNav.map((item) => {
            const active = activeView === item.id
            return (
              <button
                key={item.id}
                className={`mobile-nav__item ${active ? 'is-active' : ''}`}
                type="button"
                onClick={() => onChangeView(item.id)}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
