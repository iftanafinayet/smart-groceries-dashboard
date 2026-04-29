import { formatCurrency } from '../../lib/market'
import { STAPLE_FOODS, PROVINCES, CITY_MAP } from '../../lib/constants'

export default function ReportComposerView({
  commodity,
  latestReports,
  userReports,
  commodityOptions,
  myReports,
  form,
  errors,
  submitState,
  submitMessage,
  draftMessage,
  reportSubmissionEnabled,
  reportCapabilityLabel,
  onChange,
  onSubmit,
  onSaveDraft,
  onResetDraft,
}) {
  const commodityNames = commodityOptions.length > 0
    ? commodityOptions
    : STAPLE_FOODS.map((item) => item.name)
  const currentCommodity = commodity
    || STAPLE_FOODS.find((item) => item.name === form.komoditas)
    || STAPLE_FOODS[0]
  const marketExamples = latestReports
    .filter((report) => !form.komoditas || report.komoditas === form.komoditas)
    .slice(0, 3)

  const handleCommodityChange = (val) => {
    onChange('komoditas', val)
  }

  const handleProvinceChange = (val) => {
    onChange('provinsi', val)
    onChange('kota', '') // Reset city when province changes
  }

  return (
    <div className="report-layout">
      <section className="surface-card report-layout__main">
        <div className="section-head">
          <div>
            <p className="eyebrow">Contribute Data</p>
            <h3>Market Intelligence Report</h3>
            <p className="section-copy">
              Help the community track fiscal reality. Your reports verify local prices.
            </p>
          </div>
          <div className="streak-card">
            <span className="material-symbols-outlined">star</span>
            <div>
              <strong>Level 3</strong>
              <p>+50 pts untuk laporan baru</p>
            </div>
          </div>
        </div>

        <div className="progress-strip">
          <span className="progress-strip__bar" />
          <div>
            <strong>Current workflow</strong>
            <p>{reportCapabilityLabel}</p>
          </div>
        </div>

        <div className="form-grid">
          <label className="input-group">
            <span>Select Commodity</span>
            <select
              name="komoditas"
              value={form.komoditas || currentCommodity.name}
              onChange={(event) => handleCommodityChange(event.target.value)}
              className="select-field select-field--compact"
              style={{ background: 'rgba(255, 255, 255, 0.9)', color: 'var(--heading)', width: '100%', padding: '12px' }}
            >
              {commodityNames.map((name) => {
                const stapleMeta = STAPLE_FOODS.find((item) => item.name === name)
                return (
                  <option key={name} value={name}>
                    {name} {stapleMeta?.unit ? `(${stapleMeta.unit})` : ''}
                  </option>
                )
              })}
            </select>
            {errors.komoditas ? <small className="field-error">{errors.komoditas}</small> : null}
          </label>

          <label className="input-group">
            <span>Latest Reference Price</span>
            <input readOnly value={commodity ? formatCurrency(commodity.latest.harga) : 'Rp0'} />
          </label>

          <label className="input-group">
            <span>Province</span>
            <select
              name="provinsi"
              value={form.provinsi || ''}
              onChange={(event) => handleProvinceChange(event.target.value)}
              className="select-field select-field--compact"
              style={{ background: 'rgba(255, 255, 255, 0.9)', color: 'var(--heading)', width: '100%', padding: '12px' }}
            >
              <option value="">Pilih Provinsi</option>
              {PROVINCES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            {errors.provinsi ? <small className="field-error">{errors.provinsi}</small> : null}
          </label>

          <label className="input-group">
            <span>City / Market</span>
            <select
              name="kota"
              value={form.kota || ''}
              onChange={(event) => onChange(event.target.name, event.target.value)}
              className="select-field select-field--compact"
              style={{ background: 'rgba(255, 255, 255, 0.9)', color: 'var(--heading)', width: '100%', padding: '12px' }}
            >
              <option value="">Pilih Kota</option>
              {(CITY_MAP[form.provinsi] || []).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
              {/* Fallback option if city not in map */}
              {!CITY_MAP[form.provinsi] && <option value="Other">Lainnya</option>}
            </select>
            {errors.kota ? <small className="field-error">{errors.kota}</small> : null}
          </label>

          <label className="input-group">
            <span>Observed Price ({currentCommodity.unit})</span>
            <input
              name="harga"
              value={form.harga}
              onChange={(event) => onChange(event.target.name, event.target.value)}
              placeholder="Contoh: 82000"
              inputMode="numeric"
            />
            {errors.harga ? <small className="field-error">{errors.harga}</small> : null}
          </label>
        </div>

        <label className="input-group input-group--stacked">
          <span>Notes</span>
          <textarea
            name="catatan"
            value={form.catatan}
            onChange={(event) => onChange(event.target.name, event.target.value)}
            placeholder="Tambahkan konteks, misalnya kualitas barang atau waktu pengamatan."
            rows="5"
          />
        </label>

        {submitMessage ? (
          <div className={`submit-message submit-message--${submitState}`}>
            {submitMessage}
          </div>
        ) : null}

        {draftMessage ? <div className="submit-message submit-message--draft">{draftMessage}</div> : null}

        <div className="report-cta">
          <button
            className="primary-button"
            type="button"
            onClick={onSubmit}
            disabled={submitState === 'submitting' || !reportSubmissionEnabled}
          >
            <span className="material-symbols-outlined">send</span>
            <span>
              {submitState === 'submitting'
                ? 'Mengirim...'
                : reportSubmissionEnabled
                  ? 'Submit report'
                  : 'Submit belum tersedia'}
            </span>
          </button>
          <button className="ghost-button ghost-button--inline" type="button" onClick={onSaveDraft}>
            Simpan draft
          </button>
          <button className="ghost-button ghost-button--inline" type="button" onClick={onResetDraft}>
            Reset form
          </button>
        </div>
 
        <section className="surface-card surface-card--compact mt-md" style={{ marginTop: '24px', background: 'rgba(255, 255, 255, 0.4)' }}>
          <div className="section-head section-head--compact">
            <div>
              <p className="eyebrow">Community Impact</p>
              <h3>Kontribusi pengguna</h3>
            </div>
          </div>
          <div className="impact-list impact-list--horizontal">
            <article>
              <strong>{userReports}</strong>
              <p>Laporan user masuk.</p>
            </article>
            <article>
              <strong>{myReports.filter((item) => item.moderationStatus === 'approved').length}</strong>
              <p>Reports approved.</p>
            </article>
            <article>
              <strong>{myReports.filter((item) => item.moderationStatus === 'pending').length}</strong>
              <p>Pending review.</p>
            </article>
          </div>
        </section>
      </section>

      <aside className="report-layout__side">
        <section className="surface-card">
          <div className="section-head">
            <div>
              <p className="eyebrow">Backend Capability</p>
              <h3>Status integrasi</h3>
            </div>
          </div>
          <div className="impact-list">
            <article>
              <strong>GET /api/prices/latest</strong>
              <p>Dipakai dashboard untuk sinkronisasi harga terbaru dari backend.</p>
            </article>
            <article>
              <strong>{reportSubmissionEnabled ? 'POST /api/prices/report aktif' : 'Session diperlukan'}</strong>
              <p>{reportCapabilityLabel}</p>
            </article>
            <article>
              <strong>Moderation flow</strong>
              <p>Laporan user masuk sebagai `pending`, lalu admin akan approve atau reject dengan feedback.</p>
            </article>
          </div>
        </section>

        <section className="surface-card">
          <div className="section-head">
            <div>
              <p className="eyebrow">Reference Markets</p>
              <h3>Harga pembanding</h3>
            </div>
          </div>
          <div className="market-list">
            {marketExamples.map((report, index) => (
              <article
                className={`market-item ${index === 0 ? 'is-best' : ''}`}
                key={report._id ?? index}
              >
                <div>
                  <strong>{report.lokasi || 'Lokasi tidak tersedia'}</strong>
                  <p>{report.komoditas}</p>
                </div>
                <span>{formatCurrency(report.harga)}</span>
              </article>
            ))}
          </div>
        </section>


        <section className="surface-card">
          <div className="section-head">
            <div>
              <p className="eyebrow">My Reports</p>
              <h3>Status moderasi terbaru</h3>
            </div>
          </div>
          <div className="impact-list">
            {myReports.slice(0, 5).map((report) => (
              <article key={report._id ?? `${report.komoditas}-${report.tanggal}`}>
                <strong>{report.komoditas}</strong>
                <p>
                  {report.lokasi || 'Lokasi tidak diketahui'} • {formatCurrency(report.harga)}
                </p>
                <div className="tag-row">
                  <span>{report.moderationStatus || 'pending'}</span>
                  <span>{report.reviewedBy?.username ? `Reviewed by ${report.reviewedBy.username}` : 'Belum direview'}</span>
                </div>
                {report.reviewNote ? <p>Catatan admin: {report.reviewNote}</p> : null}
              </article>
            ))}
            {myReports.length === 0 ? (
              <article>
                <strong>Belum ada riwayat laporan.</strong>
                <p>Status moderasi laporan Anda akan muncul di sini setelah login dan submit report.</p>
              </article>
            ) : null}
          </div>
        </section>
      </aside>
    </div>
  )
}
