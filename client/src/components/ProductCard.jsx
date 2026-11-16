import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { cldImage, formatPrice, cx } from '../lib/format.js'
import ImagePlaceholder from './ImagePlaceholder.jsx'

export default function ProductCard({ product, index = 0 }) {
  const [hoverColor, setHoverColor] = useState(null)
  const onSale = product.compareAtPricePence > product.pricePence
  const salePct = onSale ? Math.round((1 - product.pricePence / product.compareAtPricePence) * 100) : 0

  // Hovering a swatch previews that colour's photo.
  const swatchImage = hoverColor?.image
  const main = swatchImage ?? product.image?.url
  const hover = swatchImage ? null : product.hoverImage?.url
  const href = `/product/${product.slug}${hoverColor ? `?color=${encodeURIComponent(hoverColor.name)}` : ''}`

  return (
    <motion.article
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: (index % 4) * 0.08 }}
      className="group relative"
    >
      <Link to={href} className="block" aria-label={product.name}>
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-steel transition-transform duration-700 ease-out-expo group-hover:-translate-y-1.5">
          {main ? (
            <>
              <img
                src={cldImage(main, 700)}
                alt={product.image?.altText || product.name}
                loading="lazy"
                className={cx(
                  'absolute inset-0 h-full w-full object-cover transition-all duration-[1.2s] ease-out-expo group-hover:scale-[1.06]',
                  hover && 'group-hover:opacity-0',
                )}
              />
              {hover && (
                <img
                  src={cldImage(hover, 700)}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-full scale-110 object-cover opacity-0 transition-all duration-[1.2s] ease-out-expo group-hover:scale-100 group-hover:opacity-100"
                />
              )}
            </>
          ) : (
            <div className="absolute inset-0 transition-transform duration-[1.2s] ease-out-expo group-hover:scale-[1.06]">
              <ImagePlaceholder label={product.category?.name} />
            </div>
          )}

          {/* Badges */}
          <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {!product.inStock && <Badge className="bg-bone text-ink">Sold out</Badge>}
            {onSale && product.inStock && <Badge className="bg-blaze text-ink">-{salePct}%</Badge>}
            {product.isFeatured && product.inStock && !onSale && <Badge className="bg-ink/70 text-bone backdrop-blur">Featured</Badge>}
          </div>

          {/* Arrow that spins in on hover */}
          <span className="absolute right-3 top-3 grid h-10 w-10 -rotate-45 scale-50 place-items-center rounded-full bg-bone text-ink opacity-0 transition-all duration-500 ease-out-expo group-hover:rotate-0 group-hover:scale-100 group-hover:opacity-100">
            <ArrowUpRight size={18} />
          </span>

          {/* Sizes slide up on hover */}
          {product.sizes?.length > 0 && (
            <div className="absolute inset-x-3 bottom-3 translate-y-[130%] rounded-xl bg-ink/75 p-3 backdrop-blur-md transition-transform duration-500 ease-out-expo group-hover:translate-y-0">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-mute">Available sizes</p>
              <div className="flex flex-wrap gap-1.5">
                {product.sizes.slice(0, 8).map((s) => (
                  <span key={s} className="rounded-md border border-line px-2 py-1 text-xs font-bold">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </Link>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          {product.brand && <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-mute">{product.brand.name}</p>}
          <Link to={href} className="mt-0.5 block truncate font-bold transition-colors group-hover:text-blaze">
            {product.name}
          </Link>
        </div>
        <div className="shrink-0 text-right">
          <p className={cx('font-bold', onSale && 'text-blaze')}>{formatPrice(product.pricePence)}</p>
          {onSale && <p className="text-xs text-mute line-through">{formatPrice(product.compareAtPricePence)}</p>}
        </div>
      </div>

      {product.colors?.length > 1 && (
        <div className="mt-3 flex items-center gap-1.5" onPointerLeave={() => setHoverColor(null)}>
          {product.colors.slice(0, 6).map((c) => (
            <button
              key={c.id}
              type="button"
              onPointerEnter={() => setHoverColor(c)}
              onFocus={() => setHoverColor(c)}
              aria-label={c.name}
              title={c.name}
              className={cx(
                'h-4 w-4 rounded-full border border-bone/20 ring-offset-2 ring-offset-ink transition-all duration-300 hover:scale-125',
                hoverColor?.id === c.id && 'ring-2 ring-blaze',
              )}
              style={{ background: c.hexCode || '#555' }}
            />
          ))}
          {product.colors.length > 6 && <span className="ml-1 text-xs text-mute">+{product.colors.length - 6}</span>}
        </div>
      )}
    </motion.article>
  )
}

function Badge({ children, className }) {
  return <span className={cx('rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest', className)}>{children}</span>
}

export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/5] rounded-2xl bg-steel" />
      <div className="mt-4 h-3 w-1/3 rounded bg-steel" />
      <div className="mt-2 h-4 w-2/3 rounded bg-steel" />
    </div>
  )
}
