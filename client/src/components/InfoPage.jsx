import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { cx } from '../lib/format.js'
import { Reveal, SplitLines } from './motion.jsx'
import { INFO_LINKS } from '../content/links.js'

const EASE = [0.16, 1, 0.3, 1]


/**
 * Shared layout for the help and legal pages.
 * sections: [{ id, title, body }]. Desktop gets a sticky contents list that
 * highlights the section you're reading.
 */
export default function InfoPage({ eyebrow, title, intro, updated, sections, top, children }) {
  const [active, setActive] = useState(sections?.[0]?.id)

  useEffect(() => {
    if (!sections?.length) return
    const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean)
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-20% 0px -65% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [sections])

  return (
    <div className="pb-10">
      <header className="relative overflow-hidden border-b border-line pb-14 pt-32 md:pb-20 md:pt-44">
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-blaze/10 blur-3xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="container-x relative">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="eyebrow mb-4">
            {eyebrow}
          </motion.p>
          <h1 className="font-display text-[15vw] uppercase leading-[0.88] sm:text-8xl lg:text-[8.5rem]">
            <SplitLines lines={Array.isArray(title) ? title : [title]} />
          </h1>
          {intro && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.8, ease: EASE }}
              className="mt-6 max-w-2xl text-lg text-bone/75"
            >
              {intro}
            </motion.p>
          )}
          {updated && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-6 text-xs font-bold uppercase tracking-widest text-mute">
              Last updated {updated}
            </motion.p>
          )}
        </div>
      </header>

      <div className="container-x mt-12 grid gap-12 md:mt-16 lg:grid-cols-12">
        {sections?.length > 0 && (
          <aside className="hidden lg:col-span-3 lg:block">
            <nav className="sticky top-28" aria-label="On this page">
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-mute">On this page</p>
              <ul className="space-y-1 border-l border-line">
                {sections.map((s) => (
                  <li key={s.id} className="relative">
                    {active === s.id && <motion.span layoutId="toc-bar" className="absolute -left-px top-0 h-full w-0.5 bg-blaze" transition={{ type: 'spring', stiffness: 400, damping: 35 }} />}
                    <a
                      href={`#${s.id}`}
                      className={cx('block py-1.5 pl-4 text-sm transition-all duration-300 hover:translate-x-1 hover:text-bone', active === s.id ? 'font-bold text-bone' : 'text-mute')}
                    >
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        )}

        <div className={cx('min-w-0', sections?.length ? 'lg:col-span-8 lg:col-start-5' : 'lg:col-span-12')}>
          {top}
          {sections?.map((s, i) => (
            <Reveal key={s.id} y={24} delay={i < 2 ? 0.1 * i : 0}>
              <section id={s.id} className="scroll-mt-28 border-b border-line py-10 first:pt-0 last:border-0">
                <h2 className="mb-5 flex items-baseline gap-4 font-display text-3xl uppercase md:text-4xl">
                  <span className="font-sans text-sm font-bold text-blaze">{String(i + 1).padStart(2, '0')}</span>
                  {s.title}
                </h2>
                <div className="prose-info">{s.body}</div>
              </section>
            </Reveal>
          ))}
          {children}
        </div>
      </div>

      <MoreHelp />
    </div>
  )
}

function MoreHelp() {
  return (
    <section className="container-x mt-20">
      <p className="eyebrow mb-6">More help</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {INFO_LINKS.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-line bg-coal px-6 py-5 transition-colors duration-500 hover:border-blaze"
          >
            <span className="absolute inset-0 origin-bottom scale-y-0 bg-blaze transition-transform duration-500 ease-out-expo group-hover:scale-y-100" />
            <span className="relative font-display text-2xl uppercase transition-colors duration-500 group-hover:text-ink">{l.label}</span>
            <ArrowUpRight className="relative text-blaze transition-all duration-500 group-hover:rotate-45 group-hover:text-ink" />
          </Link>
        ))}
      </div>
    </section>
  )
}
