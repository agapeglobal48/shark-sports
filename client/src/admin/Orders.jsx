import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Check, Copy, ExternalLink, PackageCheck, Search, Truck, Undo2, XCircle } from 'lucide-react'
import { adminApi } from '../api/client.js'
import { useApi } from '../hooks/useApi.js'
import { cldImage, cx, formatPrice } from '../lib/format.js'
import { ORDER_STATUS, dateTimeFmt } from '../lib/orderStatus.js'
import ImagePlaceholder from '../components/ImagePlaceholder.jsx'
import { Button, Card, EmptyState, Input, PageHeader, Spinner, useToast } from './ui.jsx'

const TABS = [
  { value: 'open', label: 'To pack' },
  { value: '', label: 'All paid' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'REFUNDED', label: 'Refunded' },
  { value: 'PENDING', label: 'Unpaid checkouts' },
]

export function StatusBadge({ status }) {
  const s = ORDER_STATUS[status] ?? ORDER_STATUS.PAID
  return <span className={cx('inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider', s.cls)}>{s.admin}</span>
}

// ─── List ────────────────────────────────────────────────

export default function Orders() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const status = params.get('status') ?? 'open'
  const page = Number(params.get('page')) || 1
  const [search, setSearch] = useState(params.get('search') || '')

  const query = { status: status || undefined, search: params.get('search') || undefined, page }
  const { data, loading, error } = useApi(() => adminApi.orders(query), JSON.stringify(query))

  function update(changes) {
    const next = new URLSearchParams(params)
    for (const [k, v] of Object.entries(changes)) (v != null ? next.set(k, v) : next.delete(k))
    if (!('page' in changes)) next.delete('page')
    setParams(next, { replace: true })
  }

  useEffect(() => {
    const t = setTimeout(() => {
      if ((params.get('search') || '') !== search.trim()) update({ search: search.trim() || null })
    }, 350)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const orders = data?.orders ?? []

  return (
    <>
      <PageHeader title="Orders" subtitle={data ? `${data.pagination.total} order${data.pagination.total === 1 ? '' : 's'}` : ' '} />

      <div className="no-scrollbar -mx-4 mb-4 flex gap-1.5 overflow-x-auto px-4">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => update({ status: t.value })}
            className={cx(
              'shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-colors',
              status === t.value ? 'bg-blaze text-ink' : 'border border-line text-bone/80 hover:border-bone/40',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="relative mb-5">
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mute" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by order number, email, name or postcode…" className="pl-10" aria-label="Search orders" />
      </div>

      {error ? (
        <p className="text-red-400">{error.message}</p>
      ) : loading && !data ? (
        <Spinner />
      ) : orders.length === 0 ? (
        <EmptyState
          title={status === 'open' ? 'Nothing to pack' : 'No orders here'}
          text={status === 'open' ? 'New paid orders will appear here.' : 'Try another tab or search.'}
        />
      ) : (
        <div className={cx('overflow-hidden rounded-2xl border border-line transition-opacity', loading && 'opacity-60')}>
          <table className="w-full text-left text-sm">
            <thead className="hidden bg-coal text-xs uppercase tracking-widest text-mute md:table-header-group">
              <tr>
                <th className="px-4 py-3 font-bold">Order</th>
                <th className="px-4 py-3 font-bold">Customer</th>
                <th className="px-4 py-3 font-bold">Items</th>
                <th className="px-4 py-3 font-bold">Total</th>
                <th className="px-4 py-3 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => navigate(`/admin/orders/${o.id}`)}
                  className="flex cursor-pointer flex-wrap items-center gap-x-4 gap-y-1 p-4 transition-colors hover:bg-coal/60 md:table-row md:p-0"
                >
                  <td className="w-full md:w-auto md:px-4 md:py-3">
                    <Link to={`/admin/orders/${o.id}`} className="font-bold hover:text-blaze" onClick={(e) => e.stopPropagation()}>
                      {o.orderNumber}
                    </Link>
                    <p className="text-xs text-mute">{dateTimeFmt.format(new Date(o.paidAt ?? o.createdAt))}</p>
                  </td>
                  <td className="md:px-4 md:py-3">
                    <p className="font-bold">{o.shipFullName ?? '—'}</p>
                    <p className="text-xs text-mute">
                      {o.email ?? 'no email yet'}
                      {!o.userId && o.email && ' · guest'}
                    </p>
                  </td>
                  <td className="text-mute md:px-4 md:py-3">{o.units} item{o.units === 1 ? '' : 's'}</td>
                  <td className="font-bold md:px-4 md:py-3">{formatPrice(o.totalPence)}</td>
                  <td className="ml-auto md:px-4 md:py-3">
                    <StatusBadge status={o.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data?.pagination.pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button size="sm" disabled={page <= 1} onClick={() => update({ page: page - 1 })}>
            Previous
          </Button>
          <span className="px-3 text-sm text-mute">
            Page {page} of {data.pagination.pages}
          </span>
          <Button size="sm" disabled={page >= data.pagination.pages} onClick={() => update({ page: page + 1 })}>
            Next
          </Button>
        </div>
      )}
    </>
  )
}

// ─── One order ───────────────────────────────────────────

const NEXT_STEP = {
  PAID: { status: 'PROCESSING', label: 'Start packing', icon: PackageCheck },
  PROCESSING: { status: 'SHIPPED', label: 'Mark as shipped', icon: Truck },
  SHIPPED: { status: 'DELIVERED', label: 'Mark as delivered', icon: Check },
}

export function OrderDetail() {
  const { id } = useParams()
  const toast = useToast()
  const [reload, setReload] = useState(0)
  const { data: order, loading, error } = useApi(() => adminApi.order(id), id + reload)
  const [busy, setBusy] = useState(false)
  const [closing, setClosing] = useState(null) // 'CANCELLED' | 'REFUNDED' while the panel is open
  const [restock, setRestock] = useState(true)

  async function setStatus(status, opts = {}) {
    setBusy(true)
    try {
      const res = await adminApi.updateOrder(id, { status, ...opts })
      toast(`Order marked ${ORDER_STATUS[status].admin.toLowerCase()}${res.restocked ? ' and items put back in stock' : ''}`)
      setClosing(null)
      setReload((n) => n + 1)
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  function copy(text, what) {
    navigator.clipboard?.writeText(text).then(() => toast(`${what} copied`), () => toast('Could not copy', 'error'))
  }

  if (error) return <p className="text-red-400">{error.status === 404 ? 'Order not found.' : error.message}</p>
  if (loading && !order) return <Spinner />

  const next = NEXT_STEP[order.status]
  const paid = Boolean(order.paidAt)
  const canClose = paid && !['CANCELLED', 'REFUNDED'].includes(order.status)
  const address = [order.shipFullName, order.shipLine1, order.shipLine2, order.shipCity, order.shipCounty, order.shipPostcode, order.shipCountry === 'GB' ? 'United Kingdom' : order.shipCountry]
    .filter(Boolean)
    .join('\n')

  return (
    <>
      <Link to="/admin/orders" className="mb-4 inline-flex items-center gap-1.5 text-sm text-mute hover:text-bone">
        <ArrowLeft size={16} /> Orders
      </Link>
      <PageHeader
        title={order.orderNumber}
        subtitle={`${paid ? 'Paid' : 'Started'} ${dateTimeFmt.format(new Date(order.paidAt ?? order.createdAt))}`}
        actions={<StatusBadge status={order.status} />}
      />

      {/* Next step */}
      {paid && (next || canClose) && (
        <Card className="mb-6">
          <div className="flex flex-wrap items-center gap-3">
            {next && (
              <Button variant="primary" icon={next.icon} loading={busy && !closing} onClick={() => setStatus(next.status)}>
                {next.label}
              </Button>
            )}
            {canClose && !closing && (
              <>
                <Button variant="ghost" icon={XCircle} onClick={() => setClosing('CANCELLED')}>
                  Cancel order
                </Button>
                <Button variant="ghost" icon={Undo2} onClick={() => setClosing('REFUNDED')}>
                  Mark refunded
                </Button>
              </>
            )}
          </div>

          {closing && (
            <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/5 p-4">
              <p className="font-bold">{closing === 'CANCELLED' ? 'Cancel this order?' : 'Mark this order as refunded?'}</p>
              <p className="mt-1 text-sm text-mute">
                This only updates the order here. To give the customer their money back, refund the payment in your{' '}
                {order.paymentRef ? (
                  <a href={`https://dashboard.stripe.com/payments/${order.paymentRef}`} target="_blank" rel="noreferrer" className="font-bold text-bone underline">
                    Stripe dashboard
                  </a>
                ) : (
                  'Stripe dashboard'
                )}
                .
              </p>
              <label className="mt-3 flex items-center gap-2 text-sm">
                <input type="checkbox" checked={restock} onChange={(e) => setRestock(e.target.checked)} className="h-4 w-4 accent-[var(--color-blaze)]" />
                Put the items back in stock
              </label>
              <div className="mt-4 flex gap-2">
                <Button variant="danger" loading={busy} onClick={() => setStatus(closing, { restock })}>
                  {closing === 'CANCELLED' ? 'Cancel order' : 'Mark refunded'}
                </Button>
                <Button variant="ghost" onClick={() => setClosing(null)}>
                  Keep order
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {!paid && (
        <Card className="mb-6">
          <p className="text-sm text-mute">
            This checkout was started but never paid{order.status === 'CANCELLED' ? ' and has expired' : ''}. Nothing needs doing; no stock was taken.
          </p>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Items" className="lg:col-span-2">
          <ul className="divide-y divide-line">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-4 py-3 first:pt-0">
                <div className="h-16 w-13 shrink-0 overflow-hidden rounded-lg bg-steel">
                  {item.imageUrl ? <img src={cldImage(item.imageUrl, 120)} alt="" className="h-full w-full object-cover" /> : <ImagePlaceholder small />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{item.productName}</p>
                  <p className="text-sm text-mute">
                    {item.colorName} · <span className="font-bold text-bone">{item.size}</span> · <span className="font-mono text-xs">{item.sku}</span>
                  </p>
                </div>
                <p className="text-sm">
                  <span className="font-bold">× {item.quantity}</span>
                  <span className="ml-3 text-mute">{formatPrice(item.unitPricePence * item.quantity)}</span>
                </p>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-mute">Subtotal</dt>
              <dd>{formatPrice(order.subtotalPence)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-mute">Delivery</dt>
              <dd>{order.shippingPence ? formatPrice(order.shippingPence) : 'Free'}</dd>
            </div>
            <div className="flex justify-between text-base font-bold">
              <dt>Total</dt>
              <dd>{formatPrice(order.totalPence)}</dd>
            </div>
          </dl>
        </Card>

        <div className="space-y-6">
          <Card
            title="Deliver to"
            actions={address && <Button size="sm" variant="ghost" icon={Copy} onClick={() => copy(address, 'Address')}>Copy</Button>}
          >
            {order.shipLine1 ? <p className="whitespace-pre-line text-sm leading-relaxed">{address}</p> : <p className="text-sm text-mute">No address (not paid).</p>}
            {order.shipPhone && <p className="mt-3 text-sm text-mute">{order.shipPhone}</p>}
          </Card>

          <Card title="Customer">
            <p className="text-sm font-bold">{order.user?.name ?? order.shipFullName ?? '—'}</p>
            {order.email && (
              <button onClick={() => copy(order.email, 'Email')} className="text-sm text-mute hover:text-bone">
                {order.email}
              </button>
            )}
            <p className="mt-2 text-xs text-mute">{order.user ? 'Has an account' : 'Guest checkout'}</p>
          </Card>

          {order.paymentRef && (
            <Card title="Payment">
              <a href={`https://dashboard.stripe.com/payments/${order.paymentRef}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-bold hover:text-blaze">
                View in Stripe <ExternalLink size={14} />
              </a>
              <p className="mt-1 break-all font-mono text-xs text-mute">{order.paymentRef}</p>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}
