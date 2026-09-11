import type { Order } from '../types/order'
import type { DailyRevenueReport, OrderReport, ProductSalesReport } from '../types/report'

export function buildOrderReport(orders: Order[]): OrderReport {
  const productMap = new Map<string, ProductSalesReport>()
  const dailyMap = new Map<string, DailyRevenueReport>()

  orders.forEach((order) => {
    const day = order.createdAt.slice(0, 10)
    const daily = dailyMap.get(day) ?? { date: day, revenue: 0, orders: 0 }
    daily.revenue += order.status === 'cancelled' ? 0 : order.total
    daily.orders += 1
    dailyMap.set(day, daily)

    if (order.status === 'cancelled') return

    order.items.forEach((item) => {
      const product = productMap.get(item.id) ?? { name: item.name, quantity: 0, revenue: 0 }
      const itemPrice = Number(item.salePrice && item.salePrice > 0 && item.salePrice < item.price ? item.salePrice : item.price)
      product.quantity += item.quantity
      product.revenue += itemPrice * item.quantity
      productMap.set(item.id, product)
    })
  })

  const totalRevenue = orders.reduce((total, order) => order.status === 'cancelled' ? total : total + order.total, 0)

  return {
    totalOrders: orders.length,
    totalRevenue,
    deliveredOrders: orders.filter((order) => order.status === 'delivered').length,
    pendingOrders: orders.filter((order) => order.status === 'pending').length,
    cancelledOrders: orders.filter((order) => order.status === 'cancelled').length,
    averageOrderValue: totalRevenue / Math.max(1, orders.filter((order) => order.status !== 'cancelled').length),
    topProducts: Array.from(productMap.values()).sort((first, second) => second.quantity - first.quantity).slice(0, 5),
    dailyRevenue: Array.from(dailyMap.values()).sort((first, second) => first.date.localeCompare(second.date)).slice(-7),
  }
}
