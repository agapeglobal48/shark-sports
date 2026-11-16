import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, X } from 'lucide-react'
import { useCatalog } from '../context/CatalogContext.jsx'

export default function SearchOverlay({ open, onClose }) {
  const [q, setQ] = useState('')
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const { categories } = useCatalog()

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const t = setTimeout(() => inputRef.current?.focus(), 150)
    return () => {
      window.removeEventListener('keydown', onKey)
      clearTimeout(t)
    }
  }, [open, onClose])

  function submit(e) {
    e.preventDefault()
    const term = q.trim()
    if (!term) return
    navigate(`/shop?search=${encodeURIComponent(term)}`)
    onClose()
    setQ('')
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[70]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-ink/70 backdrop-blur-md" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-label="Search"
            className="relative border-b border-line bg-coal"
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="container-x py-8 md:py-12">
              <div className="mb-6 flex items-center justify-between">
                <span className="eyebrow">Search</span>
                <button onClick={onClose} className="rounded-full p-2 transition hover:rotate-90 hover:bg-bone/10" aria-label="Close search">
                  <X size={22} />
                </button>
              </div>
              <form onSubmit={submit} className="group flex items-center gap-4 border-b-2 border-line pb-3 transition-colors focus-within:border-blaze">
                <input
                  ref={inputRef}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="What are you looking for?"
                  className="w-full bg-transparent font-display text-3xl uppercase tracking-wide outline-none placeholder:text-mute/40 md:text-5xl"
                  aria-label="Search products"
                />
                <button type="submit" className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-blaze text-ink transition-transform hover:scale-110" aria-label="Search">
                  <ArrowRight size={22} />
                </button>
              </form>
              <div className="mt-6 flex flex-wrap gap-2">
                {categories.map((c) => (
                  <button
                    key={c.slug}
                    onClick={() => {
                      navigate(`/shop/${c.slug}`)
                      onClose()
                    }}
                    className="rounded-full border border-line px-4 py-2 text-xs font-bold uppercase tracking-widest text-mute transition hover:border-blaze hover:text-bone"
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
