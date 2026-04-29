import { useCallback, useEffect, useMemo, useState } from 'react'
import AppShell from './components/layouts/AppShell'
import DashboardView from './components/views/DashboardView'
import CommodityDetailView from './components/views/CommodityDetailView'
import ReportComposerView from './components/views/ReportComposerView'
import AdminView from './components/views/AdminView'
import SplashView from './components/views/SplashView'
import AuthView from './components/views/AuthView'
import ToastProvider from './components/ui/ToastProvider'
import { formatRelativeTime, summarisePrices } from './lib/market'
import { STAPLE_FOODS } from './lib/constants'
import { getRegionOptionsFromReports } from './lib/location'
import { useAuth } from './hooks/useAuth'
import { usePrices } from './hooks/usePrices'
import { useAdmin } from './hooks/useAdmin'
import { useReportComposer } from './hooks/useReportComposer'
import { useNotifications } from './hooks/useNotifications'
import { useDataExport } from './hooks/useDataExport'
import { getBackendUrl, apiFetch } from './lib/api'
import './App.css'


const defaultCommodityOptions = STAPLE_FOODS.map((item) => item.name)

function App() {
  const {
    authState,
    authForm,
    setAuthForm,
    authMode,
    setAuthMode,
    authStatus,
    authMessage,
    login,
    register,
    logout,
  } = useAuth()
  const { prices, status, error, lastLoadedAt, usingCachedData, loadPrices } = usePrices()
  
  const [toasts, setToasts] = useState([])
  const showToast = useCallback((toast) => {
    setToasts((current) => [...current, { id: Date.now() + Math.random(), tone: 'info', ...toast }])
  }, [])

  const {
    adminStats,
    adminStatus,
    adminMessage,
    setAdminMessage,
    adminActionStatus,
    adminActionMessage,
    adminPendingReports,
    adminUsers,
    scraperLogs,
    forceScrape,
    moderationSearch,
    setModerationSearch,
    userSearch,
    setUserSearch,
    selectedAdminUser,
    selectedAdminUserReports,
    broadcastMessage,
    setBroadcastMessage,
    broadcastStatus,
    broadcastFeedback,
    approveReport,
    handleRejectReport,
    updateUserRole,
    toggleUserBan,
    sendBroadcast,
    selectUser,
  } = useAdmin(authState, 0, showToast)

  const [commodityOptions, setCommodityOptions] = useState(defaultCommodityOptions)
  const [appStatus, setAppStatus] = useState('splash')
  const [query, setQuery] = useState('')
  const [activeView, setActiveView] = useState('dashboard')
  const [activeProvince, setActiveProvince] = useState('')
  const [activeCity, setActiveCity] = useState('')
  const [selectedCommodityName, setSelectedCommodityName] = useState('')
  const [myReports, setMyReports] = useState([])
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true)

  const loadUserActivity = useCallback(async (signal) => {
    if (!authState.token) {
      setMyReports([])
      return
    }

    try {
      const authHeaders = { Authorization: `Bearer ${authState.token}` }
      const reports = await apiFetch('/api/prices/my-reports', { headers: authHeaders, signal })
      setMyReports(Array.isArray(reports) ? reports : [])
    } catch (fetchError) {
      if (fetchError.name !== 'AbortError') {
        showToast({
          tone: 'error',
          title: 'Sync failed',
          message: fetchError.message,
        })
      }
    }
  }, [authState.token, showToast])

  const {
    notifications,
    fetchNotifications,
    handleMarkNotificationRead,
    handleMarkAllNotificationsRead,
  } = useNotifications({
    authState,
    showToast,
  })

  const {
    reportForm,
    setReportForm,
    reportErrors,
    reportSubmitState,
    reportSubmitMessage,
    reportDraftMessage,
    handleReportChange,
    handleSubmitReport,
    handleSaveDraft,
    handleResetDraft,
  } = useReportComposer({
    authState,
    showToast,
    loadPrices,
    loadUserActivity,
    defaultCommodity: commodityOptions[0],
  })

  const {
    handleExportData,
  } = useDataExport({
    authState,
    prices,
    showToast,
  })

  const loadCommodityCatalog = useCallback(async (signal) => {
    try {
      const result = await apiFetch('/api/prices/master-list', { signal })
      const names = Array.isArray(result)
        ? result.map((item) => item?.name).filter(Boolean)
        : []
      setCommodityOptions(names.length > 0 ? names : defaultCommodityOptions)
    } catch (fetchError) {
      if (fetchError.name !== 'AbortError') {
        setCommodityOptions(defaultCommodityOptions)
      }
    }
  }, [])

  useEffect(() => {
    const timerId = setTimeout(() => setAppStatus(authState.token ? 'ready' : 'auth'), 2000)
    return () => clearTimeout(timerId)
  }, [authState.token])

  useEffect(() => {
    if (appStatus !== 'ready') {
      return
    }

    const controller = new AbortController()
    async function runInitialLoad() {
      await Promise.all([
        loadPrices(controller.signal),
        loadCommodityCatalog(controller.signal),
        loadUserActivity(controller.signal),
        fetchNotifications(controller.signal),
      ])
    }

    runInitialLoad()
    return () => controller.abort()
  }, [appStatus, loadCommodityCatalog, loadPrices, loadUserActivity, fetchNotifications])

  useEffect(() => {
    if (appStatus !== 'ready' || !autoRefreshEnabled) {
      return
    }

    const intervalId = setInterval(() => {
      loadPrices()
      loadUserActivity()
      fetchNotifications()
    }, 60000)

    return () => clearInterval(intervalId)
  }, [appStatus, autoRefreshEnabled, loadPrices, loadUserActivity, fetchNotifications])


  const dashboardData = useMemo(() => summarisePrices(prices), [prices])
  const filteredCards = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const stapleData = dashboardData.filter((item) => STAPLE_FOODS.some((food) => food.name === item.name))
    if (!normalizedQuery) {
      return stapleData
    }

    return stapleData.filter((item) => (
      item.name.toLowerCase().includes(normalizedQuery)
      || item.entries.some((entry) => entry.lokasi?.toLowerCase().includes(normalizedQuery))
    ))
  }, [dashboardData, query])

  const latestReports = useMemo(
    () => [...prices].sort((left, right) => new Date(right.tanggal) - new Date(left.tanggal)),
    [prices],
  )
  const regionOptions = useMemo(() => getRegionOptionsFromReports(latestReports), [latestReports])
  const resolvedActiveProvince = regionOptions.provinces.includes(activeProvince) ? activeProvince : ''
  const availableCities = useMemo(
    () => (resolvedActiveProvince ? regionOptions.citiesByProvince[resolvedActiveProvince] || [] : []),
    [regionOptions.citiesByProvince, resolvedActiveProvince],
  )
  const resolvedActiveCity = availableCities.includes(activeCity) ? activeCity : ''
  const spotlightCards = filteredCards
  const selectedCommodity = filteredCards.find((item) => item.name === selectedCommodityName)
    ?? filteredCards[0]
    ?? null

  const handleSelectCommodity = useCallback((name) => {
    setSelectedCommodityName(name)
    setReportForm((current) => ({ ...current, komoditas: name }))
    setActiveView('commodity')
  }, [])

  if (appStatus === 'splash') {
    return <SplashView />
  }

  if (appStatus === 'auth') {
    return (
      <AuthView
        authForm={authForm}
        setAuthForm={setAuthForm}
        authMode={authMode}
        setAuthMode={setAuthMode}
        authStatus={authStatus}
        authMessage={authMessage}
        onAuthSubmit={authMode === 'login' ? login : register}
      />
    )
  }

  return (
    <>
      <AppShell
        userRole={authState.user?.role || 'user'}
        activeView={activeView}
        onChangeView={setActiveView}
        onLogout={logout}
        onRefresh={loadPrices}
        autoRefreshEnabled={autoRefreshEnabled}
        onToggleAutoRefresh={() => setAutoRefreshEnabled((current) => !current)}
        query={query}
        onQueryChange={setQuery}
        status={status}
        latestUpdate={status === 'success' ? `Updated ${formatRelativeTime(latestReports[0]?.tanggal)}` : 'Loading...'}
        topbarMetaLabel={`${usingCachedData ? 'Cached data' : 'Live data'} • ${getBackendUrl()}`}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
      >
        {activeView === 'dashboard' && (
          <DashboardView
            status={status}
            error={error}
            backendLabel={getBackendUrl()}
            lastLoadedAt={lastLoadedAt}
            totalReports={prices.length}
            officialReports={prices.filter((price) => price.sumber === 'official').length}
            userReports={prices.filter((price) => price.sumber === 'user').length}
            locations={new Set(prices.map((price) => price.lokasi).filter(Boolean)).size}
            spotlightCards={spotlightCards}
            latestReports={latestReports}
            onRetry={loadPrices}
            onSelectCommodity={handleSelectCommodity}
            activeProvince={resolvedActiveProvince}
            setActiveProvince={setActiveProvince}
            activeCity={resolvedActiveCity}
            setActiveCity={setActiveCity}
            availableProvinces={regionOptions.provinces}
            availableCities={availableCities}
          />
        )}
        {activeView === 'commodity' && <CommodityDetailView commodity={selectedCommodity} />}
        {activeView === 'report' && (
          <ReportComposerView
            commodity={selectedCommodity}
            latestReports={latestReports}
            userReports={prices.filter((price) => price.sumber === 'user').length}
            commodityOptions={commodityOptions}
            myReports={myReports}
            form={reportForm}
            errors={reportErrors}
            submitState={reportSubmitState}
            submitMessage={reportSubmitMessage}
            draftMessage={reportDraftMessage}
            reportSubmissionEnabled={Boolean(authState.token)}
            reportCapabilityLabel={authState.token ? 'POST aktif dan terhubung ke moderasi backend' : 'Login diperlukan'}
            onChange={handleReportChange}
            onSubmit={handleSubmitReport}
            onSaveDraft={handleSaveDraft}
            onResetDraft={handleResetDraft}
          />
        )}
        {activeView === 'admin' && (
          <AdminView
            totalReports={prices.length}
            officialReports={prices.filter((price) => price.sumber === 'official').length}
            userReports={prices.filter((price) => price.sumber === 'user').length}
            latestReports={latestReports}
            adminStats={adminStats}
            adminStatus={adminStatus}
            adminMessage={adminMessage}
            setAdminMessage={setAdminMessage}
            adminCapabilities={{
              moderation: true,
              users: true,
              forceScrape: true,
              broadcast: true,
              exportServer: true,
            }}
            adminInsights={{
              anomalies: adminPendingReports.filter((report) => report.anomaly),
              moderationQueue: adminPendingReports,
              userSummaries: adminUsers,
            }}
            adminActionStatus={adminActionStatus}
            adminActionMessage={adminActionMessage}
            moderationSearch={moderationSearch}
            onModerationSearchChange={setModerationSearch}
            userSearch={userSearch}
            onUserSearchChange={setUserSearch}
            selectedAdminUser={selectedAdminUser}
            selectedAdminUserReports={selectedAdminUserReports}
            scraperLogs={scraperLogs}
            broadcastMessage={broadcastMessage}
            onBroadcastMessageChange={setBroadcastMessage}
            broadcastStatus={broadcastStatus}
            broadcastFeedback={broadcastFeedback}
            onSelectUser={selectUser}
            onApproveReport={approveReport}
            onRejectReport={handleRejectReport}
            onUserRoleChange={updateUserRole}
            onUserBanToggle={toggleUserBan}
            onForceScrape={forceScrape}
            onSendBroadcast={sendBroadcast}
            onExportData={handleExportData}
          />
        )}
      </AppShell>
      <ToastProvider
        toasts={toasts}
        onDismiss={(id) => setToasts((current) => current.filter((toast) => toast.id !== id))}
      />
    </>
  )
}

export default App
