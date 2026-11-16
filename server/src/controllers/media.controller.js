// Product images and videos, stored in Cloudinary. All admin-only.
import { prisma } from '../config/db.js'
import { assertCloudinaryConfigured, uploadBuffer, destroyMedia } from '../config/cloudinary.js'
import { AppError } from '../utils/AppError.js'
import { pick } from '../utils/query.js'
import { IMAGE_TYPES, MAX_IMAGE_BYTES } from '../middleware/upload.js'

async function checkColorBelongs(colorId, productId) {
  if (!colorId) return
  const color = await prisma.productColor.findUnique({ where: { id: colorId }, select: { productId: true } })
  if (!color || color.productId !== productId) throw new AppError(400, 'That colour does not belong to this product')
}

/**
 * POST /api/products/:id/media   (multipart/form-data)
 *   files    up to 10 images/videos
 *   colorId  optional — attach the photos to one colour
 *   altText  optional
 */
export async function uploadProductMedia(req, res) {
  assertCloudinaryConfigured()
  const productId = req.params.id
  const colorId = req.body.colorId || null
  const files = req.files ?? []
  if (!files.length) throw new AppError(400, 'Choose at least one file to upload')

  const product = await prisma.product.findUnique({ where: { id: productId }, select: { name: true } })
  if (!product) throw new AppError(404, 'Product not found')
  await checkColorBelongs(colorId, productId)

  const tooBig = files.find((f) => IMAGE_TYPES.includes(f.mimetype) && f.size > MAX_IMAGE_BYTES)
  if (tooBig) throw new AppError(400, `${tooBig.originalname} is over 10 MB. Images must be 10 MB or less.`)

  const last = await prisma.productMedia.findFirst({
    where: { productId, colorId },
    orderBy: { sortOrder: 'desc' },
    select: { sortOrder: true },
  })
  const sortOrder = (last?.sortOrder ?? -1) + 1

  // Upload all files to Cloudinary at the same time, keeping their order.
  const results = await Promise.allSettled(
    files.map((file) =>
      uploadBuffer(file.buffer, {
        folder: `shark-sports/products/${productId}`,
        resourceType: IMAGE_TYPES.includes(file.mimetype) ? 'image' : 'video',
      }),
    ),
  )
  const uploaded = results.flatMap((r, i) => {
    if (r.status !== 'fulfilled') return []
    const isImage = IMAGE_TYPES.includes(files[i].mimetype)
    return [{
      productId,
      colorId,
      type: isImage ? 'IMAGE' : 'VIDEO',
      url: r.value.secure_url,
      publicId: r.value.public_id,
      altText: req.body.altText || product.name,
      sortOrder: sortOrder + i,
    }]
  })
  const failed = results.find((r) => r.status === 'rejected')
  if (failed) {
    // Don't leave orphaned files in Cloudinary if any upload fails.
    await destroyMedia(uploaded)
    console.error('Cloudinary upload failed:', failed.reason?.message)
    throw new AppError(502, 'Upload to Cloudinary failed. Please try again.')
  }

  const media = await prisma.productMedia.createManyAndReturn({ data: uploaded })
  res.status(201).json({ media })
}

// PATCH /api/media/:id   { altText?, sortOrder?, colorId? }
export async function updateMedia(req, res) {
  const existing = await prisma.productMedia.findUnique({ where: { id: req.params.id } })
  if (!existing) throw new AppError(404, 'Media not found')
  const data = pick(req.body, ['altText', 'sortOrder', 'colorId'])
  if (data.colorId) await checkColorBelongs(data.colorId, existing.productId)
  const media = await prisma.productMedia.update({ where: { id: existing.id }, data })
  res.json({ media })
}

// DELETE /api/media/:id
export async function deleteMedia(req, res) {
  const media = await prisma.productMedia.delete({ where: { id: req.params.id } })
  await destroyMedia([media])
  res.status(204).end()
}
