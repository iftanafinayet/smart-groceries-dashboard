import { useState, useEffect, useCallback } from 'react'
import { apiFetch } from '../lib/api'

export function useAdminModeration({ authState, moderationSearch, reloadToken, bumpReload, setActionFeedback }) {
  const [adminPendingReports, setAdminPendingReports] = useState([])

  const adminEnabled = Boolean(authState.token) && authState.user?.role === 'admin'
  const authHeaders = adminEnabled ? { Authorization: `Bearer ${authState.token}` } : null

  const loadPendingReports = useCallback(async (signal) => {
    if (!adminEnabled || !authHeaders) {
      return
    }

    const moderationQuery = moderationSearch.trim()
      ? `?q=${encodeURIComponent(moderationSearch.trim())}`
      : ''

    try {
      const pending = await apiFetch(`/api/admin/reports/pending${moderationQuery}`, {
        headers: authHeaders,
        signal,
      })
      setAdminPendingReports(Array.isArray(pending) ? pending : [])
    } catch (error) {
      if (error.name === 'AbortError') {
        return
      }
      // We can't setAdminMessage here, maybe pass a callback or use a context
    }
  }, [adminEnabled, authHeaders, moderationSearch])

  useEffect(() => {
    if (!adminEnabled) {
      return
    }

    const controller = new AbortController()
    async function runLoad() {
      await loadPendingReports(controller.signal)
    }

    runLoad()
    return () => controller.abort()
  }, [adminEnabled, loadPendingReports, reloadToken])

  const approveReport = useCallback(async (reportId) => {
    if (!adminEnabled || !authHeaders || !reportId) {
      return { success: false, message: 'Sesi admin tidak tersedia.' }
    }

    setActionFeedback('submitting', '')

    try {
      const result = await apiFetch(`/api/admin/reports/${reportId}/moderate`, {
        method: 'PATCH',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'approve' }),
      })
      setActionFeedback('success', result.message || 'Laporan berhasil disetujui.')
      bumpReload()
      return { success: true, message: result.message }
    } catch (error) {
      setActionFeedback('error', error.message)
      return { success: false, message: error.message }
    }
  }, [adminEnabled, authHeaders, bumpReload, setActionFeedback])

  const rejectReport = useCallback(async (reportId, note) => {
    if (!adminEnabled || !authHeaders || !reportId) {
      return { success: false, message: 'Sesi admin tidak tersedia.' }
    }

    setActionFeedback('submitting', '')

    try {
      const result = await apiFetch(`/api/admin/reports/${reportId}/moderate`, {
        method: 'PATCH',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'reject', note }),
      })
      setActionFeedback('success', result.message || 'Laporan berhasil ditolak.')
      bumpReload()
      return { success: true, message: result.message }
    } catch (error) {
      setActionFeedback('error', error.message)
      return { success: false, message: error.message }
    }
  }, [adminEnabled, authHeaders, bumpReload, setActionFeedback])

  return {
    adminPendingReports,
    approveReport,
    rejectReport,
    loadPendingReports,
  }
}
