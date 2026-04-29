import { useState, useEffect, useCallback } from 'react'
import { apiFetch } from '../lib/api'

const initialAdminStats = {
  totalReports: 0,
  pendingReports: 0,
  approvedUserReports: 0,
  rejectedReports: 0,
  totalUsers: 0,
  bannedUsers: 0,
  lastScrapeDate: '',
  isScraping: false,
  latestScrapeJob: null,
}

export function useAdminStats({ authState, refreshCount, reloadToken }) {
  const [adminStats, setAdminStats] = useState(initialAdminStats)
  const [adminStatus, setAdminStatus] = useState('idle')
  const [adminMessage, setAdminMessage] = useState('')

  const adminEnabled = Boolean(authState.token) && authState.user?.role === 'admin'
  const authHeaders = adminEnabled ? { Authorization: `Bearer ${authState.token}` } : null

  const loadStats = useCallback(async (signal) => {
    if (!adminEnabled || !authHeaders) {
      return
    }

    setAdminStatus('loading')
    setAdminMessage('')

    try {
      const result = await apiFetch('/api/admin/stats', {
        headers: authHeaders,
        signal,
      })

      setAdminStats({
        totalReports: Number(result.totalReports) || 0,
        pendingReports: Number(result.pendingReports) || 0,
        approvedUserReports: Number(result.approvedUserReports) || 0,
        rejectedReports: Number(result.rejectedReports) || 0,
        totalUsers: Number(result.totalUsers) || 0,
        bannedUsers: Number(result.bannedUsers) || 0,
        lastScrapeDate: result.lastScrapeDate || '',
        isScraping: Boolean(result.isScraping),
        latestScrapeJob: result.latestScrapeJob || null,
      })
      setAdminStatus('success')
    } catch (error) {
      if (error.name === 'AbortError') {
        return
      }

      setAdminStatus('error')
      setAdminMessage(error.message)
    }
  }, [adminEnabled, authHeaders])

  useEffect(() => {
    if (!adminEnabled) {
      return
    }

    const controller = new AbortController()
    async function runLoadStats() {
      await loadStats(controller.signal)
    }

    runLoadStats()
    const intervalId = setInterval(() => loadStats(controller.signal), 10000)

    return () => {
      controller.abort()
      clearInterval(intervalId)
    }
  }, [adminEnabled, loadStats, refreshCount, reloadToken])

  return {
    adminStats,
    adminStatus,
    adminMessage,
    setAdminMessage,
    loadStats,
  }
}
