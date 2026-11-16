import { Router } from 'express'
import { prisma } from '../config/db.js'
import { requireAdmin } from '../middleware/auth.js'
import orderRoutes from './admin-orders.routes.js'

// Mounted at /api/admin — everything here is admin-only.
const router = Router()
router.use(requireAdmin)
router.use('/orders', orderRoutes)

const PAID_STATUSES = ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED']

export const LOW_STOCK = 5

// GET /api/admin/stats — numbers and stock alerts for the dashboard
router.get('/stats', async (req, res) => {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const [products, activeProducts, categories, brands, lowStock, outOfStockProducts, toFulfil, revenue, recentOrders] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.category.count(),
    prisma.brand.count(),
    // Individual sizes running low (but not zero)
    prisma.variant.findMany({
      where: { stock: { gt: 0, lte: LOW_STOCK } },
      orderBy: { stock: 'asc' },
      take: 12,
      select: {
        id: true,
        size: true,
        stock: true,
        color: { select: { name: true, product: { select: { id: true, name: true } } } },
      },
    }),
    // Products with no stock left in any size
    prisma.product.findMany({
      where: { colors: { none: { variants: { some: { stock: { gt: 0 } } } } } },
      orderBy: { updatedAt: 'desc' },
      take: 12,
      select: { id: true, name: true, isActive: true },
    }),
    // Paid orders waiting to be packed / shipped
    prisma.order.count({ where: { status: { in: ['PAID', 'PROCESSING'] } } }),
    // Sales in the last 30 days
    prisma.order.aggregate({
      where: { status: { in: PAID_STATUSES }, paidAt: { gte: since } },
      _sum: { totalPence: true },
      _count: true,
    }),
    prisma.order.findMany({
      where: { status: { not: 'PENDING' } },
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: { id: true, orderNumber: true, status: true, shipFullName: true, email: true, totalPence: true, createdAt: true },
    }),
  ])

  res.json({
    counts: { products, activeProducts, hiddenProducts: products - activeProducts, categories, brands },
    orders: {
      toFulfil,
      last30Days: { count: revenue._count, revenuePence: revenue._sum.totalPence ?? 0 },
      recent: recentOrders,
    },
    lowStock: lowStock.map((v) => ({
      variantId: v.id,
      productId: v.color.product.id,
      productName: v.color.product.name,
      colorName: v.color.name,
      size: v.size,
      stock: v.stock,
    })),
    outOfStock: outOfStockProducts,
    lowStockThreshold: LOW_STOCK,
  })
})

export default router
