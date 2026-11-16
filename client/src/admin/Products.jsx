import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Pencil, Plus, Search, Star, Trash2 } from 'lucide-react'
import { adminApi } from '../api/client.js'
import { useApi } from '../hooks/useApi.js'
import { useCatalog } from '../context/CatalogContext.jsx'
import { cldImage, cx, formatPrice } from '../lib/format.js'
import ImagePlaceholder from '../components/ImagePlaceholder.jsx'
import { Button, EmptyState, Input, PageHeader, Select, Spinner, StatusPill, StockPill, useConfirm, useToast } from './ui.jsx'

const PAGE_SIZE = 20

export default function Products() {
  const [params, setParams] = useSearchParams()
  const { allCategories } = useCatalog()
  const navigate = useNavigate()
  const toast = useToast()
  const confirm = useConfirm()
  const [reload, setReload] = useState(0)
  const [search, setSearch] = useState(params.get('search') || '')

  const query = {
    search: params.get('search') || undefined,
    category: params.get('category') || undefined,
    status: params.get('status') || 'all',
    sort: params.get('sort') || 'newest',
    page: Number(params.get('page')) || 1,
    limit: PAGE_SIZE,
  }
  const { data, loading, error } = useApi(() => adminApi.products(query), JSON.stringify(query) + reload)
  // Local copy so toggles update instantly.
  const [rows, setRows] = useState([])
  const [rowsFor, setRowsFor] = useState(null)
  if (data && rowsFor !== data) {
    setRowsFor(data)
    setRows(data.products)
  }

  function update(changes) {
    const next = new URLSearchParams(params)
    for (const [k, v] of Object.entries(changes)) (v ? next.set(k, v) : next.delete(k))
    if (!('page' in changes)) next.delete('page')
    setParams(next, { replace: true })
  }

  // Search as you type (after a short pause).
  useEffect(() => {
    const t = setTimeout(() => {
      if ((params.get('search') || '') !== search.trim()) update({ search: search.trim() })
    }, 350)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  async function quickUpdate(product, changes, message) {
    setRows((rs) => rs.map((r) => (r.id === product.id ? { ...r, ...changes } : r)))
    try {
      await adminApi.updateProduct(product.id, changes)
      toast(message)
    } catch (err) {
      setRows((rs) => rs.map((r) => (r.id === product.id ? product : r)))
      toast(err.message, 'error')
    }
  }

  async function remove(product) {
    const ok = await confirm({
      title: `Delete “${product.name}”?`,
      message: 'This removes the product, all its colours, sizes and photos. Past orders keep their details. To hide it from the store instead, switch it to Hidden.',
    })
    if (!ok) return
    try {
      await adminApi.deleteProduct(product.id)
      toast('Product deleted')
      setReload((n) => n + 1)
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  const pagination = data?.pagination

  return (
    <>
      <PageHeader
        title="Products"
        subtitle={pagination ? `${pagination.total} product${pagination.total === 1 ? '' : 's'}` : ' '}
        actions={
          <Link to="/admin/products/new">
            <Button variant="primary" icon={Plus}>
              Add product
            </Button>
          </Link>
        }
      />

      <div className="mb-5 grid gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mute" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…" className="pl-10" aria-label="Search products" />
        </div>
        <Select value={query.category ?? ''} onChange={(e) => update({ category: e.target.value })} aria-label="Category">
          <option value="">All categories</option>
          {allCategories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select value={query.status} onChange={(e) => update({ status: e.target.value === 'all' ? '' : e.target.value })} aria-label="Status">
          <option value="all">Live + hidden</option>
          <option value="active">Live only</option>
          <option value="inactive">Hidden only</option>
        </Select>
        <Select value={query.sort} onChange={(e) => update({ sort: e.target.value === 'newest' ? '' : e.target.value })} aria-label="Sort">
          <option value="newest">Newest</option>
          <option value="name">Name A–Z</option>
          <option value="price_asc">Price ↑</option>
          <option value="price_desc">Price ↓</option>
        </Select>
      </div>

      {error ? (
        <p className="text-red-400">{error.message}</p>
      ) : loading && !data ? (
        <Spinner />
      ) : rows.length === 0 ? (
        <EmptyState
          title={query.search || query.category || query.status !== 'all' ? 'No matching products' : 'No products yet'}
          text={query.search ? 'Try a different search.' : 'Add your first product to get started.'}
          action={
            <Button variant="primary" icon={Plus} onClick={() => navigate('/admin/products/new')}>
              Add product
            </Button>
          }
        />
      ) : (
        <div className={cx('overflow-hidden rounded-2xl border border-line transition-opacity', loading && 'opacity-60')}>
          <table className="w-full text-left text-sm">
            <thead className="hidden bg-coal text-xs uppercase tracking-widest text-mute md:table-header-group">
              <tr>
                <th className="px-4 py-3 font-bold">Product</th>
                <th className="px-4 py-3 font-bold">Price</th>
                <th className="px-4 py-3 font-bold">Stock</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((p) => (
                <tr key={p.id} className="group flex flex-wrap items-center gap-x-4 gap-y-2 p-4 transition-colors hover:bg-coal/60 md:table-row md:p-0">
                  <td className="w-full md:w-auto md:px-4 md:py-3">
                    <Link to={`/admin/products/${p.id}`} className="flex items-center gap-3">
                      <span className="h-14 w-11 shrink-0 overflow-hidden rounded-lg bg-steel">
                        {p.image ? <img src={cldImage(p.image.url, 100)} alt="" className="h-full w-full object-cover" /> : <ImagePlaceholder small />}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-bold group-hover:text-blaze">{p.name}</span>
                        <span className="block truncate text-xs text-mute">
                          {p.category?.name}
                          {p.brand && ` · ${p.brand.name}`}
                          {` · ${p.colors.length} colour${p.colors.length === 1 ? '' : 's'}`}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="md:px-4 md:py-3">
                    <span className="font-bold">{formatPrice(p.pricePence)}</span>
                    {p.compareAtPricePence > p.pricePence && <span className="ml-2 text-xs text-mute line-through">{formatPrice(p.compareAtPricePence)}</span>}
                  </td>
                  <td className="md:px-4 md:py-3">
                    <StockPill stock={p.totalStock} />
                  </td>
                  <td className="md:px-4 md:py-3">
                    <button
                      onClick={() => quickUpdate(p, { isActive: !p.isActive }, p.isActive ? 'Hidden from the store' : 'Now live in the store')}
                      title={p.isActive ? 'Click to hide' : 'Click to make live'}
                      className="transition-transform active:scale-95"
                    >
                      <StatusPill active={p.isActive} />
                    </button>
                  </td>
                  <td className="ml-auto md:px-4 md:py-3">
                    <div className="flex justify-end gap-1">
                      <IconBtn
                        label={p.isFeatured ? 'Remove from featured' : 'Feature on home page'}
                        onClick={() => quickUpdate(p, { isFeatured: !p.isFeatured }, p.isFeatured ? 'Removed from featured' : 'Featured')}
                      >
                        <Star size={16} className={p.isFeatured ? 'fill-blaze text-blaze' : ''} />
                      </IconBtn>
                      <IconBtn label="Edit" onClick={() => navigate(`/admin/products/${p.id}`)}>
                        <Pencil size={16} />
                      </IconBtn>
                      <IconBtn label="Delete" onClick={() => remove(p)} danger>
                        <Trash2 size={16} />
                      </IconBtn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination?.pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button size="sm" disabled={query.page <= 1} onClick={() => update({ page: query.page - 1 })}>
            Previous
          </Button>
          <span className="px-3 text-sm text-mute">
            Page {query.page} of {pagination.pages}
          </span>
          <Button size="sm" disabled={query.page >= pagination.pages} onClick={() => update({ page: query.page + 1 })}>
            Next
          </Button>
        </div>
      )}
    </>
  )
}

function IconBtn({ children, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cx('grid h-9 w-9 place-items-center rounded-lg text-mute transition-colors hover:bg-bone/10', danger ? 'hover:text-red-400' : 'hover:text-bone')}
    >
      {children}
    </button>
  )
}
