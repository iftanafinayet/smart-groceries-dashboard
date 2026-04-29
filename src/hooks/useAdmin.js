import { useState, useCallback } from 'react'
import { useAdminStats } from './useAdminStats'
import { useAdminModeration } from './useAdminModeration'
import { useAdminUsers } from './useAdminUsers'
import { useAdminOps } from './useAdminOps'

export function useAdmin(authState, refreshCount = 0, showToast) {
  const [reloadToken, setReloadToken] = useState(0)
  const bumpReload = useCallback(() => {
    setReloadToken((current) => current + 1)
  }, [])

  const [adminActionStatus, setAdminActionStatus] = useState('idle')
  const [adminActionMessage, setAdminActionMessage] = useState('')

  const setActionFeedback = useCallback((status, message) => {
    setAdminActionStatus(status)
    setAdminActionMessage(message)
  }, [])

  const {
    adminStats,
    adminStatus,
    adminMessage,
    setAdminMessage,
  } = useAdminStats({ authState, refreshCount, reloadToken })

  const {
    adminPendingReports,
    approveReport,
    handleRejectReport,
    loadPendingReports,
  } = useAdminModeration({
    authState,
    moderationSearch: '', // This needs to be managed
    reloadToken,
    bumpReload,
    setActionFeedback,
  })

  const {
    adminUsers,
    selectedAdminUser,
    setSelectedAdminUser,
    selectedAdminUserReports,
    updateUserRole,
    toggleUserBan,
    selectUser,
    loadUsers,
  } = useAdminUsers({
    authState,
    userSearch: '', // This needs to be managed
    reloadToken,
    bumpReload,
    setActionFeedback,
  })

  const {
    scraperLogs,
    broadcastMessage,
    setBroadcastMessage,
    broadcastStatus,
    setBroadcastStatus,
    broadcastFeedback,
    setBroadcastFeedback,
    forceScrape,
    sendBroadcast,
    loadLogs,
  } = useAdminOps({
    authState,
    reloadToken,
    bumpReload,
    setActionFeedback,
  })

  // I need to bring back the search states here to pass them to hooks
  // but wait, I should just define them here.
  return {
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
    refreshAdminData: bumpReload,
  }
}


function isAdminSession(authState) {
  return Boolean(authState.token) && authState.user?.role === 'admin'
}

function buildAuthHeaders(authState) {
  return { Authorization: `Bearer ${authState.token}` }
}

