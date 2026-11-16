const gbp = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' })

// 2499 → "£24.99"
export const formatPrice = (pence) => gbp.format((pence ?? 0) / 100)

// Ask Cloudinary for a resized, auto-format (WebP/AVIF), auto-quality version of an image.
// Non-Cloudinary URLs are returned unchanged.
export function cldImage(url, width = 800) {
  if (!url || !url.includes('/image/upload/')) return url
  return url.replace('/image/upload/', `/image/upload/f_auto,q_auto,w_${width},c_limit/`)
}

export function cldVideo(url, width = 1280) {
  if (!url || !url.includes('/video/upload/')) return url
  return url.replace('/video/upload/', `/video/upload/q_auto,vc_auto,w_${width},c_limit/`)
}

export const cx = (...classes) => classes.filter(Boolean).join(' ')
