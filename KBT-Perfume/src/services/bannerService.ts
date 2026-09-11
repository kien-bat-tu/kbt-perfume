import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/firestore'
import type { Banner, BannerInput } from '../types/banner'

function mapBanner(document: { id: string; data: () => Record<string, unknown> }): Banner {
  const data = document.data()
  return {
    id: document.id,
    title: String(data.title ?? ''),
    subtitle: String(data.subtitle ?? ''),
    imageUrl: String(data.imageUrl ?? ''),
    linkUrl: String(data.linkUrl ?? '/customer'),
    isActive: Boolean(data.isActive),
    order: Number(data.order ?? 0),
    createdAt: String(data.createdAt ?? ''),
  }
}

export async function getBanners(): Promise<Banner[]> {
  const snapshot = await getDocs(collection(db, 'banners'))
  return snapshot.docs.map(mapBanner).sort((first, second) => first.order - second.order)
}

export async function getActiveBanners(): Promise<Banner[]> {
  return (await getBanners()).filter((banner) => banner.isActive)
}

export async function createBanner(input: BannerInput) {
  const reference = await addDoc(collection(db, 'banners'), { ...input, createdAt: input.createdAt ?? new Date().toISOString() })
  return reference.id
}

export async function updateBanner(bannerId: string, input: Partial<BannerInput>) {
  await updateDoc(doc(db, 'banners', bannerId), input)
}

export async function deleteBanner(bannerId: string) {
  await deleteDoc(doc(db, 'banners', bannerId))
}
