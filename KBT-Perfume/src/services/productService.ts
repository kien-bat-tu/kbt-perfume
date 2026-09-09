import { collection, doc, getDoc, getDocs } from 'firebase/firestore'
import { db } from '../firebase/firestore'
import type { Product } from '../types/product'

export async function getProducts() {
  const snapshot = await getDocs(collection(db, 'products'))

  return snapshot.docs.map(mapProductDocument)
}

export async function getProductById(productId: string) {
  const productSnapshot = await getDoc(doc(db, 'products', productId))

  if (!productSnapshot.exists()) return null

  return mapProductDocument(productSnapshot)
}

function mapProductDocument(productDocument: { id: string; data: () => Record<string, unknown> }) {
  const data = productDocument.data()
  const brand = String(data.brand ?? data.brandId ?? '')
  const category = String(data.category ?? data.categoryId ?? '')
  const price = Number(data.salePrice ?? data.price ?? 0)

  return {
    ...data,
    id: productDocument.id,
    brand,
    category,
    price,
    salePrice: Number(data.salePrice ?? 0),
    imageUrl: String(data.imageUrl ?? data.image ?? ''),
  } as Product
}