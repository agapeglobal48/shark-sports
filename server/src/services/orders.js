import crypto from 'node:crypto'
import { prisma } from '../config/db.js'
import { stripe } from '../config/stripe.js'
import { SHIPPING, shippingFor, CHECKOUT_EXPIRES_MINUTES } from '../config/shop.js'
import { AppError } from '../utils/AppError.js'

const CLIENT_URL = () => process.env.CLIENT_URL || 'http://localhost:5173'

// Readable order numbers without look-alike characters: "SS-7K2M9Q"
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
function newOrderNumber() {
  const bytes = crypto.randomBytes(6)
  return 'SS-' + Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('')
}

// Small JPEG thumbnail for Stripe's checkout page.
const stripeImage = (url) => url?.replace('/image/upload/', '/image/upload/f_jpg,q_auto,w_400,c_limit/')

/**
 * Looks up current prices and stock for the bag. Never trusts prices sent by the browser.
 * Throws 409 with a list of problems if anything is unavailable or short on stock.
 */
export async function priceBag(items) {
  // Merge duplicate lines for the same size.
  const qty = new Map()
  for (const { variantId, quantity } of items) qty.set(variantId, (qty.get(variantId) ?? 0) + quantity)

  const variants = await prisma.variant.findMany({
    where: { id: { in: [...qty.keys()] } },
    include: {
      color: {
        select: {
          name: true,
          media: { where: { type: 'IMAGE' }, orderBy: { sortOrder: 'asc' }, take: 1, select: { url: true } },
          product: { select: { name: true, slug: true, pricePence: true, isActive: true } },
        },
      },
    },
  })
  const byId = new Map(variants.map((v) => [v.id, v]))

  const problems = []
  const lines = []
  for (const [variantId, quantity] of qty) {
    const v = byId.get(variantId)
    if (!v || !v.color.product.isActive) {
      problems.push({ variantId, available: 0, message: 'No longer available' })
      continue
    }
    if (v.stock < quantity) {
      problems.push({
        variantId,
        available: v.stock,
        message: v.stock === 0 ? `${v.color.product.name} (${v.size}) has sold out` : `Only ${v.stock} left of ${v.color.product.name} (${v.size})`,
      })
      continue
    }
    lines.push({
      variantId,
      productSlug: v.color.product.slug,
      productName: v.color.product.name,
      colorName: v.color.name,
      size: v.size,
      sku: v.sku,
      unitPricePence: v.pricePence ?? v.color.product.pricePence,
      quantity,
      imageUrl: v.color.media[0]?.url ?? null,
    })
  }

  if (problems.length) {
    throw new AppError(409, 'Some items in your bag have changed. Please check your bag.', { items: problems })
  }
  return lines
}

