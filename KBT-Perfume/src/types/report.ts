export interface ProductSalesReport {
  name: string
  quantity: number
  revenue: number
}

export interface DailyRevenueReport {
  date: string
  revenue: number
  orders: number
}

export interface OrderReport {
  totalOrders: number
  totalRevenue: number
  deliveredOrders: number
  pendingOrders: number
  cancelledOrders: number
  averageOrderValue: number
  topProducts: ProductSalesReport[]
  dailyRevenue: DailyRevenueReport[]
}
