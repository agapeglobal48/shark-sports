import { prisma } from '../config/db.js'
import { uniqueSlug } from '../utils/slug.js'
import { pick } from '../utils/query.js'
import { cached } from '../utils/cache.js'

const FIELDS = ['name', 'logoUrl']

// GET /api/brands
// Cached for 5 minutes; cleared whenever an admin changes the catalogue.
export async function listBrands(req, res) {
  const brands = await cached('brands', 5 * 60_000, async () => {
    const rows = await prisma.brand.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: { where: { isActive: true } } } } },
    })
    return rows.map(({ _count, ...b }) => ({ ...b, productCount: _count.products }))
  })
  res.json({ brands })
}

// POST /api/brands  (admin)
export async function createBrand(req, res) {
  const data = pick(req.body, FIELDS)
  data.slug = await uniqueSlug('brand', req.body.slug || data.name)
  const brand = await prisma.brand.create({ data })
  res.status(201).json({ brand })
}

// PATCH /api/brands/:id  (admin)
export async function updateBrand(req, res) {
  const { id } = req.params
  const data = pick(req.body, FIELDS)
  if (req.body.slug) data.slug = await uniqueSlug('brand', req.body.slug, id)
  const brand = await prisma.brand.update({ where: { id }, data })
  res.json({ brand })
}

// DELETE /api/brands/:id  (admin) — its products are kept, just left without a brand
export async function deleteBrand(req, res) {
  await prisma.brand.delete({ where: { id: req.params.id } })
  res.status(204).end()
}
