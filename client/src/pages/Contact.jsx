import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowUpRight, Check, Clock, Copy, MapPin, Phone } from 'lucide-react'
import InfoPage from '../components/InfoPage.jsx'
import { Info } from '../components/Info.jsx'
import { BUSINESS } from '../content/business.js'
import { useSeo } from '../hooks/useSeo.js'

const EASE = [0.16, 1, 0.3, 1]

export default function Contact() {
  useSeo({ title: 'Contact us', description: 'Get in touch with Mako Sports about an order, sizing, returns or anything else.' })
  const [copied, setCopied] = useState(false)

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(BUSINESS.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard blocked: the mailto link still works */
    }
  }

  return (
    <InfoPage eyebrow="Help" title={['Get in', <span key="t" className="text-blaze">touch</span>]} intro="Questions about an order, sizing or anything else? We're real people and we read every message.">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8, ease: EASE }}
        className="group relative overflow-hidden rounded-3xl border border-line bg-coal p-8 md:p-12"
      >
        <span className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-blaze/20 blur-3xl transition-transform duration-1000 group-hover:scale-150" />
        <p className="eyebrow mb-4">Email us</p>
        <div className="relative flex flex-wrap items-center gap-4">
          <Info k="email" placeholder="contact email">
            {(email) => (
              <a href={`mailto:${email}`} className="group/link inline-flex items-center gap-3 break-all font-display text-4xl uppercase md:text-6xl">
                <span className="link-sweep">{email}</span>
                <ArrowUpRight className="shrink-0 text-blaze transition-transform duration-500 group-hover/link:rotate-45" size={40} />
              </a>
            )}
          </Info>
          {BUSINESS.email && (
            <button onClick={copyEmail} className="btn btn-ghost !px-4 !py-2.5" aria-label="Copy email address">
              <span className="flex items-center gap-2">
                {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copied' : 'Copy'}
              </span>
            </button>
          )}
        </div>
        <p className="relative mt-6 max-w-xl text-mute">
          We aim to reply within one working day. If it's about an order, please include your order number (it starts with <strong className="text-bone">SS-</strong>).
        </p>
      </motion.div>

      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <Detail icon={Clock} label="Hours" delay={0.4}>
          <Info k="hours" placeholder="opening hours" />
        </Detail>
        <Detail icon={Phone} label="Phone" delay={0.5}>
          <Info k="phone" placeholder="phone number (optional)">
            {(phone) => (
              <a href={`tel:${phone.replace(/\s/g, '')}`} className="hover:text-blaze">
                {phone}
              </a>
            )}
          </Info>
        </Detail>
        <Detail icon={MapPin} label="Address" delay={0.6}>
          <Info k="address" placeholder="business address" />
        </Detail>
      </div>

      <div className="mt-12 grid gap-3 sm:grid-cols-2">
        <QuickLink to="/delivery" title="Where's my order?" text="Delivery times, prices and common questions." />
        <QuickLink to="/returns" title="Returning something?" text="How to send items back and get refunded." />
      </div>
    </InfoPage>
  )
}

function Detail({ icon: Icon, label, delay, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.7, ease: EASE }}
      whileHover={{ y: -4 }}
      className="rounded-2xl border border-line bg-coal p-6 transition-colors duration-300 hover:border-bone/30"
    >
      <Icon size={20} className="text-blaze" />
      <p className="mt-4 text-xs font-bold uppercase tracking-widest text-mute">{label}</p>
      <p className="mt-1 font-bold">{children}</p>
    </motion.div>
  )
}

function QuickLink({ to, title, text }) {
  return (
    <Link to={to} className="group flex items-center justify-between gap-4 rounded-2xl border border-line p-6 transition-colors duration-300 hover:border-blaze hover:bg-blaze/5">
      <span>
        <span className="block font-display text-2xl uppercase">
          {title}
        </span>
        <span className="mt-1 block text-sm text-mute">{text}</span>
      </span>
      <ArrowUpRight className="shrink-0 text-blaze transition-transform duration-500 group-hover:rotate-45" />
    </Link>
  )
}
