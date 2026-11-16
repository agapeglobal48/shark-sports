import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Clock, MapPin, Plus, Truck } from 'lucide-react'
import InfoPage from '../components/InfoPage.jsx'
import { EmailLink, Info, ReturnsDays } from '../components/Info.jsx'
import { api } from '../api/client.js'
import { useApi } from '../hooks/useApi.js'
import { useSeo } from '../hooks/useSeo.js'
import { cx, formatPrice } from '../lib/format.js'

const EASE = [0.16, 1, 0.3, 1]

const FAQ = [
  {
    q: 'Do I need an account to order?',
    a: (
      <>
        No. You can check out as a guest. If you <Link to="/register">create an account</Link>, you can see all your orders in one place.
      </>
    ),
  },
  {
    q: 'How do I know which size to choose?',
    a: (
      <>
        Each product page lists the sizes available. If you're between sizes, we'd suggest going up one. Still not sure? Email <EmailLink /> and we'll help.
      </>
    ),
  },
  {
    q: 'Can I change or cancel my order?',
    a: (
      <>
        Email <EmailLink /> as soon as possible with your order number. If it hasn't been sent yet, we'll change or cancel it. If it's already on its way,
        you can return it once it arrives.
      </>
    ),
  },
  {
    q: 'How do I return something?',
    a: (
      <>
        You have <ReturnsDays /> days from delivery. Everything you need is on our <Link to="/returns">returns page</Link>.
      </>
    ),
  },
  {
    q: 'Which payment methods do you accept?',
    a: 'Visa, Mastercard, American Express, Apple Pay and Google Pay. Payments are processed securely by Stripe, and we never see your card number.',
  },
  {
    q: 'Do you deliver outside the UK?',
    a: "Not yet. We currently deliver to UK addresses only, including Northern Ireland, the Highlands and islands.",
  },
  {
    q: 'My order arrived damaged or with the wrong item.',
    a: (
      <>
        Sorry about that. Email <EmailLink /> with your order number and a photo, and we'll put it right at no cost to you.
      </>
    ),
  },
]

export default function Delivery() {
  useSeo({ title: 'Delivery & FAQ', description: 'UK delivery prices and times, and answers to common questions about ordering from Shark Sports.' })
  const { data: config } = useApi(api.checkoutConfig, 'checkout-config')
  const standard = config?.standardShippingPence ?? 399
  const freeOver = config?.freeShippingOverPence ?? 5000

  const cards = [
    { icon: Truck, label: 'Standard UK delivery', value: formatPrice(standard), note: `Free on orders over ${formatPrice(freeOver).replace('.00', '')}` },
    { icon: Clock, label: 'Dispatched within', value: <Info k="dispatchTime" placeholder="dispatch time" />, note: 'Monday to Friday, excluding bank holidays' },
    { icon: MapPin, label: 'Delivered in', value: <Info k="deliveryTime" placeholder="delivery time" />, note: <>Sent with <Info k="courier" placeholder="courier" /></> },
  ]

  return (
    <InfoPage
      eyebrow="Help"
      title={['Delivery', <span key="f" className="text-blaze">& FAQ</span>]}
      intro={`Free UK delivery on orders over ${formatPrice(freeOver).replace('.00', '')}. Everything else you might want to know is below.`}
      top={
        <div className="mb-16 grid gap-3 md:grid-cols-3">
          {cards.map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.8, ease: EASE }}
              whileHover={{ y: -6 }}
              className="group relative overflow-hidden rounded-2xl border border-line bg-coal p-6 transition-colors duration-300 hover:border-blaze/60"
            >
              <c.icon className="text-blaze transition-transform duration-500 group-hover:translate-x-2" />
              <p className="mt-6 text-xs font-bold uppercase tracking-widest text-mute">{c.label}</p>
              <p className="mt-1 font-display text-3xl uppercase">{c.value}</p>
              <p className="mt-2 text-sm text-mute">{c.note}</p>
            </motion.div>
          ))}
        </div>
      }
    >
      <section id="faq" className="scroll-mt-28">
        <p className="eyebrow mb-4">FAQ</p>
        <h2 className="mb-8 font-display text-5xl uppercase md:text-6xl">Good questions</h2>
        <div className="border-t border-line">
          {FAQ.map((item, i) => (
            <FaqItem key={item.q} item={item} defaultOpen={i === 0} />
          ))}
        </div>
      </section>
    </InfoPage>
  )
}

function FaqItem({ item, defaultOpen }) {
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
            <div className="prose-info max-w-2xl pb-6">
              <p>{item.a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
