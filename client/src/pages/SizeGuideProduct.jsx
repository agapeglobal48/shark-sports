import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Info } from 'lucide-react'
import GarmentArt from '../components/GarmentArt.jsx'
import { COLUMNS, GUIDES, RANGE_LABELS, SIZE_PRODUCTS, hasMeasurements } from '../content/sizes.js'
import { useSeo } from '../hooks/useSeo.js'
import { cx } from '../lib/format.js'
import NotFound from './NotFound.jsx'
import { KitDesignerCta, ProductTile } from './SizeGuide.jsx'

const CM_PER_INCH = 2.54
const toInches = (cm) => (cm / CM_PER_INCH).toFixed(1)

function formatValue(value, column, useInches) {
  if (value == null || value === '') return '–'
  if (COLUMNS[column].unit || !useInches) return String(value)
  return String(value)
    .split(/\s*[-–]\s*/)
    .map((part) => (Number.isNaN(Number(part)) ? part : toInches(Number(part))))
    .join('–')
}

// The top of a 'to fit' value such as '86-91', so the finder can compare it.
const upperBound = (value) => Number(String(value).split(/[-–]/).pop())

function SizeFinder({ chart, useInches }) {
  const [input, setInput] = useState('')
  const column = chart.columns[0]
  const unit = useInches ? 'in' : 'cm'
  const entered = Number(input)
  const value = useInches ? entered * CM_PER_INCH : entered
  const rows = chart.rows.filter((r) => !Number.isNaN(upperBound(r[column])) && r[column] != null && r[column] !== '')
  const match = entered > 0 ? rows.find((r) => upperBound(r[column]) >= value) : null
  const tooLarge = entered > 0 && !match && rows.length > 0

  return (
    <div className="rounded-2xl border border-line bg-coal p-5">
      <h3 className="font-bold">Find your size</h3>
      <label className="mt-3 block text-sm text-mute">
        Your {COLUMNS[column].label.replace(/ 'to fit'/, '').toLowerCase()} ({unit})
        <input className="input mt-2" inputMode="decimal" value={input} onChange={(e) => setInput(e.target.value.replace(/[^\d.]/g, ''))} placeholder={useInches ? 'e.g. 38' : 'e.g. 96'} />
      </label>
      <p role="status" className="mt-3 min-h-6 text-sm font-semibold">
        {match && (
          <>
            We recommend <span className="text-blaze">{match.size}</span>.
          </>
        )}
        {tooLarge && <span className="text-mute">That's above our largest size. Please contact us before you order.</span>}
      </p>
    </div>
  )
}

// Keyed by product, so the tabs and units start fresh when moving to another product.
export default function SizeGuideProduct() {
  const { slug } = useParams()
  return <ProductSizes key={slug} slug={slug} />
}

function ProductSizes({ slug }) {
  const product = SIZE_PRODUCTS.find((p) => p.slug === slug)
  const ranges = product ? Object.keys(product.charts) : []
  const [range, setRange] = useState(ranges.includes('adult') ? 'adult' : ranges[0])
  const [useInches, setUseInches] = useState(false)
  useSeo({ title: product ? `${product.name} size guide` : 'Size guide', description: product ? `How to order the right size of Mako Sports ${product.name.toLowerCase()}, with size charts and how to measure.` : undefined })

  if (!product) return <NotFound />

  const chart = product.charts[range] ?? product.charts[ranges[0]]
  const guide = GUIDES[product.kind]
  const measured = hasMeasurements(chart)
  const toFit = [...new Set(Object.values(product.charts).map((c) => c.columns[0]))]
  const others = SIZE_PRODUCTS.filter((p) => p.slug !== product.slug)

  return (
    <div className="pt-16 md:pt-24">
      <nav aria-label="Breadcrumb" className="container-x pb-4 pt-6 text-xs font-bold uppercase tracking-widest text-mute">
        <Link to="/" className="hover:text-bone">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/size-guide" className="hover:text-bone">Size guide</Link>
        <span className="mx-2">/</span>
        <span className="text-bone">{product.name}</span>
      </nav>

      <header className="container-x border-b border-line pb-8">
        <p className="eyebrow mb-3">Size guide</p>
        <h1 className="font-display text-5xl uppercase leading-[0.95] md:text-7xl">{product.name}</h1>
        <p className="mt-3 text-lg text-bone/80">How to order the right size</p>
        <Link to="/size-guide" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-blaze hover:underline">
          <ArrowLeft size={15} /> See size guides for other products
        </Link>
      </header>

      <section className="container-x grid gap-8 py-10 md:py-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12">
        <figure className="overflow-hidden rounded-3xl border border-line bg-linear-to-b from-white to-[#e6ebf0] p-6">
          <GarmentArt garment={product.garment} guides className="mx-auto aspect-15/16 w-full max-w-md" />
          <figcaption className="mt-2 text-center text-sm font-semibold text-ink/70">
            A = {COLUMNS[guide.a].label.toLowerCase()} · B = {COLUMNS[guide.b].label.toLowerCase()}
          </figcaption>
        </figure>

        <div>
          <h2 className="font-display text-3xl uppercase md:text-4xl">Order the right size</h2>
          <ol className="mt-5 space-y-4">
            {[
              <>Take a similar item that fits you well and lay it flat, with no creases.</>,
              <>
                <strong className="text-blaze">Measure A</strong> {guide.aText}.
              </>,
              <>
                <strong className="text-blaze">Measure B</strong> {guide.bText}.
              </>,
              <>
                Compare A with the <strong>{COLUMNS[guide.a].label}</strong> column and B with the <strong>{COLUMNS[guide.b].label}</strong> column below, and choose the closest size.
              </>,
            ].map((step, i) => (
              <li key={i} className="flex gap-4">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blaze font-bold text-ink">{i + 1}</span>
                <span className="pt-1 text-bone/85">{step}</span>
              </li>
            ))}
          </ol>

          <div className="mt-6 rounded-2xl border border-line bg-coal p-5">
            <h3 className="font-bold">Using your body measurements instead?</h3>
            <p className="mt-2 text-sm text-bone/75">Compare them with the &lsquo;to fit&rsquo; column. If you&rsquo;re between sizes, choose the larger one.</p>
            <ul className="mt-3 space-y-1.5 text-sm text-bone/75">
              {toFit.map((c) => (
                <li key={c}>
                  <strong className="text-bone">{COLUMNS[c].label}:</strong> {COLUMNS[c].how}
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-6 flex gap-3 rounded-2xl border border-blaze/40 bg-blaze/10 p-4 text-sm text-bone/90">
            <Info size={18} className="mt-0.5 shrink-0 text-blaze" />
            <span>
              Kit made to your design is made to order, so please check your size carefully before you order. Not sure? <Link to="/contact" className="font-bold text-blaze hover:underline">Ask us</Link>. Our{' '}
              <Link to="/returns" className="font-bold text-blaze hover:underline">returns policy</Link> explains what can be returned.
            </span>
          </p>
        </div>
      </section>

      <section className="container-x pb-12 md:pb-16" aria-labelledby="size-chart">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="size-chart" className="font-display text-3xl uppercase md:text-4xl">Size chart</h2>
          <div className="flex rounded-full border border-line p-1 text-sm font-bold" role="group" aria-label="Units">
            {[['CM', false], ['IN', true]].map(([label, inches]) => (
              <button key={label} type="button" onClick={() => setUseInches(inches)} aria-pressed={useInches === inches} className={cx('rounded-full px-4 py-1.5 transition-colors', useInches === inches ? 'bg-blaze text-ink' : 'text-bone/75 hover:text-bone')}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Size range">
          {ranges.map((r) => (
            <button
              key={r}
              type="button"
              role="tab"
              aria-selected={r === range}
              onClick={() => setRange(r)}
              className={cx('rounded-full border px-5 py-2 text-sm font-bold uppercase tracking-widest transition-colors', r === range ? 'border-blaze bg-blaze text-ink' : 'border-line text-bone/80 hover:border-blaze/60')}
            >
              {RANGE_LABELS[r]}
            </button>
          ))}
        </div>

        {!measured && (
          <p className="mt-5 rounded-2xl border border-dashed border-line bg-coal p-4 text-sm text-bone/80">
            We&rsquo;re finishing the {RANGE_LABELS[range].toLowerCase()} measurements for this product. Need a size now? <Link to="/contact" className="font-bold text-blaze hover:underline">Contact us</Link> and we&rsquo;ll help.
          </p>
        )}

        <div className={cx('mt-5 grid gap-4', measured && 'lg:grid-cols-[minmax(0,3fr)_minmax(0,1fr)]')}>
          <div className="overflow-x-auto rounded-2xl border border-line">
            <table className="w-full min-w-xl text-left text-sm">
              <caption className="sr-only">
                {product.name}, {RANGE_LABELS[range]} sizes, in {useInches ? 'inches' : 'centimetres'}
              </caption>
              <thead className="bg-coal text-xs uppercase tracking-widest text-mute">
                <tr>
                  <th scope="col" className="px-4 py-3">Size</th>
                  {chart.columns.map((c) => (
                    <th key={c} scope="col" className="px-4 py-3">
                      {COLUMNS[c].label}
                      {[guide.a, guide.b].includes(c) && <span className="ml-1 text-[#ffd500]">({c === guide.a ? 'A' : 'B'})</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {chart.rows.map((row) => (
                  <tr key={row.size} className="border-t border-line">
                    <th scope="row" className="whitespace-nowrap px-4 py-3 font-bold text-blaze">{row.size}</th>
                    {chart.columns.map((c) => (
                      <td key={c} className="px-4 py-3 tabular-nums">{formatValue(row[c], c, useInches)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {measured && <SizeFinder key={`${slug}-${range}`} chart={chart} useInches={useInches} />}
        </div>
        <p className="mt-3 text-xs text-mute">
          {useInches ? 'Inches' : 'Centimetres'}. &lsquo;To fit&rsquo; is your body measurement; &lsquo;across&rsquo; is the garment laid flat, measured from side to side.
        </p>
      </section>

      <section className="border-y border-line bg-coal">
        <div className="container-x py-12 md:py-16">
          <h2 className="font-display text-3xl uppercase md:text-4xl">Size guides for other products</h2>
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {others.map((p) => (
              <li key={p.slug}>
                <ProductTile product={p} small />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <KitDesignerCta />
    </div>
  )
}
