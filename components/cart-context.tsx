'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react'

export interface CartItem {
  id: string
  code: string
  name: string
  species: string
  size: string
  price: number
  originalPrice?: number
  discountPct?: number
  photo?: string
  isSpecialOrder?: boolean
  delivery: 'pickup' | 'city' | 'interior'
  deliveryCost: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  clearCart: () => void
  total: number
  count: number
}

const CartContext = createContext<CartContextType | null>(null)
const CART_KEY = 'royalreef_cart'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // Cargar carrito del sessionStorage al iniciar
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(CART_KEY)
      if (saved) setItems(JSON.parse(saved))
    } catch {}
  }, [])

  // Guardar carrito en sessionStorage cuando cambia
  useEffect(() => {
    try {
      sessionStorage.setItem(CART_KEY, JSON.stringify(items))
    } catch {}
  }, [items])

  const addItem = useCallback((item: CartItem) => {
    setItems(prev => {
      if (prev.find(i => i.id === item.id)) return prev
      return [...prev, item]
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
    try { sessionStorage.removeItem(CART_KEY) } catch {}
  }, [])

  const total = items.reduce((sum, i) => sum + i.price, 0)
  const count = items.length

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider')
  return ctx
}