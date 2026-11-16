// Tiny in-memory cache for data that rarely changes (categories, brands).
// The database is far away (Sydney), so skipping a round trip saves ~300 ms per request.
const store = new Map()

export async function cached(key, ttlMs, load) {
  const hit = store.get(key)
  if (hit && hit.expires > Date.now()) return hit.value
  const value = await load()
  store.set(key, { value, expires: Date.now() + ttlMs })
  return value
}

// Call after admin changes so shoppers see updates straight away.
export function invalidate(...keys) {
  for (const k of keys) store.delete(k)
}

// Product counts per category/brand change whenever products change.
export const invalidateCatalog = () => invalidate('categories', 'brands', 'sitemap')
