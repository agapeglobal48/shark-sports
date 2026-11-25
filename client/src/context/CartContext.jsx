import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

// The bag is kept in the browser for now; it moves to the server at checkout.
const STORAGE_KEY = 'mako-cart-v1'
const OLD_STORAGE_KEY = 'shark-cart-v1' // name used before the rebrand
const CartContext = createContext(null)

function load() {
  try {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(OLD_STORAGE_KEY))
    return Array.isArray(items) ? items : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(load)
  const [open, setOpen] = useState(false)
  const [lastAdded, setLastAdded] = useState(0) // bumps to animate the bag icon

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
      localStorage.removeItem(OLD_STORAGE_KEY)
    } catch {
      /* storage full or blocked: bag still works for this visit */
    }
  }, [items])

  /** item: { variantId, slug, name, colorName, size, pricePence, image, stock } */
  const add = useCallback((item, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.variantId === item.variantId)
      if (existing) {
        return prev.map((i) =>
          i.variantId === item.variantId ? { ...i, ...item, qty: Math.min(i.qty + qty, item.stock) } : i,
        )
      }
      return [...prev, { ...item, qty: Math.min(qty, item.stock) }]
    })
    setLastAdded(Date.now())
    setOpen(true)
  }, [])

  const setQty = useCallback((variantId, qty) => {
    setItems((prev) =>
      prev.flatMap((i) => (i.variantId !== variantId ? [i] : qty <= 0 ? [] : [{ ...i, qty: Math.min(qty, i.stock) }])),
    )
  }, [])

  const remove = useCallback((variantId) => setItems((prev) => prev.filter((i) => i.variantId !== variantId)), [])
  const clear = useCallback(() => setItems([]), [])

  const value = useMemo(() => {
    const count = items.reduce((n, i) => n + i.qty, 0)
    const subtotalPence = items.reduce((n, i) => n + i.qty * i.pricePence, 0)
    return { items, count, subtotalPence, open, setOpen, add, setQty, remove, clear, lastAdded }
  }, [items, open, add, setQty, remove, clear, lastAdded])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext)
