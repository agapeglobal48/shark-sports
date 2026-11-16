import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { LOGO } from '../config.js'
import { useCatalog } from '../context/CatalogContext.jsx'
import { Marquee } from './motion.jsx'
import { INFO_LINKS } from '../content/links.js'

const LEGAL = ['/terms', '/privacy', '/cookies']

export default function Footer() {
  const { categories } = useCatalog()
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-line bg-coal">
      <div className="container-x grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <img src={LOGO} alt="Sharks" className="h-12 w-auto" />
          <p className="mt-6 max-w-sm text-mute">Hoodies, jerseys and training gear for people who don't ease off.</p>
          <Link to="/shop" className="group mt-8 inline-flex items-center gap-2 font-display text-3xl uppercase">
            <span className="link-sweep">Shop the range</span>
            <ArrowUpRight className="text-blaze transition-transform duration-500 ease-out-expo group-hover:rotate-45" />
          </Link>
        </div>

        <FooterCol title="Shop" className="md:col-span-2">
          <FooterLink to="/shop">All products</FooterLink>
          {categories.map((c) => (
            <FooterLink key={c.slug} to={`/shop/${c.slug}`}>
              {c.name}
            </FooterLink>
          ))}
        </FooterCol>

        <FooterCol title="Help" className="md:col-span-3">
          {INFO_LINKS.filter((l) => !LEGAL.includes(l.to)).map((l) => (
            <FooterLink key={l.to} to={l.to}>
              {l.label}
            </FooterLink>
          ))}
        </FooterCol>

        <FooterCol title="Account" className="md:col-span-2">
          <FooterLink to="/login">Log in</FooterLink>
          <FooterLink to="/register">Create account</FooterLink>
          <FooterLink to="/account">My account</FooterLink>
        </FooterCol>
      </div>

      <Marquee duration={40} className="border-y border-line py-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i} className="flex items-center font-display text-[13vw] uppercase leading-none md:text-[9vw]">
            <span className="text-outline-mute px-6">Shark Sports</span>
            <span className="text-blaze/20">✦</span>
          </span>
        ))}
      </Marquee>

      <div className="container-x flex flex-col justify-between gap-2 py-6 text-xs text-mute sm:flex-row">
        <span>© {new Date().getFullYear()} Shark Sports. All rights reserved.</span>
        <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-2">
          {INFO_LINKS.filter((l) => LEGAL.includes(l.to)).map((l) => (
            <Link key={l.to} to={l.to} className="transition-colors hover:text-bone">
              {l.label}
            </Link>
          ))}
          <span>Prices in GBP (£)</span>
        </nav>
      </div>
    </footer>
  )
}

function FooterCol({ title, children, className }) {
  return (
    <div className={className}>
      <h3 className="eyebrow mb-5">{title}</h3>
      <ul className="space-y-3">{children}</ul>
    </div>
  )
}

function FooterLink({ to, children }) {
  return (
    <li>
      <Link to={to} className="group inline-flex items-center gap-2 text-bone/80 transition-colors hover:text-bone">
        <span className="h-px w-0 bg-blaze transition-all duration-300 group-hover:w-4" />
        {children}
      </Link>
    </li>
  )
}
