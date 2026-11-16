// Non-component helpers shared by the admin screens.

// 2499 → "24.99"
export const penceToPounds = (p) => (p == null ? '' : (p / 100).toFixed(2))

// "24.99" / "£24.99" → 2499; "" → null; anything invalid → NaN
export function poundsToPence(text) {
  const clean = String(text).replace(/[£,\s]/g, '')
  if (clean === '') return null
  const n = Number(clean)
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : NaN
}

export const SIZE_PRESETS = [
  { label: 'XS – XXL', sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
  { label: 'S – XL', sizes: ['S', 'M', 'L', 'XL'] },
  { label: 'One Size', sizes: ['One Size'] },
  { label: 'Socks (UK)', sizes: ['UK 4-7', 'UK 8-11', 'UK 12-14'] },
  { label: 'Waist 28–38', sizes: ['28W', '30W', '32W', '34W', '36W', '38W'] },
]
