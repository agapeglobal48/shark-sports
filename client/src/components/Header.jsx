import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronDown, Menu, Search, ShoppingCart, X } from 'lucide-react'
import { LOGO } from '../config.js'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useCatalog } from '../context/CatalogContext.jsx'
import { cx } from '../lib/format.js'
import SearchOverlay from './SearchOverlay.jsx'

const EASE = [0.16, 1, 0.3, 1]
const NAV_LINK = 'whitespace-nowrap text-[15px] font-medium text-bone/85 transition-colors hover:text-blaze aria-[current=page]:text-blaze'
const UTILITY_LINK = 'whitespace-nowrap transition-colors hover:text-blaze'
const MENU_LINKS = [
  { to: '/kit-designer', label: 'Kit Designer' },
  { to: '/club-shop', label: 'Club Shop' },
  { to: '/size-guide', label: 'Size' },
  { to: '/care', label: 'Care' },
  { to: '/contact', label: 'Help' },
]

export default function Header() {
  const { pathname } = useLocation()
  const { categories } = useCatalog()
  const { user, isAdmin } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [shopOpen, setShopOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  // Close the menus when the page changes.
  const [lastPath, setLastPath] = useState(pathname)
  if (lastPath !== pathname) {
    setLastPath(pathname)
    setMenuOpen(false)
    setShopOpen(false)
  }

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
  }, [menuOpen])

  return (
    <>
      {/* Utility bar */}
      <div className="relative z-50 border-b border-line bg-coal text-[13px] text-bone/85">
        <div className="container-x flex h-10 items-stretch justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/contact" className={UTILITY_LINK}>Need help?</Link>
            <span className="h-3.5 w-px bg-line" aria-hidden />
            <Link to="/delivery" className={UTILITY_LINK}>Delivery &amp; FAQ</Link>
          </div>

          <div className="flex items-stretch">
            {isAdmin && (
              <Link to="/admin" className={cx(UTILITY_LINK, 'hidden items-center pr-4 font-bold text-blaze sm:flex')}>
                Admin
              </Link>
            )}
            <Link to={user ? '/account' : '/login'} className={cx(UTILITY_LINK, 'hidden items-center pr-5 sm:flex')}>
              {user ? 'My account' : 'Log in / Register'}
            </Link>
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden w-14 items-center justify-center bg-blaze text-ink transition-colors hover:bg-blaze-dark lg:flex"
              aria-label="Search"
            >
              <Search size={17} strokeWidth={2.5} />
            </button>
            <CartButton />
          </div>
        </div>
      </div>

      {/* Logo and main navigation stay visible while scrolling */}
      <header className="sticky top-0 z-50 border-b border-line bg-ink">
        <div className="container-x flex h-16 items-center justify-between gap-6 md:h-20">
          <Link to="/" className="group flex shrink-0 items-center" aria-label="Mako Sports home">
            <img
              src={LOGO}
              alt="Mako Sports"
              className="h-10 w-auto transition-transform duration-500 ease-out-expo group-hover:scale-105 md:h-12"
            />
          </Link>

          <nav className="hidden items-center gap-5 lg:flex xl:gap-9" aria-label="Main">
            <ShopDropdown categories={categories} open={shopOpen} setOpen={setShopOpen} />
            {MENU_LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} className={NAV_LINK}>
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setSearchOpen(true)}
              className="grid h-10 w-11 place-items-center rounded-md bg-blaze text-ink transition-colors hover:bg-blaze-dark"
              aria-label="Search"
            >
              <Search size={18} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="grid h-10 w-11 place-items-center rounded-md border border-line transition-colors hover:bg-bone/10"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} categories={categories} user={user} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}

function CartButton() {
  const { count, setOpen, lastAdded } = useCart()
  return (
    <button
      onClick={() => setOpen(true)}
      className="flex items-center gap-1.5 bg-steel px-3 font-semibold text-bone transition-colors hover:bg-line"
      aria-label={`Cart, ${count} items`}
    >
      <motion.span
        key={lastAdded}
        animate={lastAdded ? { rotate: [0, -14, 10, -6, 0], scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.6 }}
        className="inline-flex text-blaze"
      >
        <ShoppingCart size={16} />
      </motion.span>
      <span><span className="hidden sm:inline">Cart: </span>{count}</span>
    </button>
  )
}

function ShopDropdown({ categories, open, setOpen }) {
  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setOpen(false)}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className={cx(NAV_LINK, 'flex items-center gap-1 py-2')}
        aria-expanded={open}
        aria-haspopup="true"
      >
        Sport
        <ChevronDown size={15} className={cx('transition-transform duration-300', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute left-0 top-full w-56 pt-3"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="overflow-hidden rounded-lg border border-line bg-coal py-2 shadow-2xl">
              <Link to="/shop" className="block px-4 py-2.5 text-sm font-bold text-blaze transition-colors hover:bg-bone/5">
                Shop all
              </Link>
              {categories.map((c) => (
                <Link key={c.slug} to={`/shop/${c.slug}`} className="block px-4 py-2.5 text-sm text-bone/85 transition-colors hover:bg-bone/5 hover:text-blaze">
                  {c.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function MobileMenu({ open, categories, user }) {
  const links = [{ to: '/shop', label: 'Sport' }, ...MENU_LINKS]
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-ink pt-28 lg:hidden"
          initial={{ clipPath: 'inset(0 0 100% 0)' }}
          animate={{ clipPath: 'inset(0 0 0% 0)' }}
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <motion.nav
            className="container-x flex flex-1 flex-col gap-1 py-6"
            initial="hidden"
            animate="show"
            transition={{ staggerChildren: 0.05, delayChildren: 0.25 }}
            aria-label="Mobile"
          >
            {links.map((l, i) => (
              <div key={l.to} className="overflow-hidden">
                <motion.div variants={{ hidden: { y: '100%' }, show: { y: 0 } }} transition={{ duration: 0.7, ease: EASE }}>
                  <NavLink to={l.to} end={l.to === '/shop'} className="group flex items-baseline gap-4 py-1 font-display text-4xl uppercase leading-tight sm:text-5xl">
                    <span className="font-sans text-xs font-bold text-blaze">0{i + 1}</span>
                    <span className="transition-transform duration-500 ease-out-expo group-hover:translate-x-3 group-aria-[current=page]:text-blaze">
                      {l.label}
                    </span>
                  </NavLink>
                </motion.div>
              </div>
            ))}
            <div className="mt-5 flex flex-wrap gap-2">
              {categories.map((c) => (
                <Link key={c.slug} to={`/shop/${c.slug}`} className="rounded-full border border-line px-4 py-2 text-xs font-bold uppercase tracking-widest text-bone/85 transition-colors hover:border-blaze hover:text-blaze">
                  {c.name}
                </Link>
              ))}
            </div>
          </motion.nav>
          <motion.div
            className="container-x flex items-center justify-between border-t border-line py-6 text-sm font-semibold uppercase tracking-widest"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.6 } }}
          >
            <Link to={user ? '/account' : '/login'}>{user ? `Hi, ${user.name.split(' ')[0]}` : 'Log in / Sign up'}</Link>
            <span className="text-mute">Mako Sports</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
