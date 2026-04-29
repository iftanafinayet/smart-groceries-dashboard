const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')
const DEFAULT_BACKEND_URL = 'https://scrapper-harga-pangan.onrender.com'
import { useAuthStore } from './authStore'

export function buildEndpoint(path) {
  return API_BASE_URL ? `${API_BASE_URL}${path}` : path
}

export function getBackendUrl() {
  return API_BASE_URL || DEFAULT_BACKEND_URL
}

export async function apiFetch(endpoint, options = {}) {
  const url = buildEndpoint(endpoint)
  
  const headers = { ...options.headers }
  const token = useAuthStore.getState().token
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  const response = await fetch(url, { ...options, headers })
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Backend merespons ${response.status}`);
  }
  
  return response.json();
}

