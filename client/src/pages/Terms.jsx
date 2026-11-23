import { Link } from 'react-router-dom'
import InfoPage from '../components/InfoPage.jsx'
import { EmailLink, Info, LegalIdentity, ReturnsDays } from '../components/Info.jsx'
import { BUSINESS } from '../content/business.js'
import { useSeo } from '../hooks/useSeo.js'

// Template terms for selling to UK consumers (Consumer Rights Act 2015 and the
// Consumer Contracts Regulations 2013). Have them checked before launch.

const sections = [
  {
    id: 'about',
    title: 'About these terms',
    body: (
      <>
        <p>These terms apply when you buy from the Mako Sports website. Please read them before you order. By placing an order you agree to them.</p>
        <p>
          <LegalIdentity /> You can contact us at <EmailLink />.
        </p>
        <p>These terms are for customers buying as consumers, not for business resale. They don't affect your legal rights as a consumer.</p>
      </>
    ),
  },
  {
    id: 'ordering',
    title: 'Placing an order',
    body: (
      <>
        <p>
          When you pay, you're offering to buy the items in your bag. We accept your order, and the contract between us starts, when we send you an order
          confirmation. Your order number is shown on screen straight after payment.
        </p>
        <p>
          Occasionally we may not be able to accept an order, for example if an item sells out at the same moment, or there's an obvious mistake in the
          price or description. If that happens we'll tell you and refund you in full straight away.
        </p>
      </>
    ),
  },
  {
    id: 'prices',
    title: 'Prices and payment',
    body: (
      <>
        <p>
          All prices are in pounds sterling (£)
          {BUSINESS.vatNumber ? ' and include VAT' : ''}. Delivery costs are shown in your bag and at checkout before you pay.
        </p>
        <p>
          We take payment when you place your order. Payments are handled securely by Stripe. We accept the cards and wallets shown at checkout, such as
          Visa, Mastercard, Apple Pay and Google Pay.
        </p>
        <p>We try hard to get every price right. If we find a mistake after you've ordered, we'll contact you so you can choose to go ahead at the correct price or cancel for a full refund.</p>
      </>
    ),
  },
  {
    id: 'delivery',
    title: 'Delivery',
    body: (
      <p>
        We deliver to UK addresses only. Delivery prices and times are on our <Link to="/delivery">delivery page</Link>. Items are your responsibility
        once they've been delivered to the address you gave us. If your order hasn't arrived within 30 days of ordering, you can cancel it for a full refund.
      </p>
    ),
  },
  {
    id: 'cancelling',
    title: 'Changing your mind',
    body: (
      <>
        <p>
          UK law lets you cancel an online order for any reason within 14 days of receiving it. Our returns window is{' '}
          <strong>
            <ReturnsDays /> days
          </strong>{' '}
          from delivery, and you don't have to give a reason. See our <Link to="/returns">returns page</Link> for how to do this.
        </p>
        <p>
          We'll refund you within 14 days of receiving the items back. If you return your whole order, we'll also refund the standard delivery charge you
          paid. We refund to the payment method you used.
        </p>
        <p>
          Items must be returned unworn and unwashed, and in the same condition you received them. You may try them on as you would in a shop. If an
          item has been used more than that, we may reduce your refund to reflect the loss in value.
        </p>
        <p>
          For hygiene reasons, socks that have been unsealed or worn can't be returned unless they're faulty. This doesn't affect your rights if an item
          is faulty.
        </p>
      </>
    ),
  },
  {
    id: 'faulty',
    title: 'Faulty or wrong items',
    body: (
      <>
        <p>By law, everything we sell must be of satisfactory quality, fit for purpose and as described. If it isn't:</p>
        <ul>
          <li>
            <strong>Within 30 days</strong> of delivery you can reject it for a full refund.
          </li>
          <li>
            <strong>After 30 days</strong> (up to 6 months) we'll repair or replace it. If that isn't possible, or doesn't fix the problem, you can have a
            refund.
          </li>
          <li>
            <strong>After 6 months</strong> you may still be entitled to a repair, replacement or partial refund, but you may need to show the fault was
            there when it was delivered.
          </li>
        </ul>
        <p>
          We'll pay the return postage for faulty or wrong items. Email <EmailLink /> with your order number and a photo of the problem.
        </p>
      </>
    ),
  },
  {
    id: 'liability',
    title: 'Our responsibility to you',
    body: (
      <>
        <p>
          If we break these terms, we're responsible for loss or damage you suffer that is a foreseeable result of that. We aren't responsible for loss
          that isn't foreseeable, or for business losses.
        </p>
        <p>
          Nothing in these terms limits our responsibility where it would be unlawful to do so, including for death or personal injury caused by our
          negligence, for fraud, or for breaking your legal rights as a consumer.
        </p>
      </>
    ),
  },
  {
    id: 'accounts',
    title: 'Your account',
    body: (
      <p>
        You don't need an account to buy from us. If you create one, please keep your password private and tell us if you think someone else has used it.
        We may close accounts that are used fraudulently. How we handle your information is explained in our <Link to="/privacy">privacy policy</Link>.
      </p>
    ),
  },
  {
    id: 'disputes',
    title: 'Complaints and disputes',
    body: (
      <>
        <p>
          If something's gone wrong, please email <EmailLink /> and we'll do our best to sort it out quickly.
        </p>
        <p>
          These terms are governed by the law of England and Wales. You can bring legal proceedings in the courts of England and Wales, or, if you live in
          Scotland or Northern Ireland, in the courts there.
        </p>
      </>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to these terms',
    body: (
      <p>
        We may update these terms from time to time. The terms that apply to your order are the ones shown here when you placed it. Last updated:{' '}
        <Info k="legalUpdated" placeholder="date" />.
      </p>
    ),
  },
]

export default function Terms() {
  useSeo({ title: 'Terms of sale', description: 'The terms that apply when you buy from Mako Sports.' })
  return (
    <InfoPage
      eyebrow="Legal"
      title="Terms of sale"
      intro="The agreement between you and us when you buy from Mako Sports. Your legal rights as a UK consumer always come first."
      updated={BUSINESS.legalUpdated}
      sections={sections}
    />
  )
}
