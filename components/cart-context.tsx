'use client'

import { createContext, useContext, useState, useCallback } from 'react'

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

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const addItem = useCallback((item: CartItem) => {
    setItems(prev => {
      // Cada pieza es única — no se puede agregar dos veces
      if (prev.find(i => i.id === item.id)) return prev
      return [...prev, item]
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const total = items.reduce((sum, i) => sum + i.price, 0)
  const count = items.length

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, clearCart, total, count
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider')
  return ctx
}