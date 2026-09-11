export type CouponType = 'percentage' | 'fixed'
export type CouponStatus = 'active' | 'inactive'

export interface Coupon {
  id: string
  code: string
  name: string
  description: string
  type: CouponType
  value: number
  minOrder: number
  maxDiscount?: number
  status: CouponStatus
  expiresAt?: string
  createdAt: string
}

export type CreateCouponInput = Omit<Coupon, 'id' | 'createdAt'> & {
  createdAt?: string
}
