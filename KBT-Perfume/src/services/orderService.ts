import { collection, doc, getDocs, onSnapshot, orderBy, query, runTransaction, updateDoc, where, type Unsubscribe } from 'firebase/firestore'
import { db } from '../firebase/firestore'
import type { CreateOrderInput, Order, OrderStatus } from '../types/order'
import type { PaymentStatus } from '../types/payment'

export async function createOrder(order: CreateOrderInput) {
  const orderReference = doc(collection(db, 'orders'))
  const createdAt = new Date().toISOString()

  await runTransaction(db, async (transaction) => {
    const productSnapshots = await Promise.all(order.items.map((item) => transaction.get(doc(db, 'products', item.id))))

    productSnapshots.forEach((productSnapshot, index) => {
      const item = order.items[index]
      if (!productSnapshot.exists()) throw new Error(`product-not-found:${item.name}`)

      const currentStock = Number(productSnapshot.data().stock ?? 0)
      if (currentStock < item.quantity) throw new Error(`insufficient-stock:${item.name} (còn ${currentStock})`)

      transaction.update(productSnapshot.ref, { stock: currentStock - item.quantity })
    })

    transaction.set(orderReference, {
      ...order,
      status: 'pending',
      paymentStatus: order.paymentMethod === 'bank_transfer' ? 'pending_confirmation' : 'unpaid',
      inventoryAdjustedAt: createdAt,
      createdAt,
    })
  })

  return orderReference.id
}

export async function getOrdersByUser(userId: string): Promise<Order[]> {
  const orderQuery = query(
    collection(db, 'orders'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  )

  const snapshot = await getDocs(orderQuery)

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  } as Order))
}

export async function getAllOrders(): Promise<Order[]> {
  const orderQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(orderQuery)

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  } as Order))
}

export function subscribeToAllOrders(onChange: (orders: Order[], changeCount: number) => void, onError: (error: Error) => void): Unsubscribe {
  const orderQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))

  return onSnapshot(orderQuery, (snapshot) => {
    const orders = snapshot.docs.map((document) => ({ id: document.id, ...document.data() } as Order))
    onChange(orders, snapshot.docChanges().length)
  }, onError)
}

export function subscribeToOrdersByUser(userId: string, onChange: (orders: Order[]) => void, onError: (error: Error) => void): Unsubscribe {
  const orderQuery = query(
    collection(db, 'orders'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  )

  return onSnapshot(orderQuery, (snapshot) => {
    const orders = snapshot.docs.map((document) => ({ id: document.id, ...document.data() } as Order))
    onChange(orders)
  }, onError)
}

export async function updateOrderStatus(orderId: string, nextStatus: OrderStatus) {
  await updateDoc(doc(db, 'orders', orderId), { status: nextStatus })
}

export async function cancelOrder(orderId: string) {
  await updateDoc(doc(db, 'orders', orderId), { status: 'cancelled' })
}

export async function updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus) {
  await updateDoc(doc(db, 'orders', orderId), { paymentStatus })
}

