import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from '../types/product'

export interface CartItem extends Product {
  quantity: number
}

interface CartState {
  items: CartItem[]
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (product, quantity = 1) => set((state) => {
        const existingItem = state.items.find((item) => item.id === product.id)
        if (existingItem) {
          return { items: state.items.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item) }
        }
        return { items: [...state.items, { ...product, quantity }] }
      }),
      removeItem: (productId) => set((state) => ({ items: state.items.filter((item) => item.id !== productId) })),
      updateQuantity: (productId, quantity) => set((state) => ({ items: quantity > 0 ? state.items.map((item) => item.id === productId ? { ...item, quantity } : item) : state.items.filter((item) => item.id !== productId) })),
      clearCart: () => set({ items: [] }),
    }),
    { name: 'kbt-perfume-cart' },
  ),
)