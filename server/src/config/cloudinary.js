import { v2 as cloudinary } from 'cloudinary'
import { AppError } from '../utils/AppError.js'

let configured = false

// Configured on first use so .env is definitely loaded.
function ensureConfigured() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new AppError(503, 'Image uploads are not set up yet (Cloudinary keys missing in .env)')
  }
  if (!configured) {
    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
      secure: true,
    })
    configured = true
  }
}

export const assertCloudinaryConfigured = ensureConfigured

// Upload an in-memory file (from multer) to Cloudinary.
export function uploadBuffer(buffer, { folder, resourceType }) {
  ensureConfigured()
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (err, result) => (err ? reject(err) : resolve(result)),
    )
    stream.end(buffer)
  })
}

// Delete files from Cloudinary. Best effort: a failure here shouldn't block deleting the DB row.
export async function destroyMedia(items) {
  if (!items.length) return
  try {
    ensureConfigured()
  } catch {
    return
  }
  const results = await Promise.allSettled(
    items.map((m) =>
      cloudinary.uploader.destroy(m.publicId, {
        resource_type: m.type === 'VIDEO' ? 'video' : 'image',
        invalidate: true,
      }),
    ),
  )
  const failed = results.filter((r) => r.status === 'rejected')
  if (failed.length) console.warn(`Cloudinary: failed to delete ${failed.length} file(s)`)
}
