// Your business details, used by the legal pages, contact page and footer.
// Anything left empty shows as a highlighted [placeholder] on the site, so it's easy
// to spot what still needs filling in. Fill these in before launch.

export const BUSINESS = {
  tradingName: 'Mako Sports',

  // Sole trader: your full name (e.g. "Jane Smith trading as Mako Sports").
  // Limited company: the registered name (e.g. "Mako Sports Ltd").
  legalName: '',
  // Limited companies only, e.g. "12345678" and "England and Wales".
  companyNumber: '',
  registeredIn: '',
  // Only if you're VAT registered, e.g. "GB123456789".
  vatNumber: '',

  // A real postal address is required by UK law for online sellers.
  address: '',
  // Where customers send returns (leave empty if it's the same as the address above).
  returnsAddress: '',

  email: '',
  phone: '', // optional
  hours: '', // e.g. "Mon–Fri, 9am–5pm"

  // Returns: UK law gives customers at least 14 days to cancel online orders.
  returnsDays: null, // e.g. 30
  // 'customer' = the customer pays return postage, 'free' = you pay for returns.
  returnPostage: '',

  // Delivery promises shown on the delivery page.
  dispatchTime: '', // e.g. "1–2 working days"
  deliveryTime: '', // e.g. "2–4 working days"
  courier: '', // e.g. "Royal Mail Tracked 48"

  // Shown at the top of the legal pages. Update whenever you change them.
  legalUpdated: '17 November 2026',
}

// Fields the legal pages need. The admin dashboard counts the empty ones.
export const REQUIRED_FIELDS = {
  legalName: 'Business or legal name',
  address: 'Business address',
  email: 'Contact email',
  returnsDays: 'Returns window (days)',
  returnPostage: 'Who pays return postage',
  dispatchTime: 'Dispatch time',
  deliveryTime: 'Delivery time',
  courier: 'Courier / delivery service',
}

export const missingDetails = () =>
  Object.entries(REQUIRED_FIELDS)
    .filter(([key]) => BUSINESS[key] === '' || BUSINESS[key] == null)
    .map(([, label]) => label)
