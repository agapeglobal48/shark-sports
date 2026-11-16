import { Router } from 'express'
import { prisma } from '../config/db.js'
import { cached } from '../utils/cache.js'

// /sitemap.xml and /robots.txt for search engines.
// The storefront (Vercel) forwards these two paths here; in development Vite proxies them.

const router = Router()
const site = () => (process.env.SITE_URL || process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '')

const STATIC_PAGES = ['/', '/shop', '/delivery', '/returns', '/contact', '/terms', '/privacy', '/cookies']

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const day = (d) => d.toISOString().slice(0, 10)

router.get('/sitemap.xml', async (req, res) => {
  const base = site()
  const xml = await cached('sitemap', 60 * 60_000, async () => {
    const [categories, products] = await Promise.all([
      prisma.category.findMany({ where: { products: { some: { isActive: true } } }, select: { slug: true, updatedAt: true } }),
      prisma.product.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true }, orderBy: { updatedAt: 'desc' } }),
    ])
    const urls = [
      ...STATIC_PAGES.map((p) => ({ loc: base + p })),
      ...categories.map((c) => ({ loc: `${base}/shop/${c.slug}`, lastmod: day(c.updatedAt) })),
      ...products.map((p) => ({ loc: `${base}/product/${p.slug}`, lastmod: day(p.updatedAt) })),
    ]
    return (
      '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      urls.map((u) => `  <url><loc>${esc(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`).join('\n') +
      '\n</urlset>\n'
    )
  })
  res.type('application/xml').set('Cache-Control', 'public, max-age=3600').send(xml)
})

router.get('/robots.txt', (req, res) => {
  res
    .type('text/plain')
    .set('Cache-Control', 'public, max-age=86400')
    .send(
      ['User-agent: *', 'Disallow: /admin', 'Disallow: /account', 'Disallow: /checkout', 'Disallow: /api/', '', `Sitemap: ${site()}/sitemap.xml`, ''].join('\n'),
    )
})

export default router
