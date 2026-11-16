import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowRight, EyeOff, Package, PackageCheck, PackageX, Plus, PoundSterling } from 'lucide-react'
import { adminApi } from '../api/client.js'
import { useApi } from '../hooks/useApi.js'
import { useAuth } from '../context/AuthContext.jsx'
import { formatPrice } from '../lib/format.js'
import { dateTimeFmt } from '../lib/orderStatus.js'
import { StatusBadge } from './Orders.jsx'
import { missingDetails } from '../content/business.js'
import { Button, Card, PageHeader, Spinner, StockPill } from './ui.jsx'

export default function Dashboard() {
  const { user } = useAuth()
  const { data, loading, error } = useApi(adminApi.stats, 'stats')

  return (
    <>
      <PageHeader
        title={`Hi, ${user.name.split(' ')[0]}`}
        subtitle="Here's how the store looks right now."
        actions={
          <Link to="/admin/products/new">
            <Button variant="primary" icon={Plus}>
              Add product
            </Button>
          </Link>
        }
      />

      <MissingDetails />

      {loading && !data ? (
        <Spinner />
      ) : error ? (
        <p className="text-red-400">{error.message}</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat icon={PackageCheck} label="Orders to pack" value={data.orders.toFulfil} to="/admin/orders" tone={data.orders.toFulfil ? 'accent' : undefined} />
            <Stat
              icon={PoundSterling}
              label={`Sales, last 30 days (${data.orders.last30Days.count})`}
              value={formatPrice(data.orders.last30Days.revenuePence)}
              to="/admin/orders?status="
            />
            <Stat icon={Package} label="Live products" value={data.counts.activeProducts} to="/admin/products?status=active" />
            <Stat icon={PackageX} label="Sold out" value={data.outOfStock.length} tone={data.outOfStock.length ? 'red' : undefined} />
          </div>
          {data.counts.hiddenProducts > 0 && (
            <Link to="/admin/products?status=inactive" className="mt-3 inline-flex items-center gap-2 text-sm text-mute hover:text-bone">
              <EyeOff size={14} /> {data.counts.hiddenProducts} hidden product{data.counts.hiddenProducts === 1 ? '' : 's'}
            </Link>
          )}

          <Card
            title="Latest orders"
            className="mt-6"
            actions={
              <Link to="/admin/orders?status=" className="text-sm text-mute hover:text-bone">
                View all →
              </Link>
            }
          >
            {data.orders.recent.length === 0 ? (
              <p className="text-sm text-mute">No orders yet. They'll appear here as soon as someone buys.</p>
            ) : (
              <ul className="divide-y divide-line">
                {data.orders.recent.map((o) => (
                  <li key={o.id}>
                    <Link to={`/admin/orders/${o.id}`} className="group flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
                      <span className="font-bold group-hover:text-blaze">{o.orderNumber}</span>
                      <span className="text-sm text-mute">{o.shipFullName ?? o.email}</span>
                      <span className="text-xs text-mute">{dateTimeFmt.format(new Date(o.createdAt))}</span>
                      <span className="ml-auto font-bold">{formatPrice(o.totalPence)}</span>
                      <StatusBadge status={o.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card title="Running low" description={`Sizes with ${data.lowStockThreshold} or fewer left.`}>
              {data.lowStock.length === 0 ? (
                <p className="text-sm text-mute">Nothing running low.</p>
              ) : (
                <ul className="divide-y divide-line">
                  {data.lowStock.map((v) => (
                    <li key={v.variantId}>
                      <Link to={`/admin/products/${v.productId}`} className="group flex items-center justify-between gap-3 py-3">
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-bold group-hover:text-blaze">{v.productName}</span>
                          <span className="text-xs text-mute">
                            {v.colorName} · {v.size}
                          </span>
                        </span>
                        <StockPill stock={v.stock} threshold={data.lowStockThreshold} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card title="Sold out" description="Products with no stock left in any size.">
              {data.outOfStock.length === 0 ? (
                <p className="text-sm text-mute">Everything has stock.</p>
              ) : (
                <ul className="divide-y divide-line">
                  {data.outOfStock.map((p) => (
                    <li key={p.id}>
                      <Link to={`/admin/products/${p.id}`} className="group flex items-center justify-between gap-3 py-3">
                        <span className="flex items-center gap-2 truncate text-sm font-bold group-hover:text-blaze">
                          <AlertTriangle size={14} className="shrink-0 text-red-400" />
                          {p.name}
                        </span>
                        <ArrowRight size={16} className="shrink-0 text-mute transition-transform group-hover:translate-x-1" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      )}
    </>
  )
}

function Stat({ icon: Icon, label, value, to, tone }) {
  const body = (
    <div className="group h-full rounded-2xl border border-line bg-coal p-5 transition-colors hover:border-bone/30">
      <Icon size={20} className={tone === 'red' ? 'text-red-400' : 'text-blaze'} />
      {tone === 'accent' && <span className="float-right h-2.5 w-2.5 animate-pulse rounded-full bg-blaze" aria-hidden />}
      <p className="mt-4 font-display text-4xl">{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-widest text-mute">{label}</p>
    </div>
  )
  return to ? <Link to={to}>{body}</Link> : body
}

// Reminder until the business details used by the legal pages are filled in.
function MissingDetails() {
  const missing = missingDetails()
  if (!missing.length) return null
  return (
    <div className="mb-6 flex gap-3 rounded-2xl border border-blaze/40 bg-blaze/10 p-4 text-sm">
      <AlertTriangle size={18} className="mt-0.5 shrink-0 text-blaze" />
      <div>
        <p className="font-bold">Your legal pages have {missing.length} detail{missing.length === 1 ? '' : 's'} to fill in before launch</p>
        <p className="mt-1 text-bone/70">{missing.join(' · ')}</p>
        <p className="mt-1 text-mute">
          Edit <code className="text-bone">client/src/content/business.js</code>. Until then they show as highlighted placeholders on the{' '}
          <Link to="/terms" target="_blank" className="underline hover:text-bone">
            terms
          </Link>
          ,{' '}
          <Link to="/privacy" target="_blank" className="underline hover:text-bone">
            privacy
          </Link>{' '}
          and{' '}
          <Link to="/returns" target="_blank" className="underline hover:text-bone">
            returns
          </Link>{' '}
          pages.
        </p>
      </div>
    </div>
  )
}
