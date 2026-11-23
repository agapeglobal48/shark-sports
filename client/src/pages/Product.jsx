import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Check, Minus, Plus, ShoppingBag } from 'lucide-react'
import { api } from '../api/client.js'
import { useApi } from '../hooks/useApi.js'
import { useSeo } from '../hooks/useSeo.js'
import { useCart } from '../context/CartContext.jsx'
import { cldImage, cldVideo, cx, formatPrice } from '../lib/format.js'
import { Magnetic, Reveal } from '../components/motion.jsx'
import ImagePlaceholder from '../components/ImagePlaceholder.jsx'
import ProductCard from '../components/ProductCard.jsx'

const EASE = [0.16, 1, 0.3, 1]

export default function Product() {
  const { slug } = useParams()
  const { data: product, loading, error } = useApi(() => api.product(slug), slug)

  if (loading && !product) return <ProductSkeleton />
  if (error) {
    return (
      <div className="container-x flex min-h-[70vh] flex-col items-center justify-center pt-28 text-center">
        <p className="font-display text-6xl uppercase">{error.status === 404 ? 'Product not found' : 'Something went wrong'}</p>
        <p className="mt-3 text-mute">{error.status === 404 ? 'It may have sold out or been removed.' : error.message}</p>
        <Link to="/shop" className="btn btn-primary mt-8">
          <span>Back to shop</span>
        </Link>
      </div>
    )
  }
  return <ProductView key={product.id} product={product} />
}

