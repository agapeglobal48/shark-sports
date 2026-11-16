import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronDown, LogOut, Package, ShieldCheck } from 'lucide-react'
import { api } from '../api/client.js'
import { useApi } from '../hooks/useApi.js'
import { useSeo } from '../hooks/useSeo.js'
import { useAuth } from '../context/AuthContext.jsx'
import { cldImage, cx, formatPrice } from '../lib/format.js'
import { Reveal, SplitLines } from '../components/motion.jsx'
import ImagePlaceholder from '../components/ImagePlaceholder.jsx'
import { ORDER_STATUS, dateFmt } from '../lib/orderStatus.js'

export default function Account() {
  const { user, ready, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  useSeo({ title: 'My account', noindex: true })

  if (!ready) return <div className="min-h-[70vh]" />
  if (!user) return <Navigate to="/login" state={{ from: '/account' }} replace />

  return (
    <div className="container-x min-h-[70vh] pt-32 md:pt-40">
      <p className="eyebrow mb-4">My account</p>
      <h1 className="font-display text-6xl uppercase leading-[0.9] md:text-8xl">
        <SplitLines lines={['Hey,', <span key="n" className="text-blaze">{user.name.split(' ')[0]}</span>]} />
      </h1>

      <div className="mt-14 grid gap-4 md:grid-cols-3">
        <Reveal className="rounded-2xl border border-line bg-coal p-8">
          <p className="text-xs font-bold uppercase tracking-widest text-mute">Details</p>
          <p className="mt-4 text-lg font-bold">{user.name}</p>
          <p className="text-mute">{user.email}</p>
        </Reveal>

        {isAdmin && (
          <Reveal delay={0.08}>
            <Link to="/admin" className="group block h-full rounded-2xl border border-blaze/40 bg-blaze/5 p-8 transition-colors hover:bg-blaze hover:text-ink">
              <ShieldCheck className="text-blaze transition-colors group-hover:text-ink" />
              <p className="mt-4 text-lg font-bold">Admin panel</p>
              <p className="text-mute transition-colors group-hover:text-ink/70">Manage products, orders, stock and categories.</p>
            </Link>
          </Reveal>
        )}
      </div>

      <Orders />

      <div className="mt-10 flex flex-wrap gap-3">
        <Link to="/shop" className="btn btn-primary">
          <span>Continue shopping</span>
        </Link>
        <button
          className="btn btn-ghost"
          onClick={async () => {
            await logout()
            navigate('/')
          }}
        >
          <span className="flex items-center gap-2">
            <LogOut size={16} /> Log out
          </span>
        </button>
      </div>
    </div>
  )
}

function Orders() {
  const { data: orders, loading, error } = useApi(api.myOrders, 'my-orders')
  const [openNo, setOpenNo] = useState(null)

  return (
    <section className="mt-16">
      <h2 className="mb-6 font-display text-4xl uppercase">My orders</h2>
      {loading ? (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-coal" />
          ))}
        </div>
      ) : error ? (
        <p className="text-blaze">{error.message}</p>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-line px-6 py-14 text-center">
          <Package className="text-mute" />
          <p className="mt-4 font-bold">No orders yet</p>
          <p className="mt-1 text-sm text-mute">When you buy something, it'll show up here.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => {
            const open = openNo === o.orderNumber
            const status = ORDER_STATUS[o.status] ?? ORDER_STATUS.PAID
            return (
              <li key={o.orderNumber} className="overflow-hidden rounded-2xl border border-line bg-coal">
                <button onClick={() => setOpenNo(open ? null : o.orderNumber)} className="flex w-full flex-wrap items-center gap-x-6 gap-y-2 p-5 text-left transition-colors hover:bg-steel/50" aria-expanded={open}>
                  <span className="font-bold">{o.orderNumber}</span>
                  <span className="text-sm text-mute">{dateFmt.format(new Date(o.createdAt))}</span>
                  <span className={cx('rounded-full px-2.5 py-1 text-xs font-bold', status.cls)}>{status.label}</span>
                  <span className="ml-auto font-bold">{formatPrice(o.totalPence)}</span>
                  <ChevronDown size={18} className={cx('text-mute transition-transform', open && 'rotate-180')} />
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
                      <div className="border-t border-line p-5">
                        <ul className="space-y-3">
                          {o.items.map((item, i) => (
                            <li key={i} className="flex items-center gap-4">
                              <div className="h-16 w-13 shrink-0 overflow-hidden rounded-lg bg-steel">
                                {item.imageUrl ? <img src={cldImage(item.imageUrl, 120)} alt="" className="h-full w-full object-cover" /> : <ImagePlaceholder small />}
                              </div>
                              <div className="min-w-0 flex-1">
                                {item.productSlug ? (
                                  <Link to={`/product/${item.productSlug}`} className="font-bold hover:text-blaze">
                                    {item.productName}
                                  </Link>
                                ) : (
                                  <p className="font-bold">{item.productName}</p>
                                )}
                                <p className="text-sm text-mute">
                                  {item.colorName} · {item.size} · Qty {item.quantity}
                                </p>
                              </div>
                              <p className="font-bold">{formatPrice(item.unitPricePence * item.quantity)}</p>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-4 flex flex-wrap justify-between gap-2 border-t border-line pt-4 text-sm text-mute">
                          <span>{o.shipping && `To ${o.shipping.name}, ${o.shipping.postcode}`}</span>
                          <span>
                            Delivery {o.shippingPence ? formatPrice(o.shippingPence) : 'free'} · Total <span className="font-bold text-bone">{formatPrice(o.totalPence)}</span>
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
