import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Loader2, Lock, Minus, Plus, ShoppingBag, Truck, X } from 'lucide-react'
import { api } from '../api/client.js'
import { useApi } from '../hooks/useApi.js'
import { useCart } from '../context/CartContext.jsx'
import { cldImage, formatPrice } from '../lib/format.js'
import ImagePlaceholder from './ImagePlaceholder.jsx'

const EASE = [0.16, 1, 0.3, 1]

export default function CartDrawer() {
  const { items, open, setOpen, setQty, remove, subtotalPence, count } = useCart()
  const { data: config } = useApi(api.checkoutConfig, 'checkout-config')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function checkout() {
    setBusy(true)
    setError('')
    try {
      const { url } = await api.startCheckout(items.map((i) => ({ variantId: i.variantId, quantity: i.qty })))
      window.location.assign(url) // off to Stripe's secure payment page
    } catch (err) {
      // Stock changed since it was added: fix the bag to what's available and explain.
      const problems = err.errors?.items
      if (Array.isArray(problems)) {
        for (const p of problems) setQty(p.variantId, p.available)
        setError(problems.map((p) => p.message).join('. ') + '. Your bag has been updated.')
      } else {
        setError(err.message)
      }
      setBusy(false)
    }
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, setOpen])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70]">
          <motion.div
            className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.aside
            role="dialog"
            aria-label="Shopping bag"
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-line bg-coal"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <h2 className="font-display text-2xl uppercase tracking-wide">
                Your bag <span className="text-blaze">({count})</span>
              </h2>
              <button onClick={() => setOpen(false)} className="rounded-full p-2 transition duration-300 hover:rotate-90 hover:bg-bone/10" aria-label="Close bag">
                <X size={22} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
                <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: 'spring' }} className="grid h-20 w-20 place-items-center rounded-full bg-steel">
                  <ShoppingBag size={30} className="text-mute" />
                </motion.div>
                <p className="font-display text-3xl uppercase">Your bag is empty</p>
                <p className="text-sm text-mute">Find something worth sinking your teeth into.</p>
                <Link to="/shop" onClick={() => setOpen(false)} className="btn btn-primary mt-2">
                  <span>Start shopping</span>
                </Link>
              </div>
            ) : (
              <>
                <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
                  <AnimatePresence initial={false}>
                    {items.map((item, i) => (
                      <motion.li
                        key={item.variantId}
                        layout
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0, transition: { delay: i * 0.05, ease: EASE, duration: 0.5 } }}
                        exit={{ opacity: 0, x: 60, height: 0, paddingTop: 0, paddingBottom: 0 }}
                        className="flex gap-4 overflow-hidden py-5"
                      >
                        <Link to={`/product/${item.slug}`} onClick={() => setOpen(false)} className="h-28 w-22 shrink-0 overflow-hidden rounded-lg bg-steel">
                          {item.image ? (
                            <img src={cldImage(item.image, 200)} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <ImagePlaceholder small />
                          )}
                        </Link>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex justify-between gap-3">
                            <Link to={`/product/${item.slug}`} onClick={() => setOpen(false)} className="truncate font-bold hover:text-blaze">
                              {item.name}
                            </Link>
                            <span className="shrink-0 font-bold">{formatPrice(item.pricePence * item.qty)}</span>
                          </div>
                          <p className="mt-1 text-sm text-mute">
                            {item.colorName} · {item.size}
                          </p>
                          <div className="mt-auto flex items-center justify-between pt-3">
                            <div className="flex items-center rounded-full border border-line">
                              <QtyButton onClick={() => setQty(item.variantId, item.qty - 1)} label="Decrease quantity">
                                <Minus size={14} />
                              </QtyButton>
                              <span className="w-8 text-center text-sm font-bold tabular-nums">{item.qty}</span>
                              <QtyButton onClick={() => setQty(item.variantId, item.qty + 1)} disabled={item.qty >= item.stock} label="Increase quantity">
                                <Plus size={14} />
                              </QtyButton>
                            </div>
                            <button onClick={() => remove(item.variantId)} className="link-sweep text-xs font-bold uppercase tracking-widest text-mute hover:text-bone">
                              Remove
                            </button>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>

                <div className="space-y-4 border-t border-line bg-ink/40 px-6 py-6">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-bold uppercase tracking-widest text-mute">Subtotal</span>
                    <motion.span key={subtotalPence} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="font-display text-3xl">
                      {formatPrice(subtotalPence)}
                    </motion.span>
                  </div>
                  {config && <DeliveryProgress subtotal={subtotalPence} config={config} />}

                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="rounded-xl border border-blaze/40 bg-blaze/10 px-3 py-2 text-sm text-blaze"
                        role="alert"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <button className="btn btn-primary group w-full" onClick={checkout} disabled={busy || config?.paymentsEnabled === false}>
                    {busy ? (
                      <span className="flex items-center gap-2">
                        <Loader2 size={18} className="animate-spin" /> Taking you to payment…
                      </span>
                    ) : config?.paymentsEnabled === false ? (
                      <span>Checkout unavailable</span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Lock size={16} /> Checkout · {formatPrice(subtotalPence + shippingCost(subtotalPence, config))}
                      </span>
                    )}
                  </button>
                  <p className="text-center text-xs text-mute">Secure payment by Stripe · Cards, Apple Pay & Google Pay</p>
                </div>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}

const shippingCost = (subtotal, config) =>
  !config ? 0 : subtotal >= config.freeShippingOverPence ? 0 : config.standardShippingPence

// "£12.50 away from free delivery" with a bar that fills up.
function DeliveryProgress({ subtotal, config }) {
  const free = subtotal >= config.freeShippingOverPence
  const pct = Math.min(100, (subtotal / config.freeShippingOverPence) * 100)
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-mute">
          <Truck size={16} className={free ? 'text-blaze' : ''} />
          {free ? (
            <span className="font-bold text-bone">You've got free UK delivery</span>
          ) : (
            <span>
              <span className="font-bold text-bone">{formatPrice(config.freeShippingOverPence - subtotal)}</span> away from free delivery
            </span>
          )}
        </span>
        <span className="font-bold">{free ? 'Free' : formatPrice(config.standardShippingPence)}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-line">
        <motion.div className="h-full rounded-full bg-blaze" initial={false} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: EASE }} />
      </div>
    </div>
  )
}

function QtyButton({ children, onClick, disabled, label }) {
  return (
    <button onClick={onClick} disabled={disabled} aria-label={label} className="grid h-8 w-8 place-items-center rounded-full transition hover:bg-bone/10 active:scale-90 disabled:opacity-30">
      {children}
    </button>
  )
}
