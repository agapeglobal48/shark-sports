import { Router } from 'express'
import { body, param } from 'express-validator'
import { prisma } from '../config/db.js'
import { requireAdmin } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { AppError } from '../utils/AppError.js'
import { toInt } from '../utils/query.js'

// Mounted at /api/admin/orders — admin only.
const router = Router()
router.use(requireAdmin)

// Statuses an admin can move an order to. PENDING is set only by checkout.
const ADMIN_STATUSES = ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']
const LIVE = ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED']

// GET /api/admin/orders?status=PAID&search=SS-7K2&page=1
// By default hides abandoned checkouts (PENDING); pass status=PENDING to see them.
router.get('/', async (req, res) => {
  const { status, search } = req.query
  if (status && status !== 'open' && ![...ADMIN_STATUSES, 'PENDING'].includes(status)) throw new AppError(400, 'Unknown status')
  const page = toInt(req.query.page, 1, { min: 1 })
  const limit = toInt(req.query.limit, 25, { min: 1, max: 100 })

  const where = {
    ...(status === 'open' ? { status: { in: ['PAID', 'PROCESSING'] } } : status ? { status: String(status) } : { status: { not: 'PENDING' } }),
    ...(search && {
      OR: [
        { orderNumber: { contains: String(search).trim(), mode: 'insensitive' } },
        { email: { contains: String(search).trim(), mode: 'insensitive' } },
        { shipFullName: { contains: String(search).trim(), mode: 'insensitive' } },
        { shipPostcode: { contains: String(search).trim(), mode: 'insensitive' } },
      ],
    }),
  }

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        email: true,
        shipFullName: true,
        totalPence: true,
        createdAt: true,
        paidAt: true,
        userId: true,
        _count: { select: { items: true } },
        items: { select: { quantity: true } },
      },
    }),
  ])

  res.json({
    orders: orders.map(({ _count, items, ...o }) => ({ ...o, lines: _count.items, units: items.reduce((n, i) => n + i.quantity, 0) })),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  })
})

// GET /api/admin/orders/:id — everything about one order
router.get('/:id', async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { items: true, user: { select: { id: true, name: true, email: true } } },
  })
  if (!order) throw new AppError(404, 'Order not found')
  res.json({ order })
})

// PATCH /api/admin/orders/:id  { status, restock? }
// restock: true puts the items back in stock when cancelling/refunding a paid order.
router.patch(
  '/:id',
  param('id').isString(),
  body('status', 'Invalid status').isIn(ADMIN_STATUSES),
  body('restock').optional().isBoolean().toBoolean(),
  validate,
  async (req, res) => {
    const { status, restock } = req.body
    const order = await prisma.order.findUnique({ where: { id: req.params.id }, select: { id: true, status: true, paidAt: true } })
    if (!order) throw new AppError(404, 'Order not found')
    // Abandoned or expired checkouts were never paid, so there is nothing to ship or refund.
    if (!order.paidAt) throw new AppError(400, 'This checkout was never paid, so it cannot be updated')

    const putBack = restock && LIVE.includes(order.status) && ['CANCELLED', 'REFUNDED'].includes(status)

    const updated = await prisma.$transaction(
      async (tx) => {
        const o = await tx.order.update({ where: { id: order.id }, data: { status } })
        if (putBack) {
          await tx.$executeRaw`
            UPDATE "Variant" v SET stock = v.stock + oi.quantity
            FROM "OrderItem" oi
            WHERE oi."orderId" = ${order.id} AND oi."variantId" = v.id`
        }
        return o
      },
      { timeout: 20_000, maxWait: 10_000 },
    )
    res.json({ order: updated, restocked: Boolean(putBack) })
  },
)

export default router
