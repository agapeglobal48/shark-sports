import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { Menu, Search, ShoppingBag, User, X } from 'lucide-react'
import { LOGO } from '../config.js'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useCatalog } from '../context/CatalogContext.jsx'
import { cx } from '../lib/format.js'
import SearchOverlay from './SearchOverlay.jsx'

const EASE = [0.16, 1, 0.3, 1]

export default function Header() {
  const { pathname } = useLocation()
  const { categories } = useCatalog()
  const { count, setOpen, lastAdded } = useCart()
  const { user, isAdmin } = useAuth()
  const { scrollY } = useScroll()
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  // Hide when scrolling down, show when scrolling up.
  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0
    setHidden(y > prev && y > 240 && !menuOpen)
    setScrolled(y > 30)
  })

  // Close the mobile menu when the page changes.
  const [lastPath, setLastPath] = useState(pathname)
  if (lastPath !== pathname) {
    setLastPath(pathname)
    setMenuOpen(false)
  }

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
  }, [menuOpen])

  const overHero = pathname === '/' && !scrolled && !menuOpen

  return (
    <>
      <motion.header
        className={cx(
          'fixed inset-x-0 top-0 z-50 transition-colors duration-500',
          overHero ? 'bg-transparent' : 'border-b border-line/60 bg-ink/80 backdrop-blur-xl',
        )}
        animate={{ y: hidden ? '-100%' : '0%' }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <div className="container-x flex h-16 items-center justify-between gap-6 md:h-20">
          <button className="-ml-2 p-2 lg:hidden" onClick={() => setMenuOpen((o) => !o)} aria-label={menuOpen ? 'Close menu' : 'Open menu'}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <Link to="/" className="group flex shrink-0 items-center" aria-label="Shark Sports home">
            <img
              src={LOGO}
              alt="Sharks"
              className="h-9 w-auto transition-transform duration-500 ease-out-expo group-hover:-rotate-3 group-hover:scale-105 md:h-11"
            />
          </Link>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
            <NavLink to="/shop" end className="link-sweep text-[13px] font-bold uppercase tracking-[0.16em]">
              Shop all
            </NavLink>
            {categories.map((c) => (
              <NavLink key={c.slug} to={`/shop/${c.slug}`} className="link-sweep text-[13px] font-bold uppercase tracking-[0.16em] text-bone/80 transition-colors hover:text-bone">
                {c.name}
              </NavLink>
            ))}
          </nav>

          <div className="-mr-2 flex items-center gap-1">
            {isAdmin && (
              <Link
                to="/admin"
                className="mr-1 hidden rounded-full border border-blaze/50 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-blaze transition-colors hover:bg-blaze hover:text-ink sm:inline-block"
              >
                Admin
              </Link>
            )}
            <IconButton label="Search" onClick={() => setSearchOpen(true)}>
              <Search size={21} />
            </IconButton>
            <IconButton label={user ? 'My account' : 'Log in'} to={user ? '/account' : '/login'} className="hidden sm:inline-flex">
              <User size={21} />
            </IconButton>
            <IconButton label={`Bag, ${count} items`} onClick={() => setOpen(true)}>
              <motion.span key={lastAdded} animate={lastAdded ? { rotate: [0, -14, 10, -6, 0], scale: [1, 1.2, 1] } : {}} transition={{ duration: 0.6 }} className="inline-flex">
                <ShoppingBag size={21} />
              </motion.span>
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-blaze px-1 text-[10px] font-extrabold text-ink"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </IconButton>
          </div>
        </div>
      </motion.header>

      <MobileMenu open={menuOpen} categories={categories} user={user} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}

function IconButton({ children, label, onClick, to, className }) {
  const cls = cx(
    'relative inline-flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 hover:bg-bone/10 active:scale-90',
    className,
  )
  return to ? (
    <Link to={to} className={cls} aria-label={label}>
      {children}
    </Link>
  ) : (
    <button className={cls} onClick={onClick} aria-label={label}>
      {children}
    </button>
  )
}

function MobileMenu({ open, categories, user }) {
  const links = [
    { to: '/shop', label: 'Shop all' },
    ...categories.map((c) => ({ to: `/shop/${c.slug}`, label: c.name })),
  ]
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-40 flex flex-col bg-ink pt-20 lg:hidden"
          initial={{ clipPath: 'inset(0 0 100% 0)' }}
          animate={{ clipPath: 'inset(0 0 0% 0)' }}
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <motion.nav
            className="container-x flex flex-1 flex-col justify-center gap-1"
            initial="hidden"
            animate="show"
            transition={{ staggerChildren: 0.05, delayChildren: 0.25 }}
            aria-label="Mobile"
          >
            {links.map((l, i) => (
              <div key={l.to} className="overflow-hidden">
                <motion.div variants={{ hidden: { y: '100%' }, show: { y: 0 } }} transition={{ duration: 0.7, ease: EASE }}>
                  <NavLink to={l.to} end={l.to === '/shop'} className="group flex items-baseline gap-4 py-1 font-display text-5xl uppercase leading-tight sm:text-6xl">
                    <span className="font-sans text-xs font-bold text-blaze">0{i + 1}</span>
                    <span className="transition-transform duration-500 ease-out-expo group-hover:translate-x-3 group-aria-[current=page]:text-blaze">
                      {l.label}
                    </span>
                  </NavLink>
                </motion.div>
              </div>
            ))}
          </motion.nav>
          <motion.div
            className="container-x flex items-center justify-between border-t border-line py-6 text-sm font-semibold uppercase tracking-widest"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.6 } }}
          >
            <Link to={user ? '/account' : '/login'}>{user ? `Hi, ${user.name.split(' ')[0]}` : 'Log in / Sign up'}</Link>
            <span className="text-mute">Shark Sports</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
