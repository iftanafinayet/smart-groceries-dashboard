import { useState, useCallback } from 'react'
import { apiFetch } from '../lib/api'
import { buildReportPayload } from '../lib/location'

const REPORT_DRAFT_KEY = 'smart-groceries-report-draft'
const initialReportForm = {
  komoditas: '',
  provinsi: '',
  kota: '',
  lokasi: '',
  harga: '',
  catatan: '',
}

export function useReportComposer({ authState, showToast, loadPrices, loadUserActivity, defaultCommodity }) {
  const [reportForm, setReportForm] = useState(() => {
    try {
      const cached = localStorage.getItem(REPORT_DRAFT_KEY)
      return cached ? { ...initialReportForm, ...JSON.parse(cached) } : { ...initialReportForm, komoditas: defaultCommodity }
    } catch {
      return { ...initialReportForm, komoditas: defaultCommodity }
    }
  })
  const [reportErrors, setReportErrors] = useState({})
  const [reportSubmitState, setReportSubmitState] = useState('idle')
  const [reportSubmitMessage, setReportSubmitMessage] = useState('')
  const [reportDraftMessage, setReportDraftMessage] = useState('')

  const handleReportChange = useCallback((name, value) => {
    setReportForm((current) => ({ ...current, [name]: value }))
    setReportErrors((current) => {
      if (!current[name]) {
        return current
      }

      const nextErrors = { ...current }
      delete nextErrors[name]
      return nextErrors
    })
    setReportDraftMessage('')
  }, [])

  const validateReport = useCallback(() => {
    const nextErrors = {}
    const payload = buildReportPayload(reportForm)

    if (!payload.komoditas) {
      nextErrors.komoditas = 'Komoditas wajib dipilih.'
    }
    if (!payload.provinsi) {
      nextErrors.provinsi = 'Provinsi wajib dipilih.'
    }
    if (!payload.kota) {
      nextErrors.kota = 'Kota wajib dipilih.'
    }
    if (!Number.isFinite(payload.harga) || payload.harga <= 0) {
      nextErrors.harga = 'Harga harus berupa angka yang valid.'
    }
    if (!payload.lokasi) {
      nextErrors.kota = 'Lokasi laporan belum lengkap.'
    }
    if (!Number.isFinite(payload.lat) || !Number.isFinite(payload.lng)) {
      nextErrors.kota = 'Koordinat kota belum tersedia untuk lokasi ini.'
    }

    setReportErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }, [reportForm])

  const handleSubmitReport = useCallback(async () => {
    if (!authState.token) {
      setReportSubmitState('error')
      setReportSubmitMessage('Login diperlukan untuk mengirim laporan.')
      return
    }

    if (!validateReport()) {
      setReportSubmitState('error')
      setReportSubmitMessage('Periksa kembali field laporan yang wajib diisi.')
      return
    }

    const payload = buildReportPayload(reportForm)
    setReportSubmitState('submitting')
    setReportSubmitMessage('')

    try {
      const result = await apiFetch('/api/prices/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authState.token}`,
        },
        body: JSON.stringify(payload),
      })
      setReportSubmitState('success')
      setReportSubmitMessage(result.message || 'Laporan berhasil dikirim.')
      showToast({
        tone: 'success',
        title: 'Submitted',
        message: 'Laporan berhasil dikirim untuk moderasi admin.',
      })
      localStorage.removeItem(REPORT_DRAFT_KEY)
      setReportForm({ ...initialReportForm, komoditas: defaultCommodity })
      setReportErrors({})
      return { success: true }
    } catch (submitError) {
      setReportSubmitState('error')
      setReportSubmitMessage(submitError.message)
      return { success: false, error: submitError.message }
    }
  }, [authState.token, loadPrices, loadUserActivity, reportForm, showToast, validateReport, defaultCommodity])

  const handleSaveDraft = useCallback(() => {
    localStorage.setItem(REPORT_DRAFT_KEY, JSON.stringify(reportForm))
    setReportDraftMessage('Draft saved')
  }, [reportForm])

  const handleResetDraft = useCallback(() => {
    localStorage.removeItem(REPORT_DRAFT_KEY)
    setReportForm({ ...initialReportForm, komoditas: defaultCommodity })
    setReportErrors({})
    setReportDraftMessage('Draft dihapus')
  }, [defaultCommodity])

  return {
    reportForm,
    setReportForm,
    reportErrors,
    reportSubmitState,
    reportSubmitMessage,
    reportDraftMessage,
    handleReportChange,
    handleSubmitReport,
    handleSaveDraft,
    handleResetDraft,
  }
}
