import { useEffect } from 'react'

export default function ToastProvider({ toasts, onDismiss }) {
  useEffect(() => {
    if (toasts.length === 0) {
      return undefined
    }

    const timers = toasts.map((toast) =>
      window.setTimeout(() => {
        onDismiss(toast.id)
      }, 3000),
    )

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [toasts, onDismiss])

  return (
    <div className="toast-stack" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <article key={toast.id} className={`toast-card toast-card--${toast.tone || 'info'}`}>
          <div className="toast-card__icon">
            <span className="material-symbols-outlined">
              {toast.tone === 'success'
                ? 'check_circle'
                : toast.tone === 'error'
                  ? 'error'
                  : toast.tone === 'warning'
                    ? 'warning'
                    : 'info'}
            </span>
          </div>
          <div className="toast-card__body">
            <strong>{toast.title}</strong>
            <p>{toast.message}</p>
          </div>
          <button className="icon-button toast-card__close" type="button" onClick={() => onDismiss(toast.id)}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </article>
      ))}
    </div>
  )
}
