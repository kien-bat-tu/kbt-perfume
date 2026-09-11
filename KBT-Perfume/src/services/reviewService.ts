import { collection, deleteDoc, doc, getDocs, query, setDoc, where } from 'firebase/firestore'
import { db } from '../firebase/firestore'
import type { CreateProductReviewInput, ProductReview } from '../types/review'

export async function getReviewsByProduct(productId: string): Promise<ProductReview[]> {
  const reviewQuery = query(collection(db, 'reviews'), where('productId', '==', productId))
  const snapshot = await getDocs(reviewQuery)

  return snapshot.docs
    .map((document) => ({ id: document.id, ...document.data() } as ProductReview))
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt))
}

export async function getAllReviews(): Promise<ProductReview[]> {
  const snapshot = await getDocs(collection(db, 'reviews'))

  return snapshot.docs
    .map((document) => ({ id: document.id, ...document.data() } as ProductReview))
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt))
}

export async function createProductReview(input: CreateProductReviewInput) {
  const reviewId = `${input.productId}_${input.userId}`

  await setDoc(doc(db, 'reviews', reviewId), {
    ...input,
    createdAt: input.createdAt ?? new Date().toISOString(),
  })

  return reviewId
}

export async function deleteProductReview(reviewId: string) {
  await deleteDoc(doc(db, 'reviews', reviewId))
}
