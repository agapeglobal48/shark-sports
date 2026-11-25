import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'motion/react'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { HOME_VIDEO, LOGO } from '../config.js'
import { api } from '../api/client.js'
import { useApi } from '../hooks/useApi.js'
import { useCatalog } from '../context/CatalogContext.jsx'
import { Magnetic, Marquee, Reveal, ScrollWords, SplitLines } from '../components/motion.jsx'
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard.jsx'
import { useSeo } from '../hooks/useSeo.js'
import { BUSINESS } from '../content/business.js'

export default function Home() {
  useSeo({})
  return (
    <>
      <SiteJsonLd />
      <Hero />
      <CategoryMarquee />
      <Categories />
      <NewArrivals />
      <Statement />
      <ClosingCta />
    </>
  )
}

// ─── Hero ────────────────────────────────────────────────

// The logo sits in the upper part of the frame, so keep that part in view when the sides are cropped.
const HERO_MEDIA = 'h-full w-full object-cover object-[50%_30%]'

function Hero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const videoY = useTransform(scrollYProgress, [0, 1], ['0%', '25%'])
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.15])
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '40%'])
  const textOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  // The intro plays once and stops on the logo. If it can't play (autoplay blocked,
  // e.g. iPhone Low Power Mode, or the visitor prefers reduced motion), show the logo frame instead.
  const videoRef = useRef(null)
  const [stillOnly, setStillOnly] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    if (stillOnly) return
    videoRef.current?.play()?.catch(() => setStillOnly(true))
  }, [stillOnly])

  return (
    <section ref={ref} className="relative h-[calc(100svh-6.5rem)] min-h-150 overflow-hidden bg-[#031a33] md:h-[calc(100svh-7.5rem)]">
      {/* The video takes the top of the hero so the logo is never behind the text */}
      <motion.div className="absolute inset-x-0 top-0 aspect-3/2 sm:aspect-2/1 md:aspect-auto md:h-[80%] [mask-image:linear-gradient(to_bottom,black_70%,transparent)]" style={{ y: videoY, scale: videoScale }}>
        <motion.div className="h-full w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }}>
          {stillOnly ? (
            <img src={HOME_VIDEO.poster} alt="" className={HERO_MEDIA} />
          ) : (
            <video ref={videoRef} className={HERO_MEDIA} src={HOME_VIDEO.src} muted playsInline preload="auto" aria-hidden />
          )}
        </motion.div>
      </motion.div>

      {/* Blend the bottom of the video into the page, leaving the logo bright */}
      <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/70 via-30% to-transparent to-55%" />

      <motion.div style={{ y: textY, opacity: textOpacity }} className="container-x relative flex h-full flex-col justify-end pb-16 md:pb-12">
        <motion.p
          className="eyebrow mb-5 flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <span className="h-px w-10 bg-blaze" /> New season · Mako Sports
        </motion.p>

        <h1 className="font-display text-[17vw] uppercase leading-[0.86] tracking-tight sm:text-[12vw] md:text-[7.5vw] xl:text-[7rem]">
          <SplitLines lines={['Built to', <span key="b" className="text-outline">hunt.</span>]} className="block md:flex md:gap-[0.25em]" delay={0.4} stagger={0.14} />
        </h1>

        <div className="mt-6 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <motion.p
            className="max-w-md text-base text-bone/80 md:text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            Hoodies, jerseys and training gear for the ones who show up early, stay late and never ease off.
          </motion.p>

          <motion.div
            className="flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.15, duration: 0.8 }}
          >
            <Magnetic>
              <Link to="/shop" className="btn btn-primary group">
                <span>Shop now</span>
                <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Magnetic>
            <Magnetic>
              <a href="#categories" className="btn btn-ghost">
                <span>Explore categories</span>
              </a>
            </Magnetic>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 md:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        aria-hidden
      >
        <div className="flex h-10 w-6 justify-center rounded-full border border-bone/40 pt-2">
          <span className="h-2 w-1 animate-scroll-dot rounded-full bg-blaze" />
        </div>
      </motion.div>
    </section>
  )
}

// ─── Scrolling category strip ─────────────────────────────

function CategoryMarquee() {
  const { categories } = useCatalog()
  return (
    <div className="overflow-hidden py-4">
    <div className="-mx-4 -rotate-1 border-y border-blaze bg-blaze py-3 text-ink">
      <Marquee duration={22}>
        {[...categories, ...categories].map((c, i) => (
          <Link key={i} to={`/shop/${c.slug}`} className="flex items-center px-6 font-display text-3xl uppercase transition-opacity hover:opacity-60 md:text-4xl">
            {c.name}
            <span className="ml-12 text-xl">✦</span>
          </Link>
        ))}
      </Marquee>
    </div>
    </div>
  )
}

// ─── Category tiles ───────────────────────────────────────

