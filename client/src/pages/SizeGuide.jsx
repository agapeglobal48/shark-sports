import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Ruler } from 'lucide-react'
import { HERO_VIDEO } from '../config.js'
import { useCatalog } from '../context/CatalogContext.jsx'
import { DEFAULT_CHART, MEASUREMENTS, SIZE_CHARTS } from '../content/sizes.js'
import { useSeo } from '../hooks/useSeo.js'
import { cx } from '../lib/format.js'

const CM_PER_INCH = 2.54

const SHAPES = {
  top: 'M34 10 C40 18 56 18 62 10 L80 16 L94 40 L82 48 L76 38 L76 88 L20 88 L20 38 L14 48 L2 40 L16 16 Z',
  hoodies: 'M34 12 C34 2 62 2 62 12 L80 18 L94 42 L82 50 L76 40 L76 88 L20 88 L20 40 L14 50 L2 42 L16 18 Z',
  trousers: 'M26 6 H70 L78 90 H56 L48 34 L40 90 H18 Z',
  hats: 'M14 62 C14 26 82 26 82 62 L92 66 C92 72 4 72 4 66 Z',
  socks: 'M36 6 H60 V52 L80 68 C88 76 82 90 70 88 L36 70 Z',
}

const shapeFor = (slug) => SHAPES[slug] ?? SHAPES.top

function chartFor(slug) {
  return SIZE_CHARTS[slug] ?? DEFAULT_CHART
}

function formatValue(value, unit, useInches) {
  if (value == null || value === '') return '–'
  if (unit !== 'cm') return value
  return useInches ? (value / CM_PER_INCH).toFixed(1) : value
}

function SizeFinder({ chart, useInches }) {
  const [input, setInput] = useState('')
  const measure = MEASUREMENTS[chart.finder]
  const isCm = measure.unit === 'cm'
  const unitLabel = isCm ? (useInches ? 'in' : 'cm') : measure.unit
  const entered = Number(input)
  const value = isCm && useInches ? entered * CM_PER_INCH : entered
  const values = chart.rows.map((r) => Number(r[chart.finder])).filter((v) => !Number.isNaN(v))
  const match = input === '' || !entered ? null : chart.rows.find((r) => Number(r[chart.finder]) >= value)
  const tooLarge = input !== '' && entered > 0 && !match && values.length > 0

  return (
    <div className="rounded-2xl border border-line bg-coal p-5">
      <h3 className="font-bold">Find your size</h3>
      <label className="mt-3 block text-sm text-mute">
        Your {measure.label.toLowerCase()} ({unitLabel})
        <input className="input mt-2" inputMode="decimal" value={input} onChange={(e) => setInput(e.target.value.replace(/[^\d.]/g, ''))} placeholder={`e.g. ${isCm ? (useInches ? '38' : '96') : '8'}`} />
      </label>
      <p role="status" className="mt-3 min-h-6 text-sm font-semibold">
        {match && (
          <>
            We recommend size <span className="text-blaze">{match.size}</span>.
          </>
        )}
        {tooLarge && <span className="text-mute">That's above our largest size. Please contact us before you order.</span>}
      </p>
    </div>
  )
}

function SizeChart({ category, useInches }) {
  const chart = chartFor(category.slug)

  if (!chart.rows.length) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-coal p-8 text-center">
        <Ruler className="mx-auto text-blaze" size={32} />
        <h3 className="mt-4 font-display text-3xl uppercase">{category.name} chart coming soon</h3>
        <p className="mx-auto mt-2 max-w-md text-bone/75">We're finishing the measurements for this range. Not sure which size to choose? Ask us before you order.</p>
        <Link to="/contact" className="btn btn-primary mt-6">
          <span>Ask about sizing</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="overflow-x-auto rounded-2xl border border-line lg:col-span-2">
        <table className="w-full min-w-md text-left text-sm">
          <caption className="sr-only">{category.name} size chart</caption>
          <thead className="bg-coal text-xs uppercase tracking-widest text-mute">
            <tr>
              <th scope="col" className="px-4 py-3">Size</th>
              {chart.measures.map((m) => (
                <th key={m} scope="col" className="px-4 py-3">
                  {MEASUREMENTS[m].label} ({MEASUREMENTS[m].unit === 'cm' ? (useInches ? 'in' : 'cm') : MEASUREMENTS[m].unit})
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {chart.rows.map((row) => (
              <tr key={row.size} className="border-t border-line">
                <th scope="row" className="px-4 py-3 font-bold text-blaze">{row.size}</th>
                {chart.measures.map((m) => (
                  <td key={m} className="px-4 py-3 tabular-nums">{formatValue(row[m], MEASUREMENTS[m].unit, useInches)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <SizeFinder key={category.slug} chart={chart} useInches={useInches} />
    </div>
  )
}

export default function SizeGuide() {
  useSeo({ title: 'Size guide', description: 'Find the right size before you order from Mako Sports, with size charts and tips on how to measure yourself.' })
  const { categories } = useCatalog()
  const [selected, setSelected] = useState(null)
  const [useInches, setUseInches] = useState(false)
  const category = categories.find((c) => c.slug === selected) ?? categories[0]
  const chart = category ? chartFor(category.slug) : DEFAULT_CHART

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
            Size <span className="text-blaze">guide</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-bone/80">Measure yourself, then compare with the chart for the item you want.</p>
        </div>
      </section>

      <section className="container-x py-12 md:py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-3xl uppercase md:text-4xl">Choose a product type</h2>
          <div className="flex rounded-full border border-line p-1 text-sm font-bold" role="group" aria-label="Units">
            {[['cm', false], ['inches', true]].map(([label, inches]) => (
              <button key={label} type="button" onClick={() => setUseInches(inches)} aria-pressed={useInches === inches} className={cx('rounded-full px-4 py-1.5 transition-colors', useInches === inches ? 'bg-blaze text-ink' : 'text-bone/75 hover:text-bone')}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => setSelected(c.slug)}
              aria-pressed={category?.slug === c.slug}
              className={cx('group rounded-2xl border bg-coal p-4 text-left transition-colors', category?.slug === c.slug ? 'border-blaze' : 'border-line hover:border-blaze/60')}
            >
              <svg viewBox="0 0 96 96" className="mx-auto h-20 w-20" aria-hidden>
                <path d={shapeFor(c.slug)} className={cx('transition-colors', category?.slug === c.slug ? 'fill-blaze' : 'fill-bone/80 group-hover:fill-bone')} />
              </svg>
              <span className="mt-3 block font-bold">{c.name}</span>
              <span className="text-xs text-mute">{chartFor(c.slug).rows.length ? 'View chart' : 'Coming soon'}</span>
            </button>
          ))}
        </div>

        {category && (
          <div className="mt-8">
            <SizeChart category={category} useInches={useInches} />
          </div>
        )}
      </section>

      <section className="border-y border-line bg-coal">
        <div className="container-x py-12 md:py-16">
          <p className="eyebrow mb-3">How to measure</p>
          <h2 className="font-display text-3xl uppercase md:text-4xl">Get it right first time</h2>
          <p className="mt-3 max-w-2xl text-bone/75">Use a soft tape measure over light clothing. Keep the tape snug but not tight. If you're between sizes, choose the larger one for a looser fit.</p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {chart.measures.map((m) => (
              <li key={m} className="rounded-2xl border border-line bg-ink p-5">
                <h3 className="font-bold text-blaze">{MEASUREMENTS[m].label}</h3>
                <p className="mt-2 text-sm text-bone/75">{MEASUREMENTS[m].how}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

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
    </div>
  )
}
