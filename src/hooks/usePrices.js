import { useState, useCallback } from 'react'
import { apiFetch } from '../lib/api'

const PRICE_CACHE_KEY = 'smart-groceries-price-cache'

export function usePrices() {
  const [prices, setPrices] = useState(() => {
    try {
      const cached = localStorage.getItem(PRICE_CACHE_KEY)
      return cached ? JSON.parse(cached) : []
    } catch {
      return []
    }
  })

  const [status, setStatus] = useState(prices.length > 0 ? 'success' : 'loading')
  const [error, setError] = useState('')
  const [lastLoadedAt, setLastLoadedAt] = useState('')
  const [usingCachedData, setUsingCachedData] = useState(prices.length > 0)

  const loadPrices = useCallback(async (signal) => {
    setStatus('loading')
    setError('')
    try {
      const result = await apiFetch('/api/prices/latest', { signal })
      const nextPrices = Array.isArray(result) ? result : []
      setPrices(nextPrices)
      setStatus('success')
      setLastLoadedAt(new Date().toISOString())
      setUsingCachedData(false)
      localStorage.setItem(PRICE_CACHE_KEY, JSON.stringify(nextPrices))
    } catch (e) {
      if (e.name === 'AbortError') return
      try {
        const cached = localStorage.getItem(PRICE_CACHE_KEY)
        const fallbackPrices = cached ? JSON.parse(cached) : []
        if (fallbackPrices.length > 0) {
          setPrices(fallbackPrices)
          setStatus('success')
          setUsingCachedData(true)
          setError(e.message)
          return
        }
      } catch {
        // Ignore cache parsing issues and fall through to the network error state.
      }
      setPrices([])
      setStatus('error')
      setUsingCachedData(false)
      setError(e.message)
    }
  }, [])

  return {
    prices,
    status,
    error,
    lastLoadedAt,
    usingCachedData,
    loadPrices,
  }
}
