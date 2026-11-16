import { prisma } from '../config/db.js'

// "Men's Pro Hoodie – Black" → "mens-pro-hoodie-black"
export function slugify(text) {
  return String(text)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Returns a slug not used by any other row of `model` (category | brand | product).
// Adds -2, -3 … if needed. `excludeId` lets a row keep its own slug when updating.
export async function uniqueSlug(model, text, excludeId) {
  const base = slugify(text) || 'item'
  let slug = base
  for (let n = 2; ; n++) {
    const found = await prisma[model].findUnique({ where: { slug }, select: { id: true } })
    if (!found || found.id === excludeId) return slug
    slug = `${base}-${n}`
  }
}

// Readable, unique SKU like "PRO-HOODIE-BLACK-XL". `taken` avoids clashes within one request.
export async function makeSku(productSlug, colorName, size, taken = new Set()) {
  const [sku] = await makeSkus(productSlug, [{ colorName, size }], taken)
  return sku
}

const skuPart = (s, max) => slugify(s).toUpperCase().slice(0, max).replace(/-+$/, '')

// SKUs for many sizes at once, using a single database lookup (the DB is far away).
export async function makeSkus(productSlug, items, taken = new Set()) {
  const bases = items.map(({ colorName, size }) =>
    [skuPart(productSlug, 30), skuPart(colorName, 12), skuPart(size, 12)].filter(Boolean).join('-'),
  )
  if (!bases.length) return []
  const existing = await prisma.variant.findMany({
    where: { OR: [...new Set(bases)].map((b) => ({ sku: { startsWith: b } })) },
    select: { sku: true },
  })
  const used = new Set([...taken, ...existing.map((v) => v.sku)])
  return bases.map((base) => {
    let sku = base
    for (let n = 2; used.has(sku); n++) sku = `${base}-${n}`
    used.add(sku)
    taken.add(sku)
    return sku
  })
}
