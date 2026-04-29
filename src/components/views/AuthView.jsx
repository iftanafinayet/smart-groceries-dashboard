export default function AuthView({
  authForm,
  authMode,
  authStatus,
  authMessage,
  setAuthForm,
  setAuthMode,
  onAuthSubmit,
}) {
  const isRegister = authMode === 'register'

  return (
    <div className="auth-screen">
      <div className="auth-screen__visual">
        <p className="eyebrow">Sistem Pantau</p>
        <h2>Akses Data Harga Pangan Secara Real-Time.</h2>
        <p>
          Masuk untuk mengakses data harga pangan yang terupdate secara real-time. Pantau fluktuasi harga,
          analisis tren, dan kelola data dengan mudah.
        </p>
        <div className="auth-screen__points">
          <article>
            <strong>Sinkronisasi Instan</strong>
            <p>Dashboard dimuat dengan enkripsi sesi yang aman, menjamin data harga selalu terbaru (up-to-date).</p>
          </article>
          <article>
            <strong>Validasi Data Terpadu</strong>
            <p>Setiap input perubahan harga melewati sistem verifikasi untuk menjaga akurasi informasi publik.</p>
          </article>
        </div>
      </div>

      <section className="auth-card">
        <div className="section-head">
          <div>
            <p className="eyebrow">{isRegister ? 'Register' : 'Login'}</p>
            <h3>{isRegister ? 'Buat akun baru' : 'Masuk ke workspace'}</h3>
            <p className="section-copy">
              {isRegister
                ? 'Akun baru akan dibuat sebagai user standar dan bisa login langsung setelah registrasi.'
                : 'Gunakan akun yang sudah terdaftar untuk membuka dashboard.'}
            </p>
          </div>
        </div>

        <div className="form-grid">
          <label className="input-group">
            <span>Username</span>
            <input
              name="username"
              value={authForm.username}
              onChange={(event) => setAuthForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))}

              placeholder="Contoh: nighwan"
              autoComplete="username"
            />
          </label>
          <label className="input-group">
            <span>Password</span>
            <input
              type="password"
              name="password"
              value={authForm.password}
              onChange={(event) => setAuthForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))}

              placeholder="Masukkan password"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
            />
          </label>
        </div>

        {authMessage ? (
          <div className={`submit-message submit-message--${authStatus === 'error' ? 'error' : 'success'}`}>
            {authMessage}
          </div>
        ) : null}

        <div className="cta-row">
          <button
            className="primary-button"
            type="button"
            onClick={onAuthSubmit}
            disabled={authStatus === 'submitting'}
          >
            <span className="material-symbols-outlined">{isRegister ? 'person_add' : 'login'}</span>
            <span>
              {authStatus === 'submitting'
                ? 'Memproses...'
                : isRegister
                  ? 'Register'
                  : 'Login'}
            </span>
          </button>
          <button
            className="ghost-button ghost-button--inline"
            type="button"
            onClick={() => setAuthMode(isRegister ? 'login' : 'register')}

            disabled={authStatus === 'submitting'}
          >
            {isRegister ? 'Pindah ke login' : 'Buat akun'}
          </button>
        </div>
      </section>
    </div>
  )
}
