import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Mail, Package, RotateCcw, Wallet } from 'lucide-react'
import InfoPage from '../components/InfoPage.jsx'
import { EmailLink, Info, ReturnsDays } from '../components/Info.jsx'
import { BUSINESS } from '../content/business.js'
import { useSeo } from '../hooks/useSeo.js'

const STEPS = [
  { icon: Mail, title: 'Tell us', text: 'Email us your order number and which items you are sending back.' },
  { icon: Package, title: 'Pack it up', text: 'Unworn, unwashed, tags on. Use the original packaging if you can.' },
  { icon: RotateCcw, title: 'Send it back', text: 'Post it to our returns address and keep your proof of postage.' },
  { icon: Wallet, title: 'Get refunded', text: 'Your money is back on your card within 14 days of us receiving it.' },
]

function ReturnPostage() {
  return (
    <Info k="returnPostage" placeholder="customer pays return postage / returns are free">
      {(who) =>
        who === 'free' ? (
          <>Returns are free. We'll send you a prepaid label.</>
        ) : (
          <>Return postage is paid by you, unless the item is faulty or we sent the wrong thing. We recommend a tracked service.</>
        )
      }
    </Info>
  )
}

const sections = [
  {
    id: 'window',
    title: 'How long you have',
    body: (
      <>
        <p>
          You have <strong><ReturnsDays /> days</strong> from the day your order arrives to send items back for a refund. You don't have to give a reason.
        </p>
        <p>Your legal right to cancel any online order within 14 days is explained in our <Link to="/terms#cancelling">terms of sale</Link>.</p>
      </>
    ),
  },
  {
    id: 'condition',
    title: 'What can be returned',
    body: (
      <ul>
        <li>Items must be unworn, unwashed and in the condition you received them, with tags attached.</li>
        <li>It's fine to try things on, just as you would in a shop.</li>
        <li>For hygiene reasons, socks can only be returned if they're still sealed in their packaging, unless they're faulty.</li>
        <li>If an item comes back worn or damaged, we may reduce your refund to cover the loss in value.</li>
      </ul>
    ),
  },
  {
    id: 'how',
    title: 'How to return',
    body: (
      <>
        <p>
          1. Email <EmailLink /> with your order number (it starts with <strong>SS-</strong>) and the items you're returning.
        </p>
        <p>
          2. Send the items to:{' '}
          {BUSINESS.returnsAddress ? <strong>{BUSINESS.returnsAddress}</strong> : <Info k="address" placeholder="returns address" />}
        </p>
        <p>
          3. <ReturnPostage />
        </p>
      </>
    ),
  },
  {
    id: 'refunds',
    title: 'Refunds',
    body: (
      <>
        <p>
          We refund you within 14 days of receiving your return, to the card or wallet you paid with. We'll email you when it's done. Banks can take a few
          more days to show it.
        </p>
        <p>If you send back your whole order, we also refund the standard delivery charge you paid.</p>
      </>
    ),
  },
  {
    id: 'exchanges',
    title: 'Exchanges',
    body: <p>Need a different size or colour? The quickest way is to return the item for a refund and place a new order, so you don't miss out if stock runs low.</p>,
  },
  {
    id: 'faulty',
    title: 'Faulty or wrong items',
    body: (
      <p>
        Sorry about that. Email <EmailLink /> within 30 days of delivery with your order number and a photo, and we'll arrange a full refund, repair or
        replacement. We cover the postage. Your full rights are explained in our <Link to="/terms#faulty">terms of sale</Link>.
      </p>
    ),
  },
]

export default function Returns() {
  useSeo({ title: 'Returns & refunds', description: 'How to return an order to Mako Sports and get your money back.' })
  return (
    <InfoPage eyebrow="Help" title={['Returns', <span key="r" className="text-blaze">& refunds</span>]} intro="Not quite right? Send it back. Here's how." sections={sections}
      top={
      <div className="mb-14 grid gap-3 sm:grid-cols-2" aria-label="Return steps">
        {STEPS.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ delay: i * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -6 }}
            className="group rounded-2xl border border-line bg-coal p-6 transition-colors duration-300 hover:border-blaze/60"
          >
            <div className="flex items-center justify-between">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-blaze/10 text-blaze transition-all duration-500 group-hover:rotate-[-12deg] group-hover:bg-blaze group-hover:text-ink">
                <s.icon size={22} />
              </span>
              <span className="font-display text-5xl text-line transition-colors duration-500 group-hover:text-blaze/40">{i + 1}</span>
            </div>
            <p className="mt-5 font-display text-2xl uppercase">{s.title}</p>
            <p className="mt-1 text-sm text-mute">{s.text}</p>
          </motion.div>
        ))}
      </div>
      }
    />
  )
}
