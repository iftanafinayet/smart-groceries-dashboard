export default function SplashView() {
  return (
    <div className="splash-screen">
      <div className="splash-screen__orb splash-screen__orb--left" aria-hidden="true" />
      <div className="splash-screen__orb splash-screen__orb--right" aria-hidden="true" />
      <div className="splash-screen__card">
        <div className="splash-screen__badge">
          <img src="/Logo.svg" alt="Logo" style={{ width: '180px', height: '180px', objectFit: 'contain' }} />
        </div>
        <div>
          <h1>Fiscal Reliability</h1>
          <p>Memuat sesi aman, sinkronisasi peran pengguna, dan workspace harga pangan.</p>
        </div>
      </div>
    </div>
  )
}
