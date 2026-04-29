import { useState } from 'react'
import { apiFetch } from '../lib/api'
import { useAuthStore } from '../lib/authStore'

export function useAuth() {
  const { token, user, setAuth, clearAuth } = useAuthStore()

  const [authForm, setAuthForm] = useState({ username: '', password: '' })
  const [authMode, setAuthMode] = useState('login')
  const [authStatus, setAuthStatus] = useState('idle')
  const [authMessage, setAuthMessage] = useState('')

  const login = async () => {
    const { username, password } = authForm
    if (!username || !password) {
      setAuthStatus('error')
      setAuthMessage('Username dan password wajib diisi.')
      return
    }

    setAuthStatus('submitting')
    setAuthMessage('')
    try {
      const result = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      setAuth(result.token || '', result.user || null)
      setAuthStatus('success')
      setAuthMessage(`Login berhasil sebagai ${result.user?.username || username}.`)
      setAuthForm({ username: '', password: '' })
      return { success: true }
    } catch (e) {
      setAuthStatus('error')
      setAuthMessage(e.message)
      return { success: false }
    }
  }

  const register = async () => {
    const { username, password } = authForm
    if (!username || !password) {
      setAuthStatus('error')
      setAuthMessage('Username dan password wajib diisi.')
      return
    }

    setAuthStatus('submitting')
    setAuthMessage('')
    try {
      const result = await apiFetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      setAuthStatus('success')
      setAuthMessage(result.message || 'Registrasi berhasil. Silakan login.')
      setAuthMode('login')
      setAuthForm((current) => ({ ...current, password: '' }))
      return { success: true }
    } catch (e) {
      setAuthStatus('error')
      setAuthMessage(e.message)
      return { success: false }
    }
  }

  const logout = () => {
    clearAuth()
    setAuthForm({ username: '', password: '' })
  }

  return {
    authState: { token, user },
    authForm,
    setAuthForm,
    authMode,
    setAuthMode,
    authStatus,
    authMessage,
    setAuthMessage,
    login,
    register,
    logout,
  }
}
