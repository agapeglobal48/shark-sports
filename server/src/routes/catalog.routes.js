import { Router } from 'express'
import { requireAdmin, optionalAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { uploadMedia } from '../middleware/upload.js'
import { invalidateCatalog } from '../utils/cache.js'
import * as categories from '../controllers/category.controller.js'
import * as brands from '../controllers/brand.controller.js'
import * as products from '../controllers/product.controller.js'
import * as variants from '../controllers/variant.controller.js'
import * as media from '../controllers/media.controller.js'
import {
  categoryRules,
  brandRules,
  productRules,
  colorRules,
  variantRules,
  mediaRules,
} from './catalog.validators.js'

// Mounted at /api
const router = Router()

// After any successful admin change, clear cached category/brand lists (their product counts may change).
router.use((req, res, next) => {
  if (req.method !== 'GET') res.on('finish', () => res.statusCode < 400 && invalidateCatalog())
  next()
})

// ─── Categories ───
router.get('/categories', categories.listCategories)
router.post('/categories', requireAdmin, categoryRules(), validate, categories.createCategory)
router.patch('/categories/:id', requireAdmin, categoryRules(true), validate, categories.updateCategory)
router.delete('/categories/:id', requireAdmin, categories.deleteCategory)

// ─── Brands ───
router.get('/brands', brands.listBrands)
router.post('/brands', requireAdmin, brandRules(), validate, brands.createBrand)
router.patch('/brands/:id', requireAdmin, brandRules(true), validate, brands.updateBrand)
router.delete('/brands/:id', requireAdmin, brands.deleteBrand)

// ─── Products ───
// optionalAuth: admins also see hidden products
router.get('/products', optionalAuth, products.listProducts)
router.get('/products/:slug', optionalAuth, products.getProduct)
router.post('/products', requireAdmin, productRules(), validate, products.createProduct)
router.patch('/products/:id', requireAdmin, productRules(true), validate, products.updateProduct)
router.delete('/products/:id', requireAdmin, products.deleteProduct)

// ─── Colours & sizes ───
router.post('/products/:id/colors', requireAdmin, colorRules(), validate, variants.addColor)
router.patch('/colors/:id', requireAdmin, colorRules(true), validate, variants.updateColor)
router.delete('/colors/:id', requireAdmin, variants.deleteColor)
router.post('/colors/:id/variants', requireAdmin, variantRules(), validate, variants.addVariant)
router.patch('/variants/:id', requireAdmin, variantRules(true), validate, variants.updateVariant)
router.delete('/variants/:id', requireAdmin, variants.deleteVariant)

// ─── Images & videos ───
// requireAdmin runs before multer so non-admins can't push files into memory.
router.post('/products/:id/media', requireAdmin, uploadMedia, mediaRules, validate, media.uploadProductMedia)
router.patch('/media/:id', requireAdmin, mediaRules, validate, media.updateMedia)
router.delete('/media/:id', requireAdmin, media.deleteMedia)

export default router
