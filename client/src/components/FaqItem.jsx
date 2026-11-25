import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Plus } from 'lucide-react'
import { cx } from '../lib/format.js'

const EASE = [0.16, 1, 0.3, 1]

/** One expandable question. item: { q, a } for a one-paragraph answer, or { q, body } for richer content. */
export default function FaqItem({ item, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-line">
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="group flex w-full items-center justify-between gap-6 py-6 text-left">
        <span className={cx('text-lg font-bold transition-all duration-300 group-hover:translate-x-2 md:text-xl', open ? 'text-blaze' : 'group-hover:text-blaze')}>{item.q}</span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className={cx('grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-colors duration-300', open ? 'border-blaze bg-blaze text-ink' : 'border-line group-hover:border-blaze')}
        >
          <Plus size={18} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: EASE }} className="overflow-hidden">
            <div className="prose-info max-w-2xl pb-6">{item.body ?? <p>{item.a}</p>}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
