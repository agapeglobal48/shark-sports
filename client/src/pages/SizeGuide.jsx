import { Link } from 'react-router-dom'
import { ArrowRight, Ruler, Shirt } from 'lucide-react'
import { HERO_VIDEO } from '../config.js'
import GarmentArt from '../components/GarmentArt.jsx'
import { SIZE_PRODUCTS } from '../content/sizes.js'
import { useSeo } from '../hooks/useSeo.js'

export function ProductTile({ product, small = false }) {
  return (
    <Link
      to={`/size-guide/${product.slug}`}
      className="group block overflow-hidden rounded-2xl border-2 border-line bg-coal transition-colors hover:border-blaze focus-visible:border-blaze"
    >
      <span className="block bg-linear-to-b from-white to-[#e6ebf0] p-3">
        <GarmentArt garment={product.garment} className="mx-auto aspect-15/16 w-full transition-transform duration-500 ease-out-expo group-hover:scale-105" />
      </span>
      <span className={small ? 'block px-3 py-2.5 text-sm font-bold' : 'flex items-center justify-between gap-2 px-4 py-3.5 font-bold'}>
        {product.name}
        {!small && <ArrowRight size={16} className="shrink-0 text-blaze transition-transform group-hover:translate-x-1" />}
      </span>
    </Link>
  )
}

export function KitDesignerCta() {
  return (
    <section className="container-x py-16 text-center md:py-20">
      <p className="eyebrow mb-3">Kit Designer</p>
      <h2 className="mx-auto max-w-2xl font-display text-4xl uppercase leading-tight md:text-5xl">
        Know your size? <span className="text-blaze">Design your kit</span>
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-bone/75">Choose your style and colours, then add your logo, names and numbers.</p>
      <Link to="/kit-designer" className="btn btn-primary mt-8">
        <span>Design your kit now</span>
        <ArrowRight size={16} />
      </Link>
    </section>
  )
}

export default function SizeGuide() {
  useSeo({ title: 'Size guide', description: 'Size guides for every Mako Sports product, with size charts for youth, adult, ladies and slim fit, and how to measure.' })

  return (
    <div className="pt-16 md:pt-24">
      <nav aria-label="Breadcrumb" className="container-x pb-4 pt-6 text-xs font-bold uppercase tracking-widest text-mute">
        <Link to="/" className="hover:text-bone">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-bone">Size guide</span>
      </nav>

      <section className="relative overflow-hidden border-y border-line">
        <img src={HERO_VIDEO.poster} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
        <div className="absolute inset-0 bg-linear-to-r from-ink via-ink/80 to-ink/30" />
        <div className="container-x relative py-14 md:py-20">
          <p className="eyebrow mb-4">Fit and sizing</p>
          <h1 className="font-display text-6xl uppercase leading-[0.9] md:text-8xl">
            Size <span className="text-blaze">guides</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-bone/80">Every product fits a little differently, so each one has its own size guide. Choose the product you're ordering to see its sizes.</p>
        </div>
      </section>

      <section className="container-x py-12 md:py-16">
        <h2 className="font-display text-3xl uppercase md:text-4xl">Please select a product type</h2>
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {SIZE_PRODUCTS.map((p) => (
            <li key={p.slug}>
              <ProductTile product={p} />
            </li>
          ))}
        </ul>
      </section>

      <section className="border-y border-line bg-coal">
        <div className="container-x py-12 md:py-16">
          <p className="eyebrow mb-3">How to measure</p>
          <h2 className="font-display text-3xl uppercase md:text-4xl">Two ways to find your size</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-line bg-ink p-6">
              <Shirt className="text-blaze" size={28} />
              <h3 className="mt-4 text-lg font-bold">Measure a garment that fits you</h3>
              <p className="mt-2 text-bone/75">
                Lay a similar item that fits you well flat on a table. Measure its length (A) and its width from armpit to armpit (B), then compare them with the &lsquo;across&rsquo; and length columns. Each
                size guide shows where A and B are on that product.
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-ink p-6">
              <Ruler className="text-blaze" size={28} />
              <h3 className="mt-4 text-lg font-bold">Measure your body</h3>
              <p className="mt-2 text-bone/75">
                Use a soft tape measure over light clothing, snug but not tight. Compare your chest, bust or waist with the &lsquo;to fit&rsquo; column. If you&rsquo;re between sizes, choose the larger one.
              </p>
            </div>
          </div>
        </div>
      </section>

      <KitDesignerCta />
    </div>
  )
}
