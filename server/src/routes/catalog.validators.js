import { body } from 'express-validator'

const HEX = /^#[0-9a-fA-F]{6}$/
const nullable = { values: 'null' } // optional, and null is allowed

// Required on create, optional on update.
const req = (chain, isUpdate) => (isUpdate ? chain.optional() : chain)

const penceRule = (field, label) =>
  body(field).isInt({ min: 0, max: 100_000_000 }).withMessage(`${label} must be a whole number of pence (e.g. 2499 for £24.99)`).toInt()

export const categoryRules = (isUpdate = false) => [
  req(body('name').trim().isLength({ min: 1, max: 60 }).withMessage('Name is required (max 60 characters)'), isUpdate),
  body('slug').optional().trim().isLength({ min: 1, max: 80 }),
  body('description').optional(nullable).trim().isLength({ max: 1000 }),
  body('imageUrl').optional(nullable).isURL().withMessage('Image URL must be a valid URL'),
  body('sortOrder').optional().isInt({ min: 0 }).toInt(),
  body('parentId').optional(nullable).isString(),
]

export const brandRules = (isUpdate = false) => [
  req(body('name').trim().isLength({ min: 1, max: 60 }).withMessage('Name is required (max 60 characters)'), isUpdate),
  body('slug').optional().trim().isLength({ min: 1, max: 80 }),
  body('logoUrl').optional(nullable).isURL().withMessage('Logo URL must be a valid URL'),
]

// body(field, message) sets the message for every check in the chain.
const variantFields = (prefix, isUpdate) => [
  req(body(`${prefix}size`, 'Size is required (max 30 characters)').isString().trim().isLength({ min: 1, max: 30 }), isUpdate),
  body(`${prefix}stock`).optional().isInt({ min: 0, max: 1_000_000 }).withMessage('Stock must be 0 or more').toInt(),
  body(`${prefix}sku`).optional(nullable).trim().isLength({ min: 1, max: 64 }),
  penceRule(`${prefix}pricePence`, 'Size price').optional(nullable),
]

const colorFields = (prefix, isUpdate) => [
  req(body(`${prefix}name`, 'Colour name is required (max 40 characters)').isString().trim().isLength({ min: 1, max: 40 }), isUpdate),
  body(`${prefix}hexCode`).optional(nullable).matches(HEX).withMessage('Colour code must look like #1fe3f5'),
  body(`${prefix}sortOrder`).optional().isInt({ min: 0 }).toInt(),
]

export const productRules = (isUpdate = false) => [
  req(body('name', 'Name must be 2–120 characters').isString().trim().isLength({ min: 2, max: 120 }), isUpdate),
  body('slug').optional().trim().isLength({ min: 1, max: 140 }),
  body('description', 'Description is too long (max 5000 characters)').optional(nullable).isString().isLength({ max: 5000 }),
  req(body('categoryId', 'Choose a category').isString().notEmpty(), isUpdate),
  body('brandId').optional(nullable).isString(),
  req(penceRule('pricePence', 'Price'), isUpdate),
  penceRule('compareAtPricePence', 'Was-price').optional(nullable),
  body('isActive').optional().isBoolean().toBoolean(),
  body('isFeatured').optional().isBoolean().toBoolean(),
  ...(isUpdate
    ? [body('colors').not().exists().withMessage('Edit colours with the /colors and /variants routes')]
    : [
        body('colors').optional().isArray({ max: 30 }),
        ...colorFields('colors.*.', false),
        body('colors.*.variants').optional().isArray({ max: 50 }),
        ...variantFields('colors.*.variants.*.', false),
      ]),
]

export const colorRules = (isUpdate = false) => [
  ...colorFields('', isUpdate),
  ...(isUpdate
    ? []
    : [body('variants').optional().isArray({ max: 50 }), ...variantFields('variants.*.', false)]),
]

export const variantRules = (isUpdate = false) => [
  ...variantFields('', isUpdate),
  body('sortOrder').optional().isInt({ min: 0 }).toInt(),
  ...(isUpdate ? [body('stockChange').optional().isInt({ min: -1_000_000, max: 1_000_000 }).toInt()] : []),
]

export const mediaRules = [
  body('altText').optional(nullable).isString().isLength({ max: 200 }),
  body('sortOrder').optional().isInt({ min: 0 }).toInt(),
  body('colorId').optional(nullable).isString(),
]
