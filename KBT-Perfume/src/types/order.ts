import type { CartItem } from '../store/cartStore'
import type { PaymentMethod, PaymentStatus } from './payment'

export type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled'

export interface ShippingInfo {
  fullName: string
  phone: string
  address: string
  note: string
}

export interface CreateOrderInput {
  userId: string
  items: CartItem[]
  shipping: ShippingInfo
  total: number
  paymentMethod: PaymentMethod
  paymentStatus?: PaymentStatus
  inventoryAdjustedAt?: string
}

export interface Order extends CreateOrderInput {
  id: string
  status: OrderStatus
  createdAt: string
}