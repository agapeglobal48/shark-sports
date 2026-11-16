// Shop-wide settings. Change delivery prices here.

export const SHIPPING = {
  standardPence: 399, // £3.99 standard UK delivery
  freeOverPence: 5000, // free delivery on orders of £50 or more
  countries: ['GB'], // where we deliver
}

export const shippingFor = (subtotalPence) =>
  subtotalPence >= SHIPPING.freeOverPence ? 0 : SHIPPING.standardPence

export const MAX_QTY_PER_LINE = 20
export const MAX_LINES = 30

// Unpaid checkouts expire after this long (Stripe's minimum is 30 minutes).
export const CHECKOUT_EXPIRES_MINUTES = 30
