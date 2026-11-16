import { prisma } from '../config/db.js'
import { destroyMedia } from '../config/cloudinary.js'
import { AppError } from '../utils/AppError.js'
import { uniqueSlug, makeSkus } from '../utils/slug.js'
import { toInt, toList, toBool, pick } from '../utils/query.js'

const isAdmin = (req) => req.user?.role === 'ADMIN'

const SORTS = {
  newest: { createdAt: 'desc' },
  price_asc: { pricePence: 'asc' },
  price_desc: { pricePence: 'desc' },
  name: { name: 'asc' },
}

const listInclude = {
  brand: { select: { id: true, name: true, slug: true } },
  category: { select: { id: true, name: true, slug: true } },
  colors: {
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      name: true,
      hexCode: true,
      variants: { orderBy: { sortOrder: 'asc' }, select: { size: true, stock: true } },
      media: {
        where: { type: 'IMAGE' },
        orderBy: { sortOrder: 'asc' },
        take: 2, // main + hover image
        select: { url: true, altText: true },
      },
    },
  },
}

export const detailInclude = {
  brand: true,
  category: { select: { id: true, name: true, slug: true } },
  colors: {
    orderBy: { sortOrder: 'asc' },
    include: {
      variants: { orderBy: { sortOrder: 'asc' } },
      media: { orderBy: { sortOrder: 'asc' } },
    },
  },
  // Media not tied to a colour (e.g. a product video)
  media: { where: { colorId: null }, orderBy: { sortOrder: 'asc' } },
}

// Shape for product cards in a grid.
function toCard(p, admin) {
  const variants = p.colors.flatMap((c) => c.variants)
  const totalStock = variants.reduce((sum, v) => sum + v.stock, 0)
  const images = p.colors.find((c) => c.media.length)?.media ?? []
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    pricePence: p.pricePence,
    compareAtPricePence: p.compareAtPricePence,
    isFeatured: p.isFeatured,
    brand: p.brand,
    category: p.category,
    image: images[0] ?? null,
    hoverImage: images[1] ?? null,
    colors: p.colors.map((c) => ({ id: c.id, name: c.name, hexCode: c.hexCode, image: c.media[0]?.url ?? null })),
    sizes: [...new Set(variants.filter((v) => v.stock > 0).map((v) => v.size))],
    inStock: totalStock > 0,
    ...(admin && { isActive: p.isActive, totalStock, createdAt: p.createdAt }),
  }
}

// Adds the price each size actually sells for.
function withEffectivePrices(product) {
  return {
    ...product,
    colors: product.colors.map((c) => ({
      ...c,
      variants: c.variants.map((v) => ({ ...v, effectivePricePence: v.pricePence ?? product.pricePence })),
    })),
  }
}

/**
 * GET /api/products
 * ?category=hoodies          category slug (also matches its sub-categories)
 * ?brand=nike,adidas         brand slugs
 * ?search=pro                name / description / brand
 * ?minPrice=1000&maxPrice=5000   in pence
 * ?size=M,L                  only sizes in stock
 * ?color=black               colour names
 * ?inStock=true  ?featured=true
 * ?sort=newest|price_asc|price_desc|name
 * ?page=1&limit=24
 * ?status=active|inactive|all   (admin only)
 */