function ProductView({ product }) {
  const [params, setParams] = useSearchParams()
  const { add } = useCart()

  // Start on the colour from the URL, else the first colour with stock.
  const initialColor =
    product.colors.find((c) => c.name.toLowerCase() === params.get('color')?.toLowerCase()) ??
    product.colors.find((c) => c.variants.some((v) => v.stock > 0)) ??
    product.colors[0]

  const [colorId, setColorId] = useState(initialColor?.id)
  const color = product.colors.find((c) => c.id === colorId)
  const [variantId, setVariantId] = useState(null)
  const variant = color?.variants.find((v) => v.id === variantId)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [sizeError, setSizeError] = useState(false)


  // Colour photos first, then general product media (e.g. video).
  const media = useMemo(() => [...(color?.media ?? []), ...product.media], [color, product.media])
  const [activeMedia, setActiveMedia] = useState(0)

  function chooseColor(c) {
    setColorId(c.id)
    setActiveMedia(0)
    // Keep the same size if the new colour has it.
    const same = c.variants.find((v) => v.size === variant?.size)
    setVariantId(same?.id ?? null)
    setQty(1)
    const next = new URLSearchParams(params)
    next.set('color', c.name)
    setParams(next, { replace: true, preventScrollReset: true })
  }

  const firstImage = [...(color?.media ?? []), ...product.media].find((m) => m.type !== 'VIDEO')?.url
  useSeo({
    title: product.name,
    description: product.description?.slice(0, 155) || `${product.name}${product.brand ? ` by ${product.brand.name}` : ''}. ${formatPrice(product.pricePence)} at Mako Sports, UK delivery.`,
    image: firstImage ? cldImage(firstImage, 1200) : undefined,
    type: 'product',
  })

  const price = variant?.effectivePricePence ?? product.pricePence
  const onSale = product.compareAtPricePence > price
  const inStock = color?.variants.some((v) => v.stock > 0)

  function addToBag() {
    if (!variant) {
      setSizeError(true)
      return
    }
    add(
      {
        variantId: variant.id,
        slug: product.slug,
        name: product.name,
        colorName: color.name,
        size: variant.size,
        pricePence: variant.effectivePricePence,
        image: color.media.find((m) => m.type === 'IMAGE')?.url ?? null,
        stock: variant.stock,
      },
      qty,
    )
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <>
      <ProductJsonLd product={product} />
      <div className="container-x pt-24 md:pt-32">
        <nav className="mb-8 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-widest text-mute" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-bone">Home</Link>
          <span>/</span>
          <Link to={`/shop/${product.category.slug}`} className="hover:text-bone">{product.category.name}</Link>
          <span>/</span>
          <span className="truncate text-bone">{product.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          {/* Gallery */}
          <div className="lg:col-span-7">
            <Gallery media={media} active={activeMedia} setActive={setActiveMedia} name={product.name} colorKey={colorId} category={product.category.name} />
          </div>

          {/* Details */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }}>
                {product.brand && <p className="eyebrow mb-3">{product.brand.name}</p>}
                <h1 className="font-display text-5xl uppercase leading-[0.95] md:text-6xl">{product.name}</h1>

                <div className="mt-5 flex items-baseline gap-3">
                  <motion.span key={price} initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={cx('font-display text-4xl', onSale && 'text-blaze')}>
                    {formatPrice(price)}
                  </motion.span>
                  {onSale && (
                    <>
                      <span className="text-lg text-mute line-through">{formatPrice(product.compareAtPricePence)}</span>
                      <span className="rounded-full bg-blaze px-2.5 py-1 text-xs font-extrabold text-ink">
                        Save {formatPrice(product.compareAtPricePence - price)}
                      </span>
                    </>
                  )}
                </div>
              </motion.div>

              {/* Colour */}
              {product.colors.length > 0 && (
                <motion.div className="mt-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.7, ease: EASE }}>
                  <p className="mb-3 text-sm">
                    <span className="font-bold uppercase tracking-widest text-mute">Colour:</span> <span className="font-bold">{color?.name}</span>
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((c) => {
                      const thumb = c.media.find((m) => m.type === 'IMAGE')?.url
                      const active = c.id === colorId
                      const soldOut = !c.variants.some((v) => v.stock > 0)
                      return (
                        <button
                          key={c.id}
                          onClick={() => chooseColor(c)}
                          aria-label={`${c.name}${soldOut ? ' (sold out)' : ''}`}
                          aria-pressed={active}
                          title={c.name}
                          className={cx(
                            'relative h-16 w-14 overflow-hidden rounded-xl border-2 transition-all duration-300 hover:-translate-y-1',
                            active ? 'border-blaze' : 'border-line hover:border-bone/50',
                            soldOut && 'opacity-40',
                          )}
                        >
                          {thumb ? (
                            <img src={cldImage(thumb, 120)} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <span className="block h-full w-full" style={{ background: c.hexCode || '#444' }} />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              {/* Size */}
              {color && (
                <motion.div className="mt-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7, ease: EASE }}>
                  <div className="mb-3 flex items-center justify-between">
                    <p className={cx('text-sm font-bold uppercase tracking-widest', sizeError ? 'text-blaze' : 'text-mute')}>
                      {sizeError ? 'Please choose a size' : 'Size'}
                    </p>
                    {variant && variant.stock <= 5 && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm font-bold text-blaze">
                        Only {variant.stock} left
                      </motion.p>
                    )}
                  </div>
                  <motion.div
                    key={sizeError ? 'shake' : 'still'}
                    animate={sizeError ? { x: [0, -8, 8, -5, 5, 0] } : {}}
                    transition={{ duration: 0.4 }}
                    className="grid grid-cols-4 gap-2 sm:grid-cols-5"
                  >
                    {color.variants.map((v) => {
                      const active = v.id === variantId
                      const out = v.stock <= 0
                      return (
                        <button
                          key={v.id}
                          disabled={out}
                          onClick={() => {
                            setVariantId(v.id)
                            setQty(1)
                            setSizeError(false)
                          }}
                          aria-pressed={active}
                          className={cx(
                            'relative overflow-hidden rounded-xl border py-3.5 text-sm font-bold transition-all duration-300',
                            active ? 'border-blaze bg-blaze text-ink' : 'border-line hover:-translate-y-0.5 hover:border-bone/60',
                            out && 'text-mute/50 line-through hover:translate-y-0 hover:border-line',
                          )}
                        >
                          {v.size}
                        </button>
                      )
                    })}
                  </motion.div>
                </motion.div>
              )}

              {/* Quantity + add */}
              <motion.div className="mt-8 flex gap-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7, ease: EASE }}>
                <div className="flex items-center rounded-full border border-line">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-14 w-12 place-items-center rounded-l-full transition hover:bg-bone/10" aria-label="Decrease quantity">
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center font-bold tabular-nums">{qty}</span>
                  <button
                    onClick={() => setQty((q) => Math.min(variant?.stock ?? 10, q + 1))}
                    className="grid h-14 w-12 place-items-center rounded-r-full transition hover:bg-bone/10"
                    aria-label="Increase quantity"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <Magnetic strength={0.15} className="flex-1">
                  <button onClick={addToBag} disabled={!inStock} className="btn btn-primary h-14 w-full">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={added ? 'added' : 'add'}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="flex items-center gap-2"
                      >
                        {!inStock ? 'Sold out' : added ? (<><Check size={18} /> Added</>) : (<><ShoppingBag size={18} /> Add to bag</>)}
                      </motion.span>
                    </AnimatePresence>
                  </button>
                </Magnetic>
              </motion.div>

              {product.description && (
                <motion.div className="mt-10 border-t border-line pt-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                  <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-mute">Details</h2>
                  <p className="whitespace-pre-line leading-relaxed text-bone/85">{product.description}</p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Related product={product} />
    </>
  )
}

// Structured data so Google can show price and stock in search results.
function ProductJsonLd({ product }) {
  const images = [...product.colors.flatMap((c) => c.media), ...product.media].filter((m) => m.type !== 'VIDEO').map((m) => cldImage(m.url, 1200))
  const inStock = product.colors.some((c) => c.variants.some((v) => v.stock > 0))
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || undefined,
    image: images.slice(0, 6),
    sku: product.slug,
    brand: product.brand ? { '@type': 'Brand', name: product.brand.name } : undefined,
    category: product.category?.name,
    offers: {
      '@type': 'Offer',
      url: `${window.location.origin}/product/${product.slug}`,
      price: (product.pricePence / 100).toFixed(2),
      priceCurrency: 'GBP',
      availability: `https://schema.org/${inStock ? 'InStock' : 'OutOfStock'}`,
      itemCondition: 'https://schema.org/NewCondition',
    },
  }
  return <script type="application/ld+json">{JSON.stringify(data)}</script>
}

function Gallery({ media, active, setActive, name, colorKey, category }) {
  const current = media[active]

  if (!media.length) {
    return (
      <div className="aspect-[4/5] overflow-hidden rounded-3xl">
        <ImagePlaceholder label={category} />
      </div>
    )
  }

  return (
    <div className="flex flex-col-reverse gap-3 md:flex-row">
      {media.length > 1 && (
        <div className="no-scrollbar flex gap-3 overflow-x-auto md:max-h-[80vh] md:w-20 md:flex-col md:overflow-y-auto">
          {media.map((m, i) => (
            <button
              key={m.id}
              onClick={() => setActive(i)}
              aria-label={`Show ${m.type === 'VIDEO' ? 'video' : `image ${i + 1}`}`}
              className={cx(
                'relative aspect-[4/5] w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-300 md:w-full',
                i === active ? 'border-blaze' : 'border-transparent opacity-60 hover:opacity-100',
              )}
            >
              {m.type === 'VIDEO' ? (
                <span className="grid h-full w-full place-items-center bg-steel text-[10px] font-bold uppercase tracking-widest">Video</span>
              ) : (
                <img src={cldImage(m.url, 160)} alt="" className="h-full w-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}

      <div className="group relative aspect-[4/5] flex-1 overflow-hidden rounded-3xl bg-steel">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={`${colorKey}-${current?.id}`}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            {current?.type === 'VIDEO' ? (
              <video src={cldVideo(current.url)} className="h-full w-full object-cover" autoPlay muted loop playsInline controls />
            ) : (
              <ZoomImage src={current?.url} alt={current?.altText || name} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// Zooms in and follows the cursor on hover.
function ZoomImage({ src, alt }) {
  const [origin, setOrigin] = useState('50% 50%')
  return (
    <div
      className="h-full w-full cursor-zoom-in overflow-hidden"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`)
      }}
    >
      <img
        src={cldImage(src, 1400)}
        alt={alt}
        style={{ transformOrigin: origin }}
        className="h-full w-full object-cover transition-transform duration-500 ease-out hover:scale-[1.8]"
      />
    </div>
  )
}

function Related({ product }) {
  const { data } = useApi(() => api.products({ category: product.category.slug, limit: 5 }), `related-${product.id}`)
  const items = (data?.products ?? []).filter((p) => p.id !== product.id).slice(0, 4)
  if (!items.length) return null
  return (
    <section className="container-x pt-32">
      <Reveal className="mb-10 flex items-end justify-between">
        <h2 className="font-display text-5xl uppercase md:text-7xl">
          You may <span className="text-outline">also like</span>
        </h2>
        <Link to={`/shop/${product.category.slug}`} className="link-sweep hidden text-sm font-bold uppercase tracking-widest sm:block">
          More {product.category.name}
        </Link>
      </Reveal>
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4">
        {items.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>
    </section>
  )
}

function ProductSkeleton() {
  return (
    <div className="container-x grid animate-pulse gap-10 pt-32 lg:grid-cols-12 lg:gap-16">
      <div className="aspect-[4/5] rounded-3xl bg-steel lg:col-span-7" />
      <div className="space-y-4 lg:col-span-5">
        <div className="h-4 w-24 rounded bg-steel" />
        <div className="h-14 w-3/4 rounded bg-steel" />
        <div className="h-10 w-32 rounded bg-steel" />
        <div className="mt-8 h-16 w-full rounded bg-steel" />
        <div className="h-14 w-full rounded-full bg-steel" />
      </div>
    </div>
  )
}
