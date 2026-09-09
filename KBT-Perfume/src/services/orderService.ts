import { addDoc, collection } from 'firebase/firestore'
import { db } from '../firebase/firestore'
import type { CreateOrderInput } from '../types/order'

export async function createOrder(order: CreateOrderInput) {
  const orderReference = await addDoc(collection(db, 'orders'), {
    ...order,
    status: 'pending',
    createdAt: new Date().toISOString(),
  })

  return orderReference.id
}