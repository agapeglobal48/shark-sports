import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import Header from './Header.jsx'
import Footer from './Footer.jsx'
import CartDrawer from './CartDrawer.jsx'
import CookieNotice from './CookieNotice.jsx'

export default function Layout() {
  const { pathname } = useLocation()

  // Start each new page at the top.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  return (
    <div className="grain flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-blaze focus:px-4 focus:py-2 focus:text-ink">
        Skip to content
      </a>
      <Header />
      <motion.main
        id="main"
        key={pathname}
        className="flex-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Outlet />
      </motion.main>
      <Footer />
      <CartDrawer />
      <CookieNotice />
    </div>
  )
}
