import { Link } from 'react-router-dom'
import InfoPage from '../components/InfoPage.jsx'
import { EmailLink, Info, LegalIdentity } from '../components/Info.jsx'
import { BUSINESS } from '../content/business.js'
import { useSeo } from '../hooks/useSeo.js'

// Template written for a small UK online shop (UK GDPR / Data Protection Act 2018).
// Have it checked against how you actually run the business before launch.

const sections = [
  {
    id: 'who-we-are',
    title: 'Who we are',
    body: (
      <>
        <p>
          <LegalIdentity />
        </p>
        <p>
          We're the "controller" of the personal information described here, which means we decide how it's used. If you have any questions about this
          policy or your information, email us at <EmailLink />.
        </p>
      </>
    ),
  },
  {
    id: 'what-we-collect',
    title: 'What we collect',
    body: (
      <>
        <ul>
          <li>
            <strong>When you order:</strong> your name, email address, delivery address, phone number and what you bought.
          </li>
          <li>
            <strong>When you create an account:</strong> your name, email address and a password. We only store a scrambled (hashed) version of your
            password and can never see it.
          </li>
          <li>
            <strong>Payment details:</strong> card and wallet payments are handled by Stripe. Your card number goes straight to Stripe and never touches our
            servers. We only see things like the last four digits and whether the payment succeeded.
          </li>
          <li>
            <strong>When you contact us:</strong> whatever you choose to tell us in your message.
          </li>
          <li>
            <strong>Technical information:</strong> our servers keep short-lived logs (such as IP address and pages requested) to keep the site secure and
            fix problems.
          </li>
        </ul>
        <p>We don't use advertising trackers, and we don't sell your information to anyone.</p>
      </>
    ),
  },
  {
    id: 'how-we-use-it',
    title: 'How we use it and why',
    body: (
      <>
        <p>The law requires us to have a reason (a "lawful basis") for using your information. Ours are:</p>
        <ul>
          <li>
            <strong>To fulfil your order</strong> (taking payment, delivering it, handling returns and refunds): needed to carry out our contract with you.
          </li>
          <li>
            <strong>To run your account</strong> and show your order history: needed to provide the service you signed up for.
          </li>
          <li>
            <strong>To keep financial records</strong> for tax and accounting: a legal obligation.
          </li>
          <li>
            <strong>To keep the site secure</strong>, prevent fraud and fix problems: our legitimate interest in running a safe shop.
          </li>
          <li>
            <strong>To answer your questions</strong>: our legitimate interest in helping our customers.
          </li>
        </ul>
        <p>We'll only send you marketing emails if you've asked us to, and every one will have a link to unsubscribe.</p>
      </>
    ),
  },
  {
    id: 'who-we-share-with',
    title: 'Who we share it with',
    body: (
      <>
        <p>We only share your information with companies that help us run the shop, and only what they need:</p>
        <ul>
          <li>
            <strong>Stripe</strong>: takes payments and helps prevent fraud.
          </li>
          <li>
            <strong>Our delivery partner</strong> (<Info k="courier" placeholder="courier name" />): your name, address and phone number, to deliver your parcel.
          </li>
          <li>
            <strong>Supabase</strong>: hosts our database.
          </li>
          <li>
            <strong>Our website hosting providers</strong>: run the website and its servers.
          </li>
          <li>
            <strong>Cloudinary</strong>: stores our product photos and videos. It doesn't receive your personal information.
          </li>
        </ul>
        <p>We may also share information if the law requires it, for example with HMRC or the police.</p>
      </>
    ),
  },
  {
    id: 'international',
    title: 'Storage outside the UK',
    body: (
      <p>
        Some of our providers store information outside the UK. Our database is hosted in Australia, and Stripe processes payments in the United States
        and elsewhere. When information leaves the UK, we make sure it's protected by safeguards approved under UK data protection law, such as the
        International Data Transfer Agreement or the UK Addendum to the EU Standard Contractual Clauses.
      </p>
    ),
  },
  {
    id: 'how-long',
    title: 'How long we keep it',
    body: (
      <ul>
        <li>
          <strong>Order records:</strong> 6 years after the order, because tax law requires it.
        </li>
        <li>
          <strong>Your account:</strong> until you ask us to delete it. Orders you placed stay in our records for the 6 years above.
        </li>
        <li>
          <strong>Messages you send us:</strong> up to 2 years after we last hear from you.
        </li>
        <li>
          <strong>Server logs:</strong> up to 30 days.
        </li>
      </ul>
    ),
  },
  {
    id: 'your-rights',
    title: 'Your rights',
    body: (
      <>
        <p>You have the right to:</p>
        <ul>
          <li>get a copy of the information we hold about you</li>
          <li>have anything wrong corrected</li>
          <li>have your information deleted (unless we have to keep it by law)</li>
          <li>object to, or ask us to limit, how we use it</li>
          <li>receive your information in a format you can take elsewhere</li>
        </ul>
        <p>
          To use any of these rights, email <EmailLink />. We'll reply within one month. It's free.
        </p>
        <p>
          If you're unhappy with how we've handled your information, please tell us first so we can put it right. You can also complain to the
          Information Commissioner's Office (ICO) at{' '}
          <a href="https://ico.org.uk/make-a-complaint/" target="_blank" rel="noreferrer">
            ico.org.uk
          </a>{' '}
          or on 0303 123 1113.
        </p>
      </>
    ),
  },
  {
    id: 'cookies',
    title: 'Cookies',
    body: (
      <p>
        We only use cookies and similar storage that the site needs to work, like keeping you logged in and remembering your bag. There's more detail in
        our <Link to="/cookies">cookie policy</Link>.
      </p>
    ),
  },
  {
    id: 'security',
    title: 'Keeping it safe',
    body: (
      <p>
        Everything is sent over an encrypted (HTTPS) connection, passwords are stored hashed, and only people who need it to run the shop can see your
        information. No system is perfectly secure, but if something ever goes wrong that affects you, we'll tell you and the ICO as the law requires.
      </p>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to this policy',
    body: <p>If we change this policy, we'll update it here and change the date at the top. If the changes are big, we'll let account holders know by email.</p>,
  },
]

export default function Privacy() {
  useSeo({ title: 'Privacy policy', description: 'How Mako Sports collects, uses and protects your personal information.' })
  return (
    <InfoPage
      eyebrow="Legal"
      title="Privacy policy"
      intro="What we collect when you shop with us, why we need it, and the control you have over it. In plain English."
      updated={BUSINESS.legalUpdated}
      sections={sections}
    />
  )
}
