import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { AlertTriangle, Check, Loader2, X } from 'lucide-react'
import { cx } from '../lib/format.js'

// ─── Layout pieces ───────────────────────────────────────

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-4xl uppercase md:text-5xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-mute">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function Card({ title, description, actions, children, className }) {
  return (
    <section className={cx('rounded-2xl border border-line bg-coal p-5 md:p-6', className)}>
      {(title || actions) && (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-sm font-extrabold uppercase tracking-[0.2em]">{title}</h2>}
            {description && <p className="mt-1 text-sm text-mute">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  )
}

// ─── Buttons ─────────────────────────────────────────────

const variants = {
  primary: 'bg-blaze text-ink hover:bg-bone',
  secondary: 'border border-line bg-steel text-bone hover:border-bone/40',
  ghost: 'text-mute hover:bg-bone/10 hover:text-bone',
  danger: 'border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-ink',
}

export function Button({ variant = 'secondary', size = 'md', loading, icon: Icon, children, className, ...props }) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50',
        size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2.5 text-sm',
        variants[variant],
        className,
      )}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : Icon && <Icon size={size === 'sm' ? 14 : 16} />}
      {children}
    </button>
  )
}

// ─── Form fields ─────────────────────────────────────────

export function Field({ label, hint, error, children, className }) {
  return (
    <label className={cx('block', className)}>
      {label && <span className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-mute">{label}</span>}
      {children}
      {error ? <span className="mt-1.5 block text-xs text-red-400">{error}</span> : hint && <span className="mt-1.5 block text-xs text-mute">{hint}</span>}
    </label>
  )
}

const inputCls =
  'w-full rounded-xl border border-line bg-ink px-3.5 py-2.5 text-sm text-bone outline-none transition-colors placeholder:text-mute/60 focus:border-blaze aria-[invalid=true]:border-red-400'

export function Input({ error, className, ...props }) {
  return <input {...props} aria-invalid={!!error} className={cx(inputCls, className)} />
}

export function Textarea({ error, className, ...props }) {
  return <textarea {...props} aria-invalid={!!error} className={cx(inputCls, 'min-h-28 resize-y', className)} />
}

export function Select({ error, className, children, ...props }) {
  return (
    <select {...props} aria-invalid={!!error} className={cx(inputCls, 'cursor-pointer', className)}>
      {children}
    </select>
  )
}

export function PriceInput({ value, onChange, error, placeholder = '0.00', className, ...props }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-mute">£</span>
      <Input {...props} inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} error={error} placeholder={placeholder} className={cx(className, 'pl-7')} />
    </div>
  )
}

export function Toggle({ checked, onChange, label, description, disabled }) {
  return (
    <label className={cx('flex cursor-pointer items-start gap-3', disabled && 'pointer-events-none opacity-50')}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cx('relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors duration-300', checked ? 'bg-blaze' : 'bg-line')}
      >
        <motion.span layout transition={{ type: 'spring', stiffness: 500, damping: 30 }} className={cx('absolute top-1 h-4 w-4 rounded-full bg-bone', checked ? 'right-1' : 'left-1')} />
      </button>
      {(label || description) && (
        <span>
          {label && <span className="block text-sm font-bold">{label}</span>}
          {description && <span className="block text-xs text-mute">{description}</span>}
        </span>
      )}
    </label>
  )
}

export function StatusPill({ active }) {
  return (
    <span className={cx('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider', active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-bone/10 text-mute')}>
      <span className={cx('h-1.5 w-1.5 rounded-full', active ? 'bg-emerald-400' : 'bg-mute')} />
      {active ? 'Live' : 'Hidden'}
    </span>
  )
}

export function StockPill({ stock, threshold = 5 }) {
  const cls = stock === 0 ? 'bg-red-500/15 text-red-400' : stock <= threshold ? 'bg-amber-500/15 text-amber-400' : 'bg-bone/10 text-bone/80'
  return <span className={cx('rounded-full px-2.5 py-1 text-xs font-bold tabular-nums', cls)}>{stock === 0 ? 'Out of stock' : `${stock} in stock`}</span>
}

// ─── Toasts ──────────────────────────────────────────────

const ToastContext = createContext(() => {})

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const toast = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), type === 'error' ? 6000 : 3000)
  }, [])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[90] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2" aria-live="polite">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60 }}
              className={cx(
                'pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-2xl backdrop-blur-xl',
                t.type === 'error' ? 'border-red-500/40 bg-red-950/90 text-red-100' : 'border-line bg-steel/95 text-bone',
              )}
            >
              {t.type === 'error' ? <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-400" /> : <Check size={18} className="mt-0.5 shrink-0 text-emerald-400" />}
              <span className="flex-1">{t.message}</span>
              <button onClick={() => setToasts((all) => all.filter((x) => x.id !== t.id))} aria-label="Dismiss" className="text-mute hover:text-bone">
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(ToastContext)

// ─── Confirm dialog ──────────────────────────────────────

const ConfirmContext = createContext(async () => false)

export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null)
  const resolver = useRef(null)

  const confirm = useCallback((opts) => {
    setDialog(opts)
    return new Promise((resolve) => (resolver.current = resolve))
  }, [])

  const close = (result) => {
    resolver.current?.(result)
    setDialog(null)
  }

  useEffect(() => {
    if (!dialog) return
    const onKey = (e) => e.key === 'Escape' && close(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AnimatePresence>
        {dialog && (
          <div className="fixed inset-0 z-[95] grid place-items-center p-4">
            <motion.div className="absolute inset-0 bg-ink/80 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => close(false)} />
            <motion.div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="confirm-title"
              className="relative w-full max-w-md rounded-2xl border border-line bg-coal p-6"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <h2 id="confirm-title" className="text-lg font-extrabold">
                {dialog.title}
              </h2>
              {dialog.message && <p className="mt-2 text-sm text-mute">{dialog.message}</p>}
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="ghost" onClick={() => close(false)} autoFocus>
                  Cancel
                </Button>
                <Button variant={dialog.danger === false ? 'primary' : 'danger'} onClick={() => close(true)}>
                  {dialog.confirmLabel || 'Delete'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useConfirm = () => useContext(ConfirmContext)

// ─── Misc ────────────────────────────────────────────────

export function Spinner({ className }) {
  return <Loader2 className={cx('animate-spin text-mute', className)} />
}

export function EmptyState({ title, text, action }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-line px-6 py-16 text-center">
      <p className="text-lg font-extrabold">{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm text-mute">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
