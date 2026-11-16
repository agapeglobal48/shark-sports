import { prisma } from '../config/db.js'
import { AppError } from '../utils/AppError.js'
import { uniqueSlug } from '../utils/slug.js'
import { pick } from '../utils/query.js'
import { cached } from '../utils/cache.js'

const FIELDS = ['name', 'description', 'imageUrl', 'sortOrder', 'parentId']

// GET /api/categories  — with the number of live products in each
// Cached for 5 minutes; cleared whenever an admin changes the catalogue.
export async function listCategories(req, res) {
  const categories = await cached('categories', 5 * 60_000, async () => {
    const rows = await prisma.category.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { products: { where: { isActive: true } } } } },
    })
    return rows.map(({ _count, ...c }) => ({ ...c, productCount: _count.products }))
  })
  res.json({ categories })
}

// POST /api/categories  (admin)
export async function createCategory(req, res) {
  const data = pick(req.body, FIELDS)
  data.slug = await uniqueSlug('category', req.body.slug || data.name)
  const category = await prisma.category.create({ data })
  res.status(201).json({ category })
}

// PATCH /api/categories/:id  (admin)
export async function updateCategory(req, res) {
  const { id } = req.params
  const data = pick(req.body, FIELDS)
  if (data.parentId === id) throw new AppError(400, 'A category cannot be its own parent')
  if (req.body.slug) data.slug = await uniqueSlug('category', req.body.slug, id)
  const category = await prisma.category.update({ where: { id }, data })
  res.json({ category })
}

// DELETE /api/categories/:id  (admin) — refused while products still use it
export async function deleteCategory(req, res) {
  const { id } = req.params
  const count = await prisma.product.count({ where: { categoryId: id } })
  if (count) throw new AppError(409, `This category still has ${count} product(s). Move or delete them first.`)
  await prisma.category.delete({ where: { id } })
  res.status(204).end()
}
