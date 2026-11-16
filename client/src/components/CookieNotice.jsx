import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Cookie } from 'lucide-react'

const KEY = 'shark-cookie-notice'

function seen() {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

// We only use strictly necessary storage, so this is a notice, not a consent form.
// If marketing or analytics cookies are ever added, this must become an opt-in.
export default function CookieNotice() {
  const [show, setShow] = useState(() => !seen())

  function dismiss() {
    try {
      localStorage.setItem(KEY, '1')
    } catch {
      /* private mode: just hide it for this visit */
    }
    setShow(false)
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          role="region"
          aria-label="Cookie notice"
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ delay: 1.2, type: 'spring', stiffness: 200, damping: 24 }}
          className="fixed inset-x-3 bottom-3 z-50 sm:inset-x-auto sm:bottom-6 sm:left-6 sm:max-w-sm"
        >
          <div className="rounded-2xl border border-line bg-coal/95 p-5 shadow-2xl shadow-black/60 backdrop-blur-md">
            <div className="flex gap-4">
              <motion.span
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blaze/15 text-blaze"
                animate={{ rotate: [0, -12, 12, 0] }}
                transition={{ delay: 1.8, duration: 0.8 }}
              >
                <Cookie size={20} />
              </motion.span>
              <p className="text-sm text-bone/80">
                We only use cookies that keep the site working, like your login and your bag. No ad tracking.{' '}
                <Link to="/cookies" className="font-bold text-bone underline decoration-blaze underline-offset-4 hover:text-blaze">
                  Cookie policy
                </Link>
              </p>
            </div>
            <button onClick={dismiss} className="btn btn-primary mt-4 w-full !py-2.5">
              <span>Got it</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
