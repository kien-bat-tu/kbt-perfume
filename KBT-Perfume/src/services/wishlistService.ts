import { addDoc, collection, deleteDoc, doc, getDocs, query } from 'firebase/firestore'
import { db } from '../firebase/firestore'

export async function getWishlistByUser(userId: string): Promise<string[]> {
  const wishlistQuery = query(collection(db, 'wishlists', userId, 'items'))
  const snapshot = await getDocs(wishlistQuery)

  return snapshot.docs.map((document) => document.id)
}

export async function addToWishlist(userId: string, productId: string) {
  const snapshot = await getDocs(collection(db, 'wishlists', userId, 'items'))
  const exists = snapshot.docs.some((document) => document.id === productId)

  if (exists) return

  await addDoc(collection(db, 'wishlists', userId, 'items'), {
    productId,
    userId,
    createdAt: new Date().toISOString(),
  })
}

export async function removeFromWishlist(userId: string, productId: string) {
  const itemRef = doc(db, 'wishlists', userId, 'items', productId)
  await deleteDoc(itemRef)
}

export async function toggleWishlistItem(userId: string, productId: string): Promise<boolean> {
  const snapshot = await getDocs(collection(db, 'wishlists', userId, 'items'))
  const exists = snapshot.docs.some((document) => document.id === productId)

  if (exists) {
    await removeFromWishlist(userId, productId)
    return false
  }

  await addToWishlist(userId, productId)
  return true
}
