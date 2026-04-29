import { useCallback } from 'react'
import { buildEndpoint, apiFetch } from '../lib/api'
import { downloadTextFile, toCsv } from '../lib/utils'

export function useDataExport({ authState, prices, showToast }) {
  const handleExportData = useCallback(async (format) => {
    if (format === 'json') {
      downloadTextFile(
        'smart-groceries-snapshot.json',
        JSON.stringify(prices, null, 2),
        'application/json;charset=utf-8',
      )
      return
    }

    if (format === 'csv') {
      const rows = prices.map((price) => ({
        komoditas: price.komoditas,
        harga: price.harga,
        lokasi: price.lokasi,
        sumber: price.sumber,
        tanggal: price.tanggal,
        moderationStatus: price.moderationStatus,
        verifications: price.verifications,
      }))
      downloadTextFile(
        'smart-groceries-snapshot.csv',
        toCsv(rows),
        'text/csv;charset=utf-8',
      )
      return
    }

    if (!authState.token || authState.user?.role !== 'admin') {
      showToast({
        tone: 'error',
        title: 'Akses ditolak',
        message: 'Full export hanya tersedia untuk admin.',
      })
      return
    }

    try {
      const response = await fetch(buildEndpoint('/api/admin/export?format=json'), {
        headers: { Authorization: `Bearer ${authState.token}` },
      })
      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(payload?.error || `Backend merespons ${response.status}`)
      }

      downloadTextFile(
        'smart-groceries-full-export.json',
        JSON.stringify(payload, null, 2),
        'application/json;charset=utf-8',
      )
    } catch (exportError) {
      showToast({
        tone: 'error',
        title: 'Export gagal',
        message: exportError.message,
      })
    }
  }, [authState.token, authState.user?.role, prices, showToast])

  return {
    handleExportData,
  }
}
