// Colours and sizes (variants) of a product. All admin-only.
import { prisma } from '../config/db.js'
import { destroyMedia } from '../config/cloudinary.js'
import { AppError } from '../utils/AppError.js'
import { makeSku } from '../utils/slug.js'
import { pick } from '../utils/query.js'
import { buildColorsCreate } from './product.controller.js'

const colorInclude = {
  variants: { orderBy: { sortOrder: 'asc' } },
  media: { orderBy: { sortOrder: 'asc' } },
}

// POST /api/products/:id/colors   { name, hexCode, variants: [{ size, stock, sku?, pricePence? }] }
export async function addColor(req, res) {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    select: { slug: true, _count: { select: { colors: true } } },
  })
  if (!product) throw new AppError(404, 'Product not found')

  const [data] = await buildColorsCreate(product.slug, [req.body], product._count.colors)
  const color = await prisma.productColor.create({
    data: { ...data, productId: req.params.id },
    include: colorInclude,
  })
  res.status(201).json({ color })
}

// PATCH /api/colors/:id   { name?, hexCode?, sortOrder? }
export async function updateColor(req, res) {
  const color = await prisma.productColor.update({
    where: { id: req.params.id },
    data: pick(req.body, ['name', 'hexCode', 'sortOrder']),
    include: colorInclude,
  })
  res.json({ color })
}

// DELETE /api/colors/:id   — also removes its sizes and photos
export async function deleteColor(req, res) {
  const { id } = req.params
  const media = await prisma.productMedia.findMany({ where: { colorId: id }, select: { publicId: true, type: true } })
  await prisma.productColor.delete({ where: { id } })
  await destroyMedia(media)
  res.status(204).end()
}

// POST /api/colors/:id/variants   { size, stock, sku?, pricePence? }
export async function addVariant(req, res) {
  const color = await prisma.productColor.findUnique({
    where: { id: req.params.id },
    select: { name: true, product: { select: { slug: true } }, _count: { select: { variants: true } } },
  })
  if (!color) throw new AppError(404, 'Colour not found')

  const { size, stock = 0, pricePence = null } = req.body
  const variant = await prisma.variant.create({
    data: {
      colorId: req.params.id,
      size,
      stock,
      pricePence,
      sku: req.body.sku || (await makeSku(color.product.slug, color.name, size)),
      sortOrder: color._count.variants,
    },
  })
  res.status(201).json({ variant })
}

// PATCH /api/variants/:id   { size?, stock?, sku?, pricePence?, sortOrder? }
// Send { "stockChange": -2 } to adjust stock relative to the current amount instead.
export async function updateVariant(req, res) {
  const data = pick(req.body, ['size', 'stock', 'sku', 'pricePence', 'sortOrder'])
  if (req.body.stockChange != null) {
    if (data.stock != null) throw new AppError(400, 'Send either stock or stockChange, not both')
    data.stock = { increment: req.body.stockChange }
  }
  let variant = await prisma.variant.update({ where: { id: req.params.id }, data })
  if (variant.stock < 0) {
    variant = await prisma.variant.update({ where: { id: variant.id }, data: { stock: 0 } })
  }
  res.json({ variant })
}

// DELETE /api/variants/:id
export async function deleteVariant(req, res) {
  await prisma.variant.delete({ where: { id: req.params.id } })
  res.status(204).end()
}
