import { Link } from 'react-router-dom'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { EmailLink, Info } from './Info.jsx'
import { BUSINESS } from '../content/business.js'

/** Contact details box. Phone and hours only show once they're filled in. */
export default function ContactCard({ eyebrow = 'Need more help?', title = 'Contact us', text = "Get in touch and we'll help." }) {
  const rows = [
    { icon: Mail, label: 'Email', value: <EmailLink /> },
    BUSINESS.phone && { icon: Phone, label: 'Phone', value: BUSINESS.phone },
    { icon: MapPin, label: 'Address', value: <Info k="address" placeholder="business address" /> },
    BUSINESS.hours && { icon: Clock, label: 'Opening hours', value: BUSINESS.hours },
  ].filter(Boolean)

  return (
    <section className="mt-12 rounded-3xl border border-line bg-coal p-8 md:p-10" aria-labelledby="contact-card">
      <p className="eyebrow mb-3">{eyebrow}</p>
      <h2 id="contact-card" className="font-display text-4xl uppercase">{title}</h2>
      <p className="mt-3 text-bone/75">{text}</p>
      <dl className="mt-6 grid gap-3 sm:grid-cols-2">
        {rows.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex gap-3 rounded-xl border border-line bg-ink p-4">
            <Icon size={20} className="mt-0.5 shrink-0 text-blaze" />
            <div className="min-w-0">
              <dt className="text-xs font-bold uppercase tracking-widest text-mute">{label}</dt>
              <dd className="mt-1 break-words">{value}</dd>
            </div>
          </div>
        ))}
      </dl>
      <Link to="/contact" className="btn btn-ghost mt-6">
        <span>Contact page</span>
      </Link>
    </section>
  )
}
