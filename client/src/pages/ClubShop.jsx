import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, MessageCircle, Palette, Ruler, Search, Shirt } from 'lucide-react'
import { HERO_VIDEO } from '../config.js'
import { useSeo } from '../hooks/useSeo.js'

// Add clubs here as their shops go live, e.g. { name: 'Riverside FC', to: '/shop' }.
const CLUB_SHOPS = []

const STEPS = [
  { title: 'Design your kit', text: 'Pick your item, style and colours, then add your badge, names and numbers.' },
  { title: 'Agree the details', text: 'Tell us your range, sizes and timings, and we confirm everything with you.' },
  { title: 'Share your shop', text: 'Send your players, parents and fans one link so they can order direct.' },
]

const TILES = [
  { icon: Palette, title: 'Kit Designer', text: 'Create your club kit in minutes.', to: '/kit-designer' },
  { icon: Ruler, title: 'Size guide', text: 'Check sizes before anyone orders.', to: '/size-guide' },
  { icon: Shirt, title: 'Shop the range', text: 'Browse hoodies, jerseys and more.', to: '/shop' },
  { icon: MessageCircle, title: 'Ask us anything', text: "Questions? We're happy to help.", to: '/contact' },
]

function Banner({ title, children, position = 'center' }) {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <img src={HERO_VIDEO.poster} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" style={{ objectPosition: position }} />
      <div className="absolute inset-0 bg-linear-to-r from-ink via-ink/85 to-ink/30" />
      <div className="container-x relative py-16 md:py-24">
        <h2 className="font-display text-5xl uppercase leading-none md:text-7xl">{title}</h2>
        <div className="mt-5 max-w-xl">{children}</div>
      </div>
    </section>
  )
}

function ClubSearch() {
  const [query, setQuery] = useState('')
  const [searched, setSearched] = useState(null)
  const term = searched?.trim().toLowerCase() ?? ''
  const results = term ? CLUB_SHOPS.filter((c) => c.name.toLowerCase().includes(term)) : []

  return (
    <>
      <form
        className="mt-6 flex max-w-lg"
        onSubmit={(e) => {
          e.preventDefault()
          if (query.trim().length >= 3) setSearched(query)
        }}
      >
        <label htmlFor="club-search" className="sr-only">Club name</label>
        <input
          id="club-search"
          className="input rounded-r-none"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter at least 3 letters of your club's name"
          minLength={3}
        />
        <button type="submit" className="grid w-16 shrink-0 place-items-center rounded-r-xl bg-blaze text-ink transition-colors hover:bg-blaze-dark" aria-label="Find club shop">
          <Search size={20} strokeWidth={2.5} />
        </button>
      </form>

      {searched !== null && (
        <div role="status" className="mt-4 max-w-lg">
          {results.length > 0 ? (
            <ul className="space-y-2">
              {results.map((c) => (
                <li key={c.name}>
                  <Link to={c.to} className="flex items-center justify-between rounded-xl border border-line bg-coal px-4 py-3 font-bold hover:border-blaze">
                    {c.name} <ArrowRight size={16} className="text-blaze" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-xl border border-line bg-coal/90 px-4 py-3 text-sm text-bone/85">
              We couldn't find a shop for "{searched.trim()}". Your club may not have one yet.{' '}
              <Link to="/contact" className="font-bold text-blaze underline underline-offset-4">Ask us about setting one up.</Link>
            </p>
          )}
        </div>
      )}
    </>
  )
}

export default function ClubShop() {
  useSeo({ title: 'Club Shop', description: 'Find your club shop, or set one up so your players and fans can order your club kit direct from Mako Sports.' })

  return (
    <div className="pt-16 md:pt-24">
      <nav aria-label="Breadcrumb" className="container-x pb-4 pt-6 text-xs font-bold uppercase tracking-widest text-mute">
        <Link to="/" className="hover:text-bone">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-bone">Club Shop</span>
      </nav>

      <section className="relative overflow-hidden border-y border-line">
        <img src={HERO_VIDEO.poster} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-linear-to-r from-ink via-ink/80 to-ink/20" />
        <div className="container-x relative py-16 md:py-24">
          <p className="eyebrow mb-4">Club Shop</p>
          <h1 className="font-display text-6xl uppercase leading-[0.9] md:text-8xl">
            Find your <span className="text-blaze">club shop</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-bone/80">Your club's kit in one place. Players, parents and fans order direct, so nobody has to collect sizes or chase payments.</p>
          <ClubSearch />
        </div>
      </section>

      <Banner title={<>Set up a <span className="text-blaze">club shop</span></>} position="70% center">
        <p className="text-lg text-bone/80">Give your club its own online shop. Everyone orders their own kit, in their own size, whenever they need it.</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link to="/contact" className="btn btn-primary">
            <span>Set up a club shop</span>
            <ArrowRight size={16} />
          </Link>
          <Link to="/kit-designer" className="btn btn-ghost">
            <span>Design your kit first</span>
          </Link>
        </div>
      </Banner>

      <section className="container-x py-16 md:py-24">
        <p className="eyebrow mb-4">How it works</p>
        <ol className="grid gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="rounded-2xl border border-line bg-coal p-6">
              <span className="font-display text-5xl text-blaze">0{i + 1}</span>
              <h3 className="mt-3 font-display text-2xl uppercase">{s.title}</h3>
              <p className="mt-2 text-bone/75">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-line bg-coal">
        <div className="container-x grid gap-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {TILES.map(({ icon: Icon, title, text, to }) => (
            <Link key={title} to={to} className="group rounded-2xl border border-line bg-ink p-6 transition-colors hover:border-blaze">
              <span className="grid h-14 w-14 place-items-center rounded-xl bg-blaze/15 text-blaze transition-colors group-hover:bg-blaze group-hover:text-ink">
                <Icon size={26} />
              </span>
              <h3 className="mt-5 font-bold">{title}</h3>
              <p className="mt-1 text-sm text-mute">{text}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-x py-16 text-center md:py-24">
        <h2 className="mx-auto max-w-2xl font-display text-4xl uppercase leading-tight md:text-5xl">
          Talk to us about a <span className="text-blaze">club shop</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-bone/75">Tell us about your club and what you need, and we'll get back to you.</p>
        <Link to="/contact" className="btn btn-primary mt-8">
          <span>Contact us</span>
          <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  )
}
