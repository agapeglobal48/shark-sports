import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { Check, Loader2, ShoppingBag } from 'lucide-react'
import { api } from '../api/client.js'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { cldImage, formatPrice } from '../lib/format.js'
import { SplitLines } from '../components/motion.jsx'
import { useSeo } from '../hooks/useSeo.js'
import ImagePlaceholder from '../components/ImagePlaceholder.jsx'

const EASE = [0.16, 1, 0.3, 1]

// /checkout/success?session_id=cs_...  (Stripe sends people here after paying)
export function CheckoutSuccess() {
  const [params] = useSearchParams()
  const sessionId = params.get('session_id')
  const { clear } = useCart()
  const { user } = useAuth()
  const [order, setOrder] = useState(null)
  const [loadError, setError] = useState(null)
  const error = sessionId ? loadError : { message: 'Missing order reference.' }

  useSeo({ title: 'Order confirmed', noindex: true })

  // Load the order. If Stripe hasn't confirmed payment yet, check again a few times.
  useEffect(() => {
    if (!sessionId) return
    let alive = true
    let tries = 0
    async function load() {
      try {
        const o = await api.checkoutSession(sessionId)
        if (!alive) return
        setOrder(o)
        if (o.status === 'PENDING' && tries++ < 8) setTimeout(load, 2000)
      } catch (e) {
        if (alive) setError(e)
      }
    }
    load()
    return () => {
      alive = false
    }
  }, [sessionId])

  const paid = order && order.status !== 'PENDING' && order.status !== 'CANCELLED'

  // Empty the bag once the payment is confirmed.
  useEffect(() => {
    if (paid) clear()
  }, [paid, clear])

  if (error) {
    return (
      <Shell>
        <h1 className="font-display text-5xl uppercase">We couldn't find that order</h1>
        <p className="mt-3 text-mute">{error.message} If you were charged, you'll get an email receipt from Stripe, and you can contact us with it.</p>
        <Link to="/" className="btn btn-primary mt-8">
          <span>Back to the store</span>
        </Link>
      </Shell>
    )
  }

  if (!order || order.status === 'PENDING') {
    return (
      <Shell>
        <Loader2 className="mx-auto mb-6 animate-spin text-blaze" size={40} />
        <h1 className="font-display text-4xl uppercase">Confirming your payment…</h1>
        <p className="mt-3 text-mute">This usually takes a few seconds. Please don't close this page.</p>
      </Shell>
    )
  }

  return (
    <div className="container-x max-w-3xl pb-10 pt-32 md:pt-40">
      <motion.div
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
        className="mb-8 grid h-20 w-20 place-items-center rounded-full bg-blaze text-ink"
      >
        <Check size={40} strokeWidth={3} />
      </motion.div>
      <p className="eyebrow mb-3">Order {order.orderNumber}</p>
      <h1 className="font-display text-6xl uppercase leading-[0.9] md:text-8xl">
        <SplitLines lines={['Thank you', <span key="b" className="text-blaze">for your order</span>]} delay={0.2} />
      </h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-6 text-lg text-bone/80">
        We've received your payment and we'll get your order ready to ship.
        {order.email && (
          <>
            {' '}Your receipt will be emailed to <span className="font-bold text-bone">{order.email}</span>.
          </>
        )}
      </motion.p>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.8, ease: EASE }} className="mt-12 rounded-3xl border border-line bg-coal p-6 md:p-8">
        <ul className="divide-y divide-line">
          {order.items.map((item, i) => (
            <li key={i} className="flex gap-4 py-4 first:pt-0">
              <div className="h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-steel">
                {item.imageUrl ? <img src={cldImage(item.imageUrl, 200)} alt="" className="h-full w-full object-cover" /> : <ImagePlaceholder small />}
              </div>
              <div className="flex flex-1 justify-between gap-3">
                <div>
                  <p className="font-bold">{item.productName}</p>
                  <p className="text-sm text-mute">
                    {item.colorName} · {item.size} · Qty {item.quantity}
                  </p>
                </div>
                <p className="font-bold">{formatPrice(item.unitPricePence * item.quantity)}</p>
              </div>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
          <Row label="Subtotal" value={formatPrice(order.subtotalPence)} />
          <Row label="Delivery" value={order.shippingPence ? formatPrice(order.shippingPence) : 'Free'} />
          <div className="flex justify-between pt-2 text-lg">
            <dt className="font-bold">Total paid</dt>
            <dd className="font-display text-3xl">{formatPrice(order.totalPence)}</dd>
          </div>
        </dl>
        {order.shipping && (
          <div className="mt-6 border-t border-line pt-6 text-sm">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-mute">Delivering to</p>
            <p className="font-bold">{order.shipping.name}</p>
            <p className="text-bone/80">
              {[order.shipping.line1, order.shipping.line2, order.shipping.city, order.shipping.postcode].filter(Boolean).join(', ')}
            </p>
          </div>
        )}
      </motion.div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link to="/shop" className="btn btn-primary">
          <span>Keep shopping</span>
        </Link>
        {user ? (
          <Link to="/account" className="btn btn-ghost">
            <span>View my orders</span>
          </Link>
        ) : (
          <Link to="/register" className="btn btn-ghost">
            <span>Create an account</span>
          </Link>
        )}
      </div>
    </div>
  )
}

// /checkout/cancelled  (they backed out of the Stripe page)
export function CheckoutCancelled() {
  const { setOpen, count } = useCart()
  useSeo({ title: 'Checkout cancelled', noindex: true })
  return (
    <Shell>
      <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full bg-steel">
        <ShoppingBag className="text-mute" />
      </div>
      <h1 className="font-display text-5xl uppercase">Payment cancelled</h1>
      <p className="mt-3 text-mute">No money was taken. Your bag is saved, so you can check out whenever you're ready.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {count > 0 && (
          <button className="btn btn-primary" onClick={() => setOpen(true)}>
            <span>Back to my bag</span>
          </button>
        )}
        <Link to="/shop" className="btn btn-ghost">
          <span>Keep shopping</span>
        </Link>
      </div>
    </Shell>
  )
}

function Shell({ children }) {
  return <div className="container-x flex min-h-[75vh] max-w-xl flex-col items-center justify-center pt-24 text-center">{children}</div>
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <dt className="text-mute">{label}</dt>
      <dd className="font-bold">{value}</dd>
    </div>
  )
}