function Categories() {
  const { categories } = useCatalog()
  return (
    <section id="categories" className="container-x scroll-mt-24 pt-28 md:pt-36">
      <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <Reveal as="p" className="eyebrow mb-4">
            Shop by category
          </Reveal>
          <h2 className="font-display text-6xl uppercase leading-[0.9] md:text-8xl">
            <SplitLines lines={['Pick your', <span key="k" className="text-blaze">kit</span>]} animateOnView />
          </h2>
        </div>
        <Reveal>
          <Link to="/shop" className="link-sweep inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
            View everything <ArrowUpRight size={16} />
          </Link>
        </Reveal>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c, i) => (
          <Reveal key={c.slug} delay={(i % 3) * 0.08}>
            <CategoryTile category={c} index={i} />
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function CategoryTile({ category, index }) {
  return (
    <Link
      to={`/shop/${category.slug}`}
      className="group relative flex h-56 flex-col justify-between overflow-hidden rounded-2xl border border-line bg-coal p-6 md:h-72 md:p-8"
    >
      {category.imageUrl && (
        <img src={category.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30 transition-all duration-700 group-hover:scale-110 group-hover:opacity-50" />
      )}
      {/* Fill that wipes up on hover */}
      <span className="absolute inset-0 translate-y-full bg-blaze transition-transform duration-700 ease-snap group-hover:translate-y-0" />
      {/* Logo watermark */}
      <img
        src={LOGO}
        alt=""
        className="absolute -bottom-6 -right-10 w-64 rotate-[-8deg] opacity-[0.04] transition-all duration-700 ease-out-expo group-hover:-translate-x-6 group-hover:rotate-0 group-hover:opacity-20 group-hover:brightness-0"
      />

      <div className="relative flex items-start justify-between">
        <span className="text-sm font-bold text-mute transition-colors duration-500 group-hover:text-ink">0{index + 1}</span>
        <span className="grid h-11 w-11 place-items-center rounded-full border border-line transition-all duration-500 ease-out-expo group-hover:rotate-45 group-hover:border-ink group-hover:bg-ink group-hover:text-blaze">
          <ArrowUpRight size={20} />
        </span>
      </div>

      <div className="relative">
        <h3 className="font-display text-5xl uppercase leading-none transition-all duration-500 ease-out-expo group-hover:translate-x-2 group-hover:text-ink md:text-6xl">
          {category.name}
        </h3>
        <p className="mt-2 text-sm text-mute transition-colors duration-500 group-hover:text-ink/70">
          {category.productCount ? `${category.productCount} product${category.productCount === 1 ? '' : 's'}` : 'Shop now'}
        </p>
      </div>
    </Link>
  )
}

// ─── New arrivals ─────────────────────────────────────────

function NewArrivals() {
  const { data, loading } = useApi(() => api.products({ limit: 8, sort: 'newest' }), 'home-new')
  const products = data?.products ?? []

  if (!loading && products.length === 0) return null

  return (
    <section className="container-x pt-28 md:pt-36">
      <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <Reveal as="p" className="eyebrow mb-4">
            Just landed
          </Reveal>
          <h2 className="font-display text-6xl uppercase leading-[0.9] md:text-8xl">
            <SplitLines lines={['New', <span key="a" className="text-outline">arrivals</span>]} animateOnView />
          </h2>
        </div>
        <Reveal>
          <Magnetic>
            <Link to="/shop" className="btn btn-ghost">
              <span>Shop all</span>
            </Link>
          </Magnetic>
        </Reveal>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
      </div>
    </section>
  )
}

// ─── Scroll-lit statement ─────────────────────────────────

function Statement() {
  return (
    <section className="container-x py-32 md:py-48">
      <Reveal as="p" className="eyebrow mb-8">
        The Mako mindset
      </Reveal>
      <ScrollWords
        className="max-w-6xl font-display text-5xl uppercase leading-[1.02] md:text-7xl lg:text-8xl"
        text="A mako never stops *moving. Neither do you. Train *harder, recover *smarter and look the part doing *both."
      />
    </section>
  )
}

// ─── Closing call to action ───────────────────────────────

function ClosingCta() {
  return (
    <section className="container-x">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-blaze px-6 py-20 text-ink md:px-16 md:py-28">
          <img src={LOGO} alt="" className="pointer-events-none absolute -right-20 top-1/2 w-[70%] max-w-3xl -translate-y-1/2 opacity-15 brightness-0" />
          <div className="relative max-w-2xl">
            <h2 className="font-display text-6xl uppercase leading-[0.9] md:text-8xl">
              <SplitLines lines={['Join the', 'pack.']} animateOnView />
            </h2>
            <p className="mt-6 max-w-md text-lg font-medium text-ink/75">
              Create an account to check out faster and keep track of your orders.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Magnetic>
                <Link to="/register" className="btn bg-ink text-bone before:bg-bone hover:text-ink">
                  <span>Create account</span>
                </Link>
              </Magnetic>
              <Magnetic>
                <Link to="/shop" className="btn border border-ink/30 text-ink before:bg-ink hover:text-bone">
                  <span>Keep shopping</span>
                </Link>
              </Magnetic>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

// Tells Google the store's name, logo and how to search it.
function SiteJsonLd() {
  const origin = window.location.origin
  const data = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: BUSINESS.tradingName,
      url: origin,
      logo: `${origin}${LOGO}`,
      ...(BUSINESS.email && { email: BUSINESS.email }),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: BUSINESS.tradingName,
      url: origin,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${origin}/shop?search={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ]
  return <script type="application/ld+json">{JSON.stringify(data)}</script>
}
