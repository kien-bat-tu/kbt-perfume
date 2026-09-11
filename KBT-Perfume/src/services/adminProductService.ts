import { addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/firestore'
import type { Product } from '../types/product'

export type ProductInput = Omit<Product, 'id'>

export async function createProduct(input: ProductInput) {
  const productReference = await addDoc(collection(db, 'products'), input)
  return productReference.id
}

export async function updateProduct(productId: string, input: Partial<ProductInput>) {
  await updateDoc(doc(db, 'products', productId), input)
}

export async function deleteProduct(productId: string) {
  await deleteDoc(doc(db, 'products', productId))
}
