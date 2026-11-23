import { Link } from 'react-router-dom'
import InfoPage from '../components/InfoPage.jsx'
import { EmailLink } from '../components/Info.jsx'
import { BUSINESS } from '../content/business.js'
import { useSeo } from '../hooks/useSeo.js'

// Keep this table in sync with what the site actually stores.
const STORED = [
  { name: 'token', type: 'Cookie', purpose: 'Keeps you logged in to your account.', lasts: '7 days, or until you log out' },
  { name: 'shark-cart-v1', type: 'Local storage', purpose: 'Remembers what is in your bag.', lasts: 'Until you check out or clear your browser' },
  { name: 'shark-cookie-notice', type: 'Local storage', purpose: 'Remembers that you have seen our cookie notice.', lasts: 'Until you clear your browser' },
  { name: 'mako-kit-designs', type: 'Local storage', purpose: 'Keeps the kit designs you choose to save, including any logo you added.', lasts: 'Until you delete them or clear your browser' },
]

const sections = [
  {
    id: 'what',
    title: 'What cookies are',
    body: (
      <p>
        Cookies are small files a website saves in your browser. "Local storage" is similar: it lets a site remember things on your device. We use both,
        but only for things the site needs to work.
      </p>
    ),
  },
  {
    id: 'what-we-use',
    title: 'What we use',
    body: (
      <>
        <p>
          All of these are <strong>strictly necessary</strong>: without them you couldn't log in, keep items in your bag or pay. The law doesn't require
          us to ask before using them, but we want you to know what they are.
        </p>
        <div className="-mx-1 overflow-x-auto">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-widest text-mute">
                <th className="px-1 py-3 font-bold">Name</th>
                <th className="px-1 py-3 font-bold">Type</th>
                <th className="px-1 py-3 font-bold">What it's for</th>
                <th className="px-1 py-3 font-bold">How long</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {STORED.map((c) => (
                <tr key={c.name} className="transition-colors hover:bg-bone/[0.03]">
                  <td className="px-1 py-3 font-mono text-xs text-bone">{c.name}</td>
                  <td className="px-1 py-3">{c.type}</td>
                  <td className="px-1 py-3">{c.purpose}</td>
                  <td className="px-1 py-3">{c.lasts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          When you pay, you're taken to Stripe's secure checkout page. Stripe sets its own cookies there to process the payment and prevent fraud. They're
          covered by{' '}
          <a href="https://stripe.com/gb/legal/cookies-policy" target="_blank" rel="noreferrer">
            Stripe's cookie policy
          </a>
          .
        </p>
      </>
    ),
  },
  {
    id: 'what-we-dont',
    title: "What we don't use",
    body: <p>We don't use advertising cookies, tracking pixels or analytics that follow you around the web. If we ever add any, we'll ask for your permission first and update this page.</p>,
  },
  {
    id: 'control',
    title: 'Controlling cookies',
    body: (
      <p>
        You can block or delete cookies in your browser settings. If you block the ones above, you won't be able to log in or check out. To find out more,
        visit{' '}
        <a href="https://ico.org.uk/for-the-public/online/cookies/" target="_blank" rel="noreferrer">
          the ICO's guide to cookies
        </a>
        .
      </p>
    ),
  },
  {
    id: 'questions',
    title: 'Questions',
    body: (
      <p>
        Email <EmailLink />. How we handle your personal information is explained in our <Link to="/privacy">privacy policy</Link>.
      </p>
    ),
  },
]

export default function Cookies() {
  useSeo({ title: 'Cookie policy', description: 'The cookies Mako Sports uses and why.' })
  return (
    <InfoPage
      eyebrow="Legal"
      title="Cookie policy"
      intro="Short version: we only use what the site needs to work. No ad tracking."
      updated={BUSINESS.legalUpdated}
      sections={sections}
    />
  )
}
