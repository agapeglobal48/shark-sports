import { Router } from 'express'
import { body, param } from 'express-validator'
import rateLimit from 'express-rate-limit'
import { prisma } from '../config/db.js'
import { stripe, isStripeConfigured } from '../config/stripe.js'
import { SHIPPING, MAX_LINES, MAX_QTY_PER_LINE } from '../config/shop.js'
import { optionalAuth, requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { AppError } from '../utils/AppError.js'
import { startCheckout, fulfilSession, expireSession } from '../services/orders.js'

const router = Router()

// What the storefront needs to show delivery costs.
router.get('/checkout/config', (req, res) => {
  res.json({
    standardShippingPence: SHIPPING.standardPence,
    freeShippingOverPence: SHIPPING.freeOverPence,
    paymentsEnabled: isStripeConfigured(),
  })
})

// POST /api/checkout  { items: [{ variantId, quantity }] } → { url } (redirect the browser there)
// Works for guests and logged-in customers.
router.post(
  '/checkout',
  rateLimit({ windowMs: 60_000, limit: 15, standardHeaders: 'draft-8', legacyHeaders: false, message: { message: 'Too many checkout attempts, please wait a minute' } }),
  optionalAuth,
  body('items', 'Your bag is empty').isArray({ min: 1, max: MAX_LINES }),
  body('items.*.variantId', 'Invalid item').isString().notEmpty(),
  body('items.*.quantity', `Quantity must be 1–${MAX_QTY_PER_LINE}`).isInt({ min: 1, max: MAX_QTY_PER_LINE }).toInt(),
  validate,
  async (req, res) => {
    const result = await startCheckout(req.body.items, req.user)
    res.status(201).json(result)
  },
)

// GET /api/checkout/session/:id — order summary for the "thank you" page.
// Also confirms payment with Stripe directly, so orders complete even if the webhook is slow or not set up.
router.get('/checkout/session/:id', param('id').matches(/^cs_[A-Za-z0-9_]+$/), validate, async (req, res) => {
  let order = await prisma.order.findUnique({ where: { stripeSessionId: req.params.id }, include: { items: true } })
  if (!order) throw new AppError(404, 'Order not found')

  if (order.status === 'PENDING') {
    const session = await stripe().checkout.sessions.retrieve(req.params.id)
    if (await fulfilSession(session)) {
      order = await prisma.order.findUnique({ where: { id: order.id }, include: { items: true } })
    }
  }

  res.json({ order: publicOrder(order) })
})

// GET /api/orders/mine — the logged-in customer's orders
router.get('/orders/mine', requireAuth, async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user.id, status: { not: 'PENDING' } },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { items: true },
  })
  res.json({ orders: orders.map(publicOrder) })
})

// Fields safe to show the customer.
function publicOrder(o) {
  return {
    orderNumber: o.orderNumber,
    status: o.status,
    email: o.email,
    createdAt: o.createdAt,
    paidAt: o.paidAt,
    subtotalPence: o.subtotalPence,
    shippingPence: o.shippingPence,
    totalPence: o.totalPence,
    shipping: o.shipFullName
      ? { name: o.shipFullName, line1: o.shipLine1, line2: o.shipLine2, city: o.shipCity, postcode: o.shipPostcode }
      : null,
    items: o.items.map((i) => ({
      productName: i.productName,
      productSlug: i.productSlug,
      colorName: i.colorName,
      size: i.size,
      quantity: i.quantity,
      unitPricePence: i.unitPricePence,
      imageUrl: i.imageUrl,
    })),
  }
}

export default router

/**
 * POST /api/webhooks/stripe — Stripe tells us when a payment completes.
 * Must receive the raw request body (mounted before express.json in server.js).
 */
export async function stripeWebhook(req, res) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) return res.status(503).json({ message: 'STRIPE_WEBHOOK_SECRET missing in .env' })

  let event
  try {
    event = stripe().webhooks.constructEvent(req.body, req.headers['stripe-signature'], secret)
  } catch (err) {
    return res.status(400).json({ message: `Webhook signature check failed: ${err.message}` })
  }

  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded':
      await fulfilSession(event.data.object)
      break
    case 'checkout.session.expired':
      await expireSession(event.data.object)
      break
  }
  res.json({ received: true })
}
