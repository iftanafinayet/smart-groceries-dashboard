import { useState, useCallback } from 'react'
import { apiFetch } from '../lib/api'

export function useNotifications({ authState, showToast }) {
  const [notifications, setNotifications] = useState([])

  const fetchNotifications = useCallback(async (signal) => {
    if (!authState.token) {
      setNotifications([])
      return
    }

    try {
      const authHeaders = { Authorization: `Bearer ${authState.token}` }
      const result = await apiFetch('/api/prices/notifications', { headers: authHeaders, signal })
      setNotifications(Array.isArray(result) ? result : [])
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

  const handleMarkNotificationRead = useCallback(async (notificationId) => {
    if (!authState.token || !notificationId) {
      return
    }

    setNotifications((current) => current.map((item) => (
      item._id === notificationId ? { ...item, isRead: true } : item
    )))

    try {
      await apiFetch(`/api/prices/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${authState.token}` },
      })
    } catch (markError) {
      showToast({
        tone: 'error',
        title: 'Notification update failed',
        message: markError.message,
      })
      await fetchNotifications()
    }
  }, [authState.token, showToast, fetchNotifications])

  const handleMarkAllNotificationsRead = useCallback(async () => {
    if (!authState.token) {
      return
    }

    setNotifications((current) => current.map((item) => ({ ...item, isRead: true })))

    try {
      await apiFetch('/api/prices/notifications/read-all', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${authState.token}` },
      })
    } catch (markError) {
      showToast({
        tone: 'error',
        title: 'Notification update failed',
        message: markError.message,
      })
      await fetchNotifications()
    }
  }, [authState.token, showToast, fetchNotifications])

  return {
    notifications,
    setNotifications,
    fetchNotifications,
    handleMarkNotificationRead,
    handleMarkAllNotificationsRead,
  }
}
