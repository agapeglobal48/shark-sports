import { useEffect, useState } from 'react'
import { Link, Navigate, NavLink, Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ExternalLink, LayoutDashboard, LogOut, Menu, Package, ShoppingCart, Tags, X } from 'lucide-react'
import { LOGO } from '../config.js'
import { useAuth } from '../context/AuthContext.jsx'
import { cx } from '../lib/format.js'
import { ConfirmProvider, Spinner, ToastProvider } from './ui.jsx'

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories & brands', icon: Tags },
]

export default function AdminLayout() {
  const { user, ready, isAdmin, logout } = useAuth()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.title = 'Admin | Shark Sports'
  }, [])

  const [lastPath, setLastPath] = useState(pathname)
  if (lastPath !== pathname) {
    setLastPath(pathname)
    setOpen(false)
  }

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-ink">
        <Spinner />
      </div>
    )
  }
  if (!user) return <Navigate to="/login" state={{ from: pathname }} replace />
  if (!isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-ink px-4 text-center text-bone">
        <div>
          <p className="font-display text-5xl uppercase">Admins only</p>
          <p className="mt-2 text-mute">Your account doesn't have access to the admin panel.</p>
          <Link to="/" className="btn btn-primary mt-6">
            <span>Back to the store</span>
          </Link>
        </div>
      </div>
    )
  }

  const nav = (
    <nav className="flex flex-col gap-1" aria-label="Admin">
      {NAV.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cx(
              'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors',
              isActive ? 'text-ink' : 'text-bone/70 hover:bg-bone/5 hover:text-bone',
            )
          }
        >
          {({ isActive }) => (
            <>
              {isActive && <motion.span layoutId="admin-nav" className="absolute inset-0 rounded-xl bg-blaze" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
              <Icon size={18} className="relative" />
              <span className="relative">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )

  const footer = (
    <div className="space-y-1 border-t border-line pt-4">
      <Link to="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-bone/70 hover:bg-bone/5 hover:text-bone">
        <ExternalLink size={18} /> View store
      </Link>
      <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-bone/70 hover:bg-bone/5 hover:text-bone">
        <LogOut size={18} /> Log out
      </button>
      <p className="truncate px-3 pt-2 text-xs text-mute">{user.email}</p>
    </div>
  )

  return (
    <ToastProvider>
      <ConfirmProvider>
        <div className="min-h-screen bg-ink text-bone">
          {/* Desktop sidebar */}
          <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-line bg-coal p-5 lg:flex">
            <Link to="/admin" className="mb-8 flex items-center gap-3 px-1">
              <img src={LOGO} alt="Sharks" className="h-8" />
              <span className="rounded-md bg-blaze/15 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-blaze">Admin</span>
            </Link>
            <div className="flex-1">{nav}</div>
            {footer}
          </aside>

          {/* Mobile top bar */}
          <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-coal/95 px-4 backdrop-blur lg:hidden">
            <Link to="/admin" className="flex items-center gap-2">
              <img src={LOGO} alt="Sharks" className="h-7" />
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-blaze">Admin</span>
            </Link>
            <button onClick={() => setOpen((o) => !o)} className="rounded-lg p-2 hover:bg-bone/10" aria-label={open ? 'Close menu' : 'Open menu'}>
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </header>
          <AnimatePresence>
            {open && (
              <motion.div
                className="fixed inset-x-0 top-14 z-30 border-b border-line bg-coal p-4 lg:hidden"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {nav}
                <div className="mt-4">{footer}</div>
              </motion.div>
            )}
          </AnimatePresence>

          <main className="px-4 py-8 sm:px-6 lg:ml-64 lg:px-10 lg:py-10">
            <div className="mx-auto max-w-6xl">
              <Outlet />
            </div>
          </main>
        </div>
      </ConfirmProvider>
    </ToastProvider>
  )
}
