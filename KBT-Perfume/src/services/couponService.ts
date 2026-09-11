import { addDoc, collection, getDocs, query, updateDoc, doc, orderBy, where } from 'firebase/firestore'
import { db } from '../firebase/firestore'
import type { Coupon, CreateCouponInput } from '../types/coupon'

export async function getActiveCoupons(): Promise<Coupon[]> {
  const couponQuery = query(
    collection(db, 'coupons'),
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc'),
  )

  const snapshot = await getDocs(couponQuery)

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  } as Coupon))
}

export async function getAllCoupons(): Promise<Coupon[]> {
  const couponQuery = query(collection(db, 'coupons'), orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(couponQuery)

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  } as Coupon))
}

export async function createCoupon(input: CreateCouponInput) {
  const couponRef = await addDoc(collection(db, 'coupons'), {
    ...input,
    createdAt: input.createdAt ?? new Date().toISOString(),
  })

  return couponRef.id
}

export async function updateCouponStatus(couponId: string, status: Coupon['status']) {
  await updateDoc(doc(db, 'coupons', couponId), { status })
}
