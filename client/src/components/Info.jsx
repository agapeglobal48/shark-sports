import { BUSINESS } from '../content/business.js'

/**
 * Shows a business detail from content/business.js, or a highlighted
 * placeholder if it hasn't been filled in yet.
 *   <Info k="email" placeholder="contact email" />
 */
export function Info({ k, placeholder, children }) {
  const value = BUSINESS[k]
  if (value !== '' && value != null) return children ? children(value) : <>{value}</>
  return (
    <mark
      className="rounded-md border border-dashed border-blaze/60 bg-blaze/10 px-1.5 py-0.5 font-bold text-blaze"
      title="Placeholder: fill this in client/src/content/business.js"
    >
      [{placeholder}]
    </mark>
  )
}

/** The contact email as a mailto link (or a placeholder). */
export function EmailLink({ className = 'font-bold text-bone underline decoration-blaze underline-offset-4 hover:text-blaze' }) {
  return (
    <Info k="email" placeholder="contact email">
      {(email) => (
        <a href={`mailto:${email}`} className={className}>
          {email}
        </a>
      )}
    </Info>
  )
}

/** Returns window, e.g. "30 days". */
export function ReturnsDays() {
  return <Info k="returnsDays" placeholder="number of">{(d) => d}</Info>
}

/** The full legal identity paragraph: name, company number, address. */
export function LegalIdentity() {
  return (
    <>
      <Info k="tradingName" placeholder="trading name" /> is run by <Info k="legalName" placeholder="business / legal name" />
      {BUSINESS.companyNumber && (
        <>
          , a company registered in {BUSINESS.registeredIn || 'England and Wales'} (company number {BUSINESS.companyNumber})
        </>
      )}
      , of <Info k="address" placeholder="business address" />.
      {BUSINESS.vatNumber && <> VAT number: {BUSINESS.vatNumber}.</>}
    </>
  )
}
