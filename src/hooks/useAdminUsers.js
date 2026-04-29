import { useState, useEffect, useCallback } from 'react'
import { apiFetch } from '../lib/api'

export function useAdminUsers({ authState, userSearch, reloadToken, bumpReload, setActionFeedback }) {
  const [adminUsers, setAdminUsers] = useState([])
  const [selectedAdminUser, setSelectedAdminUser] = useState(null)
  const [selectedAdminUserReports, setSelectedAdminUserReports] = useState([])

  const adminEnabled = Boolean(authState.token) && authState.user?.role === 'admin'
  const authHeaders = adminEnabled ? { Authorization: `Bearer ${authState.token}` } : null

  const loadUsers = useCallback(async (signal) => {
    if (!adminEnabled || !authHeaders) {
      return
    }

    const userQuery = userSearch.trim()
      ? `?q=${encodeURIComponent(userSearch.trim())}`
      : ''

    try {
      const users = await apiFetch(`/api/admin/users${userQuery}`, {
        headers: authHeaders,
        signal,
      })
      setAdminUsers(Array.isArray(users) ? users : [])
    } catch (error) {
      if (error.name === 'AbortError') {
        return
      }
    }
  }, [adminEnabled, authHeaders, userSearch])

  useEffect(() => {
    if (!adminEnabled) {
      return
    }

    const controller = new AbortController()
    async function runLoad() {
      await loadUsers(controller.signal)
    }

    runLoad()
    return () => controller.abort()
  }, [adminEnabled, loadUsers, reloadToken])

  const loadSelectedUserReports = useCallback(async (userId) => {
    if (!adminEnabled || !authHeaders || !userId) {
      setSelectedAdminUserReports([])
      return
    }

    try {
      const reports = await apiFetch(`/api/admin/users/${userId}/reports`, {
        headers: authHeaders,
      })
      setSelectedAdminUserReports(Array.isArray(reports) ? reports : [])
    } catch (error) {
      setSelectedAdminUserReports([])
      // We might need to pass setActionFeedback or similar here
    }
  }, [adminEnabled, authHeaders])

  useEffect(() => {
    if (!selectedAdminUser) {
      return
    }

    const selectedUserId = selectedAdminUser._id ?? selectedAdminUser.id
    loadSelectedUserReports(selectedUserId)
  }, [loadSelectedUserReports, reloadToken, selectedAdminUser])

  const updateUserRole = useCallback(async (userId, role) => {
    if (!adminEnabled || !authHeaders || !userId) {
      return { success: false, message: 'Sesi admin tidak tersedia.' }
    }

    setActionFeedback('submitting', '')

    try {
      const result = await apiFetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      })
      setActionFeedback('success', result.message || 'Role user diperbarui.')

      setSelectedAdminUser((current) => {
        if (!current) return current
        const currentId = current._id ?? current.id
        if (currentId !== userId) return current
        return { ...current, ...result.user }
      })

      bumpReload()
      return { success: true, message: result.message }
    } catch (error) {
      setActionFeedback('error', error.message)
      return { success: false, message: error.message }
    }
  }, [adminEnabled, authHeaders, bumpReload, setActionFeedback])

  const toggleUserBan = useCallback(async (user) => {
    const userId = user?._id ?? user?.id
    if (!adminEnabled || !authHeaders || !userId) {
      return { success: false, message: 'Sesi admin tidak tersedia.' }
    }

    const isBanned = Boolean(user.isBanned ?? user.banned)
    setActionFeedback('submitting', '')

    try {
      const result = await apiFetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isBanned: !isBanned }),
      })
      setActionFeedback('success', result.message || 'Status blokir user diperbarui.')
      bumpReload()
      return { success: true, message: result.message }
    } catch (error) {
      setActionFeedback('error', error.message)
      return { success: false, message: error.message }
    }
  }, [adminEnabled, authHeaders, bumpReload, setActionFeedback])

  const selectUser = useCallback((user) => {
    setSelectedAdminUserReports([])
    setSelectedAdminUser(user || null)
  }, [])

  return {
    adminUsers,
    selectedAdminUser,
    setSelectedAdminUser,
    selectedAdminUserReports,
    updateUserRole,
    toggleUserBan,
    selectUser,
    loadUsers,
  }
}