export async function listProducts(req, res) {
  const q = req.query
  const admin = isAdmin(req)
  const AND = []

  if (!admin || !q.status || q.status === 'active') AND.push({ isActive: true })
  else if (q.status === 'inactive') AND.push({ isActive: false })

  if (q.category) {
    const slug = String(q.category)
    AND.push({ OR: [{ category: { slug } }, { category: { parent: { slug } } }] })
  }

  const brands = toList(q.brand)
  if (brands.length) AND.push({ brand: { slug: { in: brands } } })

  if (q.search) {
    const s = String(q.search).trim().slice(0, 100)
    AND.push({
      OR: [
        { name: { contains: s, mode: 'insensitive' } },
        { description: { contains: s, mode: 'insensitive' } },
        { brand: { name: { contains: s, mode: 'insensitive' } } },
      ],
    })
  }

  const minPrice = toInt(q.minPrice, null, { min: 0 })
  const maxPrice = toInt(q.maxPrice, null, { min: 0 })
  if (minPrice != null || maxPrice != null) {
    AND.push({ pricePence: { ...(minPrice != null && { gte: minPrice }), ...(maxPrice != null && { lte: maxPrice }) } })
  }

  const sizes = toList(q.size)
  if (sizes.length) {
    AND.push({ colors: { some: { variants: { some: { size: { in: sizes }, stock: { gt: 0 } } } } } })
  }

  const colors = toList(q.color)
  if (colors.length) {
    AND.push({ colors: { some: { OR: colors.map((name) => ({ name: { equals: name, mode: 'insensitive' } })) } } })
  }

  if (toBool(q.inStock)) AND.push({ colors: { some: { variants: { some: { stock: { gt: 0 } } } } } })
  if (toBool(q.featured)) AND.push({ isFeatured: true })

  const where = { AND }
  const page = toInt(q.page, 1, { min: 1 })
  const limit = toInt(q.limit, 24, { min: 1, max: 60 })
  const orderBy = [SORTS[q.sort] ?? SORTS.newest, { id: 'asc' }]

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit, include: listInclude }),
  ])

  res.json({
    products: products.map((p) => toCard(p, admin)),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  })
}

// GET /api/products/:slug   (admins may also pass the product id)
export async function getProduct(req, res) {
  const admin = isAdmin(req)
  const { slug } = req.params
  const product = await prisma.product.findFirst({
    where: admin ? { OR: [{ slug }, { id: slug }] } : { slug, isActive: true },
    include: detailInclude,
  })
  if (!product) throw new AppError(404, 'Product not found')
  res.json({ product: withEffectivePrices(product) })
}

// Builds nested create data for colours and their sizes, generating SKUs where missing.
export async function buildColorsCreate(productSlug, colors = [], startSort = 0) {
  // Generate every missing SKU in one database lookup.
  const taken = new Set(colors.flatMap((c) => (c.variants ?? []).map((v) => v.sku).filter(Boolean)))
  const missing = colors.flatMap((c) => (c.variants ?? []).filter((v) => !v.sku).map((v) => ({ colorName: c.name, size: v.size })))
  const generated = await makeSkus(productSlug, missing, taken)

  return colors.map((c, i) => ({
    name: c.name,
    hexCode: c.hexCode ?? null,
    sortOrder: startSort + i,
    variants: {
      create: (c.variants ?? []).map((v, j) => ({
        size: v.size,
        stock: v.stock ?? 0,
        pricePence: v.pricePence ?? null,
        sku: v.sku || generated.shift(),
        sortOrder: j,
      })),
    },
  }))
}

const PRODUCT_FIELDS = [
  'name',
  'description',
  'categoryId',
  'brandId',
  'pricePence',
  'compareAtPricePence',
  'isActive',
  'isFeatured',
]

/**
 * POST /api/products  (admin)
 * {
 *   name, description, categoryId, brandId, pricePence, compareAtPricePence, isActive, isFeatured,
 *   colors: [{ name, hexCode, variants: [{ size, stock, sku?, pricePence? }] }]
 * }
 */
export async function createProduct(req, res) {
  const data = pick(req.body, PRODUCT_FIELDS)
  data.slug = await uniqueSlug('product', req.body.slug || data.name)
  data.colors = { create: await buildColorsCreate(data.slug, req.body.colors) }

  const product = await prisma.product.create({ data, include: detailInclude })
  res.status(201).json({ product: withEffectivePrices(product) })
}

// PATCH /api/products/:id  (admin) — product-level fields only; colours/sizes have their own routes
export async function updateProduct(req, res) {
  const { id } = req.params
  const data = pick(req.body, PRODUCT_FIELDS)
  if (req.body.slug) data.slug = await uniqueSlug('product', req.body.slug, id)

  const product = await prisma.product.update({ where: { id }, data, include: detailInclude })
  res.json({ product: withEffectivePrices(product) })
}

// DELETE /api/products/:id  (admin)
// Past orders keep their copied details. Tip: set isActive=false to hide a product instead.
export async function deleteProduct(req, res) {
  const { id } = req.params
  const media = await prisma.productMedia.findMany({ where: { productId: id }, select: { publicId: true, type: true } })
  await prisma.product.delete({ where: { id } })
  await destroyMedia(media)
  res.status(204).end()
}
