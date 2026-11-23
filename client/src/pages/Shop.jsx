import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react'
import { api } from '../api/client.js'
import { useSeo } from '../hooks/useSeo.js'
import { useApi } from '../hooks/useApi.js'
import { useCatalog } from '../context/CatalogContext.jsx'
import { PRICE_RANGES, SIZE_OPTIONS, SORT_OPTIONS } from '../config.js'
import { cx } from '../lib/format.js'
import { SplitLines } from '../components/motion.jsx'
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard.jsx'

const PAGE_SIZE = 12
const EASE = [0.16, 1, 0.3, 1]

export default function Shop() {
  const { category } = useParams()
  const [params, setParams] = useSearchParams()
  const { categories } = useCatalog()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const { data: brands } = useApi(api.brands, 'brands')

  const current = categories.find((c) => c.slug === category)
  const search = params.get('search') || ''
  const page = Number(params.get('page')) || 1

  const query = {
    category,
    search: search || undefined,
    brand: params.get('brand') || undefined,
    size: params.get('size') || undefined,
    minPrice: params.get('minPrice') || undefined,
    maxPrice: params.get('maxPrice') || undefined,
    inStock: params.get('inStock') || undefined,
    sort: params.get('sort') || 'newest',
    page,
    limit: PAGE_SIZE,
  }
  const key = JSON.stringify(query)
  const { data, loading, error } = useApi(() => api.products(query), key)
  const products = data?.products ?? []
  const pagination = data?.pagination

  // Update one or more URL params; any filter change resets to page 1.
  function update(changes) {
    const next = new URLSearchParams(params)
    for (const [k, v] of Object.entries(changes)) {
      if (v == null || v === '') next.delete(k)
      else next.set(k, v)
    }
    if (!('page' in changes)) next.delete('page')
    setParams(next, { preventScrollReset: true })
  }

  // Toggle a value in a comma-separated list param (brand=a,b).
  function toggleList(key, value) {
    const list = (params.get(key) || '').split(',').filter(Boolean)
    const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
    update({ [key]: next.join(',') })
  }

  const activeCount = ['brand', 'size', 'minPrice', 'maxPrice', 'inStock']
    .map((k) => params.get(k))
    .filter(Boolean)
    .reduce((n, v) => n + v.split(',').length, 0)

  const title = search ? `“${search}”` : current?.name || 'Shop all'

  useSeo({
    title: search ? `Search: ${search}` : current?.name || 'Shop all',
    description: current
      ? `Shop ${current.name.toLowerCase()} at Mako Sports. UK delivery, free on orders over £50.`
      : 'Shop hoodies, jerseys, shirts, trousers, hats and socks. UK delivery, free on orders over £50.',
    noindex: Boolean(search),
  })

  const filterPanel = (
    <Filters
      params={params}
      brands={brands ?? []}
      update={update}
      toggleList={toggleList}
      activeCount={activeCount}
      clear={() => setParams(search ? { search } : {}, { preventScrollReset: true })}
    />
  )

  return (
    <div className="pt-28 md:pt-36">
      {/* Title */}
      <section className="container-x">
        <nav className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-mute" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-bone">Home</Link>
          <span>/</span>
          <Link to="/shop" className={cx('hover:text-bone', !current && 'text-bone')}>Shop</Link>
          {current && (
            <>
              <span>/</span>
              <span className="text-bone">{current.name}</span>
            </>
          )}
        </nav>
        <h1 key={title} className="font-display text-[16vw] uppercase leading-[0.85] sm:text-8xl lg:text-[9rem]">
          <SplitLines lines={[title]} />
        </h1>
        {search && (
          <button onClick={() => update({ search: null })} className="mt-4 inline-flex items-center gap-2 text-sm text-mute hover:text-bone">
            <X size={14} /> Clear search
          </button>
        )}
      </section>

      {/* Category pills */}
      <section className="container-x mt-10">
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          <CategoryPill to={`/shop${search ? `?search=${encodeURIComponent(search)}` : ''}`} active={!category}>
            All
          </CategoryPill>
          {categories.map((c) => (
            <CategoryPill key={c.slug} to={`/shop/${c.slug}${search ? `?search=${encodeURIComponent(search)}` : ''}`} active={c.slug === category}>
              {c.name}
            </CategoryPill>
          ))}
        </div>
      </section>

      {/* Toolbar */}
      <section className="container-x sticky top-16 z-30 mt-8 border-y border-line bg-ink/85 backdrop-blur-xl md:top-20">
        <div className="flex h-14 items-center justify-between gap-4">
          <button onClick={() => setFiltersOpen(true)} className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest lg:hidden">
            <SlidersHorizontal size={16} /> Filters {activeCount > 0 && <span className="rounded-full bg-blaze px-2 text-xs text-ink">{activeCount}</span>}
          </button>
          <p className="hidden text-sm text-mute lg:block">
            {pagination ? `${pagination.total} product${pagination.total === 1 ? '' : 's'}` : ' '}
          </p>
          <label className="relative flex items-center gap-2 text-sm">
            <span className="hidden text-mute sm:inline">Sort by</span>
            <select
              value={query.sort}
              onChange={(e) => update({ sort: e.target.value === 'newest' ? null : e.target.value })}
              className="appearance-none rounded-full border border-line bg-coal py-2 pl-4 pr-10 font-bold outline-none transition hover:border-bone/40 focus:border-blaze"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-3" />
          </label>
        </div>
      </section>

      <section className="container-x mt-10 flex gap-12">
        {/* Desktop filters */}
        <aside className="sticky top-40 hidden h-fit w-60 shrink-0 lg:block">{filterPanel}</aside>

        {/* Grid */}
        <div className="min-w-0 flex-1">
          {error ? (
            <Empty title="Couldn't load products" text={error.message} />
          ) : !loading && products.length === 0 ? (
            <Empty
              title="Nothing here yet"
              text={activeCount || search ? 'Try removing some filters.' : 'New products are on the way. Check back soon.'}
              action={
                (activeCount > 0 || search) && (
                  <button className="btn btn-primary" onClick={() => setParams({}, { preventScrollReset: true })}>
                    <span>Clear filters</span>
                  </button>
                )
              }
            />
          ) : (
            <div className={cx('grid grid-cols-2 gap-x-4 gap-y-12 transition-opacity duration-300 md:gap-x-6 xl:grid-cols-3', loading && data && 'opacity-50')}>
              {loading && !data
                ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
                : products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          )}

          {pagination?.pages > 1 && (
            <Pagination page={page} pages={pagination.pages} onChange={(p) => {
              update({ page: p > 1 ? p : null })
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }} />
          )}
        </div>
      </section>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {filtersOpen && (
          <div className="fixed inset-0 z-[70] lg:hidden">
            <motion.div className="absolute inset-0 bg-ink/70 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFiltersOpen(false)} />
            <motion.div
              className="absolute inset-y-0 left-0 flex w-[88%] max-w-sm flex-col bg-coal"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.55, ease: EASE }}
            >
              <div className="flex items-center justify-between border-b border-line px-6 py-5">
                <h2 className="font-display text-2xl uppercase">Filters</h2>
                <button onClick={() => setFiltersOpen(false)} className="rounded-full p-2 hover:bg-bone/10" aria-label="Close filters">
                  <X size={22} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-6">{filterPanel}</div>
              <div className="border-t border-line p-4">
                <button className="btn btn-primary w-full" onClick={() => setFiltersOpen(false)}>
                  <span>Show {pagination?.total ?? ''} results</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function CategoryPill({ to, active, children }) {
  return (
    <Link
      to={to}
      className={cx(
        'relative shrink-0 overflow-hidden rounded-full border px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors duration-300',
        active ? 'border-blaze text-ink' : 'border-line text-bone/80 hover:border-bone/50 hover:text-bone',
      )}
    >
      {active && <motion.span layoutId="cat-pill" className="absolute inset-0 bg-blaze" transition={{ type: 'spring', stiffness: 400, damping: 35 }} />}
      <span className="relative">{children}</span>
    </Link>
  )
}

function Filters({ params, brands, update, toggleList, activeCount, clear }) {
  const selectedBrands = (params.get('brand') || '').split(',')
  const selectedSizes = (params.get('size') || '').split(',')
  const minPrice = params.get('minPrice')
  const maxPrice = params.get('maxPrice')

  return (
    <div className="space-y-8">
      {activeCount > 0 && (
        <button onClick={clear} className="link-sweep text-xs font-bold uppercase tracking-widest text-blaze">
          Clear all ({activeCount})
        </button>
      )}

      <FilterGroup title="Availability">
        <Check checked={params.get('inStock') === 'true'} onChange={() => update({ inStock: params.get('inStock') ? null : 'true' })}>
          In stock only
        </Check>
      </FilterGroup>

      <FilterGroup title="Size">
        <div className="flex flex-wrap gap-2">
          {SIZE_OPTIONS.map((s) => {
            const on = selectedSizes.includes(s)
            return (
              <button
                key={s}
                onClick={() => toggleList('size', s)}
                aria-pressed={on}
                className={cx(
                  'min-w-11 rounded-lg border px-3 py-2 text-xs font-bold transition-all duration-300 active:scale-95',
                  on ? 'border-blaze bg-blaze text-ink' : 'border-line hover:border-bone/50',
                )}
              >
                {s}
              </button>
            )
          })}
        </div>
      </FilterGroup>

      <FilterGroup title="Price">
        {PRICE_RANGES.map((r) => {
          const on = String(r.min ?? '') === (minPrice ?? '') && String(r.max ?? '') === (maxPrice ?? '')
          return (
            <Check key={r.label} type="radio" checked={on} onChange={() => update(on ? { minPrice: null, maxPrice: null } : { minPrice: r.min, maxPrice: r.max })}>
              {r.label}
            </Check>
          )
        })}
      </FilterGroup>

      {brands.length > 0 && (
        <FilterGroup title="Brand">
          {brands.map((b) => (
            <Check key={b.slug} checked={selectedBrands.includes(b.slug)} onChange={() => toggleList('brand', b.slug)}>
              {b.name} <span className="text-mute">({b.productCount})</span>
            </Check>
          ))}
        </FilterGroup>
      )}
    </div>
  )
}

function FilterGroup({ title, children }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="border-b border-line pb-6">
      <button onClick={() => setOpen((o) => !o)} className="mb-4 flex w-full items-center justify-between text-xs font-bold uppercase tracking-[0.25em]" aria-expanded={open}>
        {title}
        <ChevronDown size={16} className={cx('transition-transform duration-300', open && 'rotate-180')} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: EASE }} className="overflow-hidden">
            <div className="space-y-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Check({ checked, onChange, children, type = 'checkbox' }) {
  return (
    <label className="group flex cursor-pointer items-center gap-3 text-sm">
      <input type={type} checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        className={cx(
          'grid h-5 w-5 shrink-0 place-items-center border transition-all duration-300 peer-focus-visible:ring-2 peer-focus-visible:ring-blaze',
          type === 'radio' ? 'rounded-full' : 'rounded-md',
          checked ? 'border-blaze bg-blaze' : 'border-line group-hover:border-bone/50',
        )}
      >
        <motion.span initial={false} animate={{ scale: checked ? 1 : 0 }} className={cx('h-2 w-2 bg-ink', type === 'radio' ? 'rounded-full' : 'rounded-sm')} />
      </span>
      <span className="text-bone/85 transition-colors group-hover:text-bone">{children}</span>
    </label>
  )
}

function Pagination({ page, pages, onChange }) {
  return (
    <nav className="mt-16 flex items-center justify-center gap-2" aria-label="Pagination">
      {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          aria-current={p === page ? 'page' : undefined}
          className={cx(
            'h-11 w-11 rounded-full border text-sm font-bold transition-all duration-300 hover:-translate-y-0.5',
            p === page ? 'border-blaze bg-blaze text-ink' : 'border-line hover:border-bone/50',
          )}
        >
          {p}
        </button>
      ))}
    </nav>
  )
}

function Empty({ title, text, action }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center rounded-3xl border border-dashed border-line px-6 py-24 text-center">
      <p className="font-display text-4xl uppercase md:text-5xl">{title}</p>
      <p className="mt-3 max-w-sm text-mute">{text}</p>
      {action && <div className="mt-8">{action}</div>}
    </motion.div>
  )
}
