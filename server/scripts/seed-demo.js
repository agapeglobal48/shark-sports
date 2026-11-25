// Adds demo products (no photos) so the storefront has something to show while it's being built.
// All demo products have slugs starting with "demo-".
//   npm run seed:demo            add / refresh demo products
//   npm run seed:demo -- --remove   delete them all (do this before launch)
import 'dotenv/config'
import { prisma } from '../src/config/db.js'
import { makeSku } from '../src/utils/slug.js'

const remove = process.argv.includes('--remove')
const LEGACY_BRAND_SLUG = 'demo-sharks' // demo brand from before the rebrand

async function removeEmptyBrands(slugs) {
  const brands = await prisma.brand.findMany({ where: { slug: { in: slugs } }, include: { _count: { select: { products: true } } } })
  for (const b of brands) if (b._count.products === 0) await prisma.brand.delete({ where: { id: b.id } })
}

const existing = await prisma.product.findMany({ where: { slug: { startsWith: 'demo-' } }, select: { id: true } })
await prisma.product.deleteMany({ where: { id: { in: existing.map((p) => p.id) } } })
if (existing.length) console.log(`Removed ${existing.length} demo products`)

if (remove) {
  await removeEmptyBrands(['demo-mako', LEGACY_BRAND_SLUG])
  await prisma.$disconnect()
  process.exit(0)
}

const brand = await prisma.brand.upsert({
  where: { slug: 'demo-mako' },
  update: {},
  create: { name: 'Mako (demo)', slug: 'demo-mako' },
})
await removeEmptyBrands([LEGACY_BRAND_SLUG])
const cats = Object.fromEntries((await prisma.category.findMany()).map((c) => [c.slug, c.id]))

const APPAREL = ['S', 'M', 'L', 'XL', 'XXL']
const C = {
  black: { name: 'Black', hexCode: '#0b0b0c' },
  bone: { name: 'Bone', hexCode: '#ece6d8' },
  blaze: { name: 'Blaze', hexCode: '#ff5b1f' },
  cyan: { name: 'Mako Cyan', hexCode: '#22e4f6' },
  navy: { name: 'Navy', hexCode: '#1b2340' },
  grey: { name: 'Storm Grey', hexCode: '#5b6068' },
}

const demo = [
  { name: 'Apex Heavyweight Hoodie', cat: 'hoodies', price: 5499, was: 6499, featured: true, colors: [C.black, C.bone, C.blaze], sizes: APPAREL, desc: 'A 450gsm brushed-back fleece hoodie with a boxy fit, double-lined hood and dropped shoulders.' },
  { name: 'Fin Zip Hoodie', cat: 'hoodies', price: 4999, colors: [C.grey, C.navy], sizes: APPAREL, desc: 'Full-zip training hoodie with thumbholes and a soft cotton blend.' },
  { name: 'Predator Match Jersey', cat: 'jerseys', price: 3999, featured: true, colors: [C.cyan, C.black], sizes: APPAREL, desc: 'Lightweight mesh match jersey that wicks sweat and dries fast.' },
  { name: 'Deep Water Training Jersey', cat: 'jerseys', price: 3499, was: 4299, colors: [C.navy], sizes: APPAREL, desc: 'Breathable training top with laser-cut ventilation.' },
  { name: 'Riptide Track Trousers', cat: 'trousers', price: 4499, colors: [C.black, C.grey], sizes: ['28W', '30W', '32W', '34W', '36W'], desc: 'Tapered track trousers with zip pockets and ankle zips.' },
  { name: 'Current Joggers', cat: 'trousers', price: 3999, colors: [C.grey, C.bone], sizes: APPAREL, desc: 'Relaxed fleece joggers with an elastic waist and drawcord.' },
  { name: 'Reef Oversized Tee', cat: 'shirts', price: 2499, colors: [C.bone, C.black, C.blaze], sizes: APPAREL, desc: 'Heavy cotton oversized tee with a dropped shoulder.' },
  { name: 'Tidal Performance Tee', cat: 'shirts', price: 2299, colors: [C.black], sizes: APPAREL, desc: 'Quick-dry performance tee for training and running.' },
  { name: 'Mako Fin Cap', cat: 'hats', price: 2199, colors: [C.black, C.cyan], sizes: ['One Size'], desc: 'Six-panel cap with an embroidered fin logo and adjustable strap.' },
  { name: 'Deep Beanie', cat: 'hats', price: 1599, colors: [C.blaze, C.black], sizes: ['One Size'], desc: 'Ribbed knit beanie with a fold-over cuff.' },
  { name: 'Grip Crew Socks (3 Pack)', cat: 'socks', price: 1499, colors: [C.bone, C.black], sizes: ['UK 4-7', 'UK 8-11', 'UK 12-14'], desc: 'Cushioned crew socks with arch support. Three pairs.' },
  { name: 'Ankle Training Socks', cat: 'socks', price: 999, colors: [C.black], sizes: ['UK 4-7', 'UK 8-11'], desc: 'Low-cut socks with a cushioned sole.' },
]

// Deterministic "random" stock so reruns look the same.
const stockFor = (i, j, k) => [0, 3, 8, 12, 20, 2][(i * 7 + j * 3 + k) % 6]

for (const [i, d] of demo.entries()) {
  const slug = `demo-${d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')}`
  const taken = new Set()
  const colors = []
  for (const [j, c] of d.colors.entries()) {
    const variants = []
    for (const [k, size] of d.sizes.entries()) {
      variants.push({ size, stock: stockFor(i, j, k), sku: await makeSku(slug, c.name, size, taken), sortOrder: k })
    }
    colors.push({ ...c, sortOrder: j, variants: { create: variants } })
  }
  await prisma.product.create({
    data: {
      name: d.name,
      slug,
      description: d.desc,
      categoryId: cats[d.cat],
      brandId: brand.id,
      pricePence: d.price,
      compareAtPricePence: d.was ?? null,
      isFeatured: !!d.featured,
      colors: { create: colors },
    },
  })
}

console.log(`Added ${demo.length} demo products`)
await prisma.$disconnect()
