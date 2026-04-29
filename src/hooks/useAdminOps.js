import { useState, useEffect, useCallback } from 'react'
import { apiFetch } from '../lib/api'

export function useAdminOps({ authState, reloadToken, bumpReload, setActionFeedback }) {
  const [scraperLogs, setScraperLogs] = useState([])
  const [broadcastMessage, setBroadcastMessage] = useState('')
  const [broadcastStatus, setBroadcastStatus] = useState('idle')
  const [broadcastFeedback, setBroadcastFeedback] = useState('')

  const adminEnabled = Boolean(authState.token) && authState.user?.role === 'admin'
  const authHeaders = adminEnabled ? { Authorization: `Bearer ${authState.token}` } : null

  const loadLogs = useCallback(async (signal) => {
    if (!adminEnabled || !authHeaders) {
      return
    }

    try {
      const result = await apiFetch('/api/admin/logs', {
        headers: authHeaders,
        signal,
      })
      setScraperLogs(Array.isArray(result.logs) ? result.logs : [])
    } catch (error) {
      if (error.name !== 'AbortError') {
        // Handle error
      }
    }
  }, [adminEnabled, authHeaders])

  useEffect(() => {
    if (!adminEnabled) {
      return
    }

    const controller = new AbortController()
    async function runLoadLogs() {
      await loadLogs(controller.signal)
    }

    runLoadLogs()
    const intervalId = setInterval(() => loadLogs(controller.signal), 5000)

    return () => {
      controller.abort()
      clearInterval(intervalId)
    }
  }, [adminEnabled, loadLogs, reloadToken])

  const forceScrape = useCallback(async () => {
    if (!adminEnabled || !authHeaders) {
      return { success: false, message: 'Sesi admin tidak tersedia.' }
    }

    setActionFeedback('submitting', '')

    try {
      const result = await apiFetch('/api/admin/scrape-now', {
        method: 'POST',
        headers: authHeaders,
      })
      setActionFeedback('success', result.message || 'Scraper berhasil dipicu.')
      bumpReload()
      return { success: true, message: result.message }
    } catch (error) {
      setActionFeedback('error', error.message)
      return { success: false, message: error.message }
    }
  }, [adminEnabled, authHeaders, bumpReload, setActionFeedback])

  const sendBroadcast = useCallback(async () => {
    if (!adminEnabled || !authHeaders) {
      return { success: false, message: 'Sesi admin tidak tersedia.' }
    }

    if (!broadcastMessage.trim()) {
      setBroadcastStatus('error')
      setBroadcastFeedback('Pesan broadcast wajib diisi.')
      return { success: false, message: 'Pesan broadcast wajib diisi.' }
    }

    setBroadcastStatus('submitting')
    setBroadcastFeedback('')

    try {
      const result = await apiFetch('/api/admin/broadcast', {
        method: 'POST',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: broadcastMessage.trim() }),
      })
      setBroadcastStatus('success')
      setBroadcastFeedback(result.message || 'Broadcast berhasil dikirim.')
      setBroadcastMessage('')
      bumpReload()
      return { success: true, message: result.message }
    } catch (error) {
      setBroadcastStatus('error')
      setBroadcastFeedback(error.message)
      return { success: false, message: error.message }
    }
  }, [adminEnabled, authHeaders, broadcastMessage, bumpReload, setBroadcastStatus, setBroadcastFeedback])

  return {
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
  }
}