/** Creates a PENDING order and a Stripe Checkout Session for it. Returns the Stripe URL. */
export async function startCheckout(items, user) {
  stripe() // fail fast with a clear message if Stripe keys are missing
  const lines = await priceBag(items)
  const subtotalPence = lines.reduce((n, l) => n + l.unitPricePence * l.quantity, 0)
  const shippingPence = shippingFor(subtotalPence)

  let order
  for (let attempt = 0; !order; attempt++) {
    try {
      order = await prisma.order.create({
        data: {
          orderNumber: newOrderNumber(),
          userId: user?.id ?? null,
          email: user?.email ?? null,
          subtotalPence,
          shippingPence,
          totalPence: subtotalPence + shippingPence,
          paymentProvider: 'stripe',
          items: { create: lines },
        },
        select: { id: true, orderNumber: true },
      })
    } catch (err) {
      if (err.code !== 'P2002' || attempt >= 3) throw err // retry only on an order-number clash
    }
  }

  let session
  try {
    session = await stripe().checkout.sessions.create(
      {
        mode: 'payment',
        currency: 'gbp',
        client_reference_id: order.id,
        ...(user?.email && { customer_email: user.email }),
        line_items: lines.map((l) => ({
          quantity: l.quantity,
          price_data: {
            currency: 'gbp',
            unit_amount: l.unitPricePence,
            product_data: {
              name: l.productName,
              description: `${l.colorName} · Size ${l.size}`,
              ...(l.imageUrl && { images: [stripeImage(l.imageUrl)] }),
              metadata: { variantId: l.variantId, sku: l.sku },
            },
          },
        })),
        shipping_address_collection: { allowed_countries: SHIPPING.countries },
        shipping_options: [
          {
            shipping_rate_data: {
              type: 'fixed_amount',
              display_name: shippingPence === 0 ? 'Free UK delivery' : 'Standard UK delivery',
              fixed_amount: { amount: shippingPence, currency: 'gbp' },
            },
          },
        ],
        phone_number_collection: { enabled: true },
        metadata: { orderId: order.id, orderNumber: order.orderNumber },
        payment_intent_data: { metadata: { orderId: order.id, orderNumber: order.orderNumber } },
        success_url: `${CLIENT_URL()}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${CLIENT_URL()}/checkout/cancelled`,
        expires_at: Math.floor(Date.now() / 1000) + CHECKOUT_EXPIRES_MINUTES * 60 + 60,
        locale: 'en-GB',
      },
      { idempotencyKey: `checkout-${order.id}` },
    )
  } catch (err) {
    await prisma.order.delete({ where: { id: order.id } }).catch(() => {})
    if (err instanceof AppError) throw err
    console.error('Stripe checkout failed:', err.message)
    throw new AppError(502, 'Could not start checkout. Please try again.')
  }

  await prisma.order.update({ where: { id: order.id }, data: { stripeSessionId: session.id } })
  return { url: session.url, orderNumber: order.orderNumber }
}

/**
 * Marks the order paid, saves the address from Stripe and takes the items out of stock.
 * Safe to call more than once (webhook + success page): only the first call does anything.
 */
export async function fulfilSession(session) {
  if (!['paid', 'no_payment_required'].includes(session.payment_status)) return false
  const orderId = session.metadata?.orderId || session.client_reference_id
  if (!orderId) return false

  const ship = session.collected_information?.shipping_details ?? session.shipping_details ?? null
  const addr = ship?.address ?? {}
  const customer = session.customer_details ?? {}

  return prisma.$transaction(
    async (tx) => {
      const { count } = await tx.order.updateMany({
        where: { id: orderId, status: 'PENDING' },
        data: {
          status: 'PAID',
          paidAt: new Date(),
          email: customer.email ?? undefined,
          shipFullName: ship?.name ?? customer.name ?? null,
          shipLine1: addr.line1 ?? null,
          shipLine2: addr.line2 ?? null,
          shipCity: addr.city ?? null,
          shipCounty: addr.state ?? null,
          shipPostcode: addr.postal_code ?? null,
          shipCountry: addr.country ?? 'GB',
          shipPhone: customer.phone ?? null,
          paymentRef: typeof session.payment_intent === 'string' ? session.payment_intent : (session.payment_intent?.id ?? null),
          ...(session.amount_total != null && { totalPence: session.amount_total }),
        },
      })
      if (count === 0) return false // already handled

      // Take everything out of stock in one statement (never below zero).
      await tx.$executeRaw`
        UPDATE "Variant" v
        SET stock = GREATEST(v.stock - oi.quantity, 0)
        FROM "OrderItem" oi
        WHERE oi."orderId" = ${orderId} AND oi."variantId" = v.id`
      return true
    },
    { timeout: 20_000, maxWait: 10_000 },
  )
}

/** An unpaid checkout timed out: mark the order cancelled. */
export async function expireSession(session) {
  const orderId = session.metadata?.orderId || session.client_reference_id
  if (!orderId) return
  await prisma.order.updateMany({ where: { id: orderId, status: 'PENDING' }, data: { status: 'CANCELLED' } })
}
