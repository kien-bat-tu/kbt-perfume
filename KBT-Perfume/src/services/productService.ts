import { collection, doc, getDoc, getDocs, onSnapshot, type Unsubscribe } from 'firebase/firestore'
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

function cleanPlaceholderText(value: unknown, kind: 'brand' | 'category') {
  const text = String(value ?? '').trim()
  if (!text) return ''
  const normalized = text.replace(/\s+/g, ' ')
  const placeholderPattern = new RegExp(`^${kind}\\s*\\d*$`, 'i')
  return placeholderPattern.test(normalized) ? '' : normalized
}

function normalizeBrandName(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''

  const canonical = trimmed.toLowerCase()
  if (canonical === 'yves saint laurent' || canonical === 'ysl') return 'YSL'

  return trimmed
}

function mapProductDocument(productDocument: { id: string; data: () => Record<string, unknown> }) {
  const data = productDocument.data()
  const brand = normalizeBrandName(cleanPlaceholderText(data.brand ?? data.brandName ?? data.brandId ?? '', 'brand'))
  const category = cleanPlaceholderText(data.category ?? data.categoryName ?? data.categoryId ?? '', 'category')
  const rawPrice = Number(data.price ?? data.salePrice ?? 0)
  const rawSalePrice = Number(data.salePrice ?? 0)
  const price = Number.isFinite(rawPrice) ? rawPrice : 0
  const salePrice = Number.isFinite(rawSalePrice) ? rawSalePrice : 0

  return {
    ...data,
    id: productDocument.id,
    brand,
    category,
    price,
    salePrice,
    imageUrl: String(data.imageUrl ?? data.image ?? ''),
  } as Product
}

export function subscribeProducts(callback: (products: Product[]) => void): Unsubscribe {
  return onSnapshot(
    collection(db, 'products'),
    (snapshot) => callback(snapshot.docs.map(mapProductDocument)),
    () => callback([]),
  )
}