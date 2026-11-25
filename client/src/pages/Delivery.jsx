import { motion } from 'motion/react'
import { Clock, MapPin, Truck } from 'lucide-react'
import InfoPage from '../components/InfoPage.jsx'
import { Info } from '../components/Info.jsx'
import FaqItem from '../components/FaqItem.jsx'
import { DELIVERY_FAQ } from '../content/faq.jsx'
import { api } from '../api/client.js'
import { useApi } from '../hooks/useApi.js'
import { useSeo } from '../hooks/useSeo.js'
import { formatPrice } from '../lib/format.js'

const EASE = [0.16, 1, 0.3, 1]

export default function Delivery() {
  useSeo({ title: 'Delivery & FAQ', description: 'UK delivery prices and times, and answers to common questions about ordering from Mako Sports.' })
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
          {DELIVERY_FAQ.map((item, i) => (
            <FaqItem key={item.q} item={item} defaultOpen={i === 0} />
          ))}
        </div>
      </section>
    </InfoPage>
  )
}

