import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api } from '../api/client.js'

// Categories are needed by the header, home page and shop, so load them once.
const FALLBACK = ['Hoodies', 'Jerseys', 'Shirts', 'Trousers', 'Hats', 'Socks'].map((name) => ({
  id: name,
  name,
  slug: name.toLowerCase(),
  productCount: 0,
}))

const CatalogContext = createContext({ categories: FALLBACK, allCategories: [], refresh: () => {} })

export function CatalogProvider({ children }) {
  const [all, setAll] = useState(null)

  // Called on load, and by the admin panel after changing categories.
  const refresh = useCallback(() => api.categories().then(setAll).catch(() => {}), [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const topLevel = all?.filter((c) => !c.parentId)
  const value = { categories: topLevel?.length ? topLevel : FALLBACK, allCategories: all ?? [], refresh }
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCatalog = () => useContext(CatalogContext)
