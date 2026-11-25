import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Droplets, Palette, Ruler, Search, Truck, Users } from 'lucide-react'
import InfoPage from '../components/InfoPage.jsx'
import FaqItem from '../components/FaqItem.jsx'
import ContactCard from '../components/ContactCard.jsx'
import { HELP_GROUPS } from '../content/faq.jsx'
import { useSeo } from '../hooks/useSeo.js'

const GUIDES = [
  { icon: Truck, label: 'Delivery & FAQ', to: '/delivery' },
  { icon: Ruler, label: 'Size guide', to: '/size-guide' },
  { icon: Droplets, label: 'Washing instructions', to: '/care' },
  { icon: Palette, label: 'Kit Designer', to: '/kit-designer' },
  { icon: Users, label: 'Club shops', to: '/club-shop' },
]

export default function Help() {
  useSeo({ title: 'Help centre', description: 'Answers to common questions about ordering, delivery, returns, sizing, kit care and custom kit from Mako Sports.' })
  const [query, setQuery] = useState('')
  const term = query.trim().toLowerCase()

  const groups = HELP_GROUPS.map((g) => ({
    ...g,
    items: term ? g.items.filter((item) => `${g.title} ${item.q}`.toLowerCase().includes(term)) : g.items,
  })).filter((g) => g.items.length)

  return (
    <InfoPage eyebrow="Help" title={['Help', <span key="c" className="text-blaze">centre</span>]} intro="Answers to the questions we get asked most. Can't find what you need? Contact us and we'll help.">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {GUIDES.map(({ icon: Icon, label, to }) => (
          <Link key={to} to={to} className="group flex flex-col gap-3 rounded-2xl border border-line bg-coal p-5 transition-colors hover:border-blaze">
            <Icon size={24} className="text-blaze" />
            <span className="font-bold group-hover:text-blaze">{label}</span>
          </Link>
        ))}
      </div>

      <section className="mt-14" aria-labelledby="faq-title">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-3">FAQ</p>
            <h2 id="faq-title" className="font-display text-5xl uppercase md:text-6xl">Frequently asked questions</h2>
          </div>
          <label className="relative w-full max-w-sm">
            <span className="sr-only">Search questions</span>
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-mute" />
            <input type="search" className="input pl-11" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search questions" />
          </label>
        </div>

        {groups.length === 0 ? (
          <p role="status" className="mt-10 rounded-2xl border border-dashed border-line p-8 text-center text-bone/80">
            No questions match "{query.trim()}". Try another word, or <Link to="/contact" className="font-bold text-blaze underline underline-offset-4">contact us</Link>.
          </p>
        ) : (
          groups.map((g) => (
            <div key={g.title} className="mt-10">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-mute">{g.title}</h3>
              <div className="border-t border-line">
                {g.items.map((item) => (
                  <FaqItem key={`${g.title}-${item.q}`} item={item} />
                ))}
              </div>
            </div>
          ))
        )}
      </section>

      <ContactCard title="Looking for more help?" text="Send us a message and we'll get back to you." />
    </InfoPage>
  )
}
