// Helpers for reading ?query=params safely.

export function toInt(value, fallback, { min = -Infinity, max = Infinity } = {}) {
  const n = Number.parseInt(Array.isArray(value) ? value[0] : value, 10)
  if (Number.isNaN(n)) return fallback
  return Math.min(Math.max(n, min), max)
}

// "a,b" or ?x=a&x=b → ["a", "b"]
export function toList(value) {
  if (value == null || value === '') return []
  const parts = Array.isArray(value) ? value : String(value).split(',')
  return parts.map((s) => String(s).trim()).filter(Boolean)
}

export function toBool(value) {
  return value === 'true' || value === '1'
}

// Copy only the listed keys that are present in body.
export function pick(body, keys) {
  const out = {}
  for (const k of keys) if (body[k] !== undefined) out[k] = body[k]
  return out
}
