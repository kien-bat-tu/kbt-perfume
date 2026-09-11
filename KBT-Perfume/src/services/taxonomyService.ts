import { collection, getDocs, onSnapshot, type Unsubscribe } from 'firebase/firestore'
import { db } from '../firebase/firestore'
import type { TaxonomyItem } from '../types/taxonomy'

function sanitizeTaxonomyName(value: unknown) {
  const text = String(value ?? '').trim().replace(/\s+/g, ' ')
  if (!text) return ''
  if (/^category[\s_-]*\d*$/i.test(text) || /^brand[\s_-]*\d*$/i.test(text)) return ''
  return text
}

async function getTaxonomy(collectionName: 'brands' | 'categories') {
  const snapshot = await getDocs(collection(db, collectionName))

  return snapshot.docs
    .map((item) => {
      const data = item.data() as Partial<TaxonomyItem> & { name?: string }
      return {
        id: item.id,
        ...data,
        name: sanitizeTaxonomyName(data.name),
      } as TaxonomyItem
    })
    .filter((item) => Boolean(item.name)) as TaxonomyItem[]
}

export async function getBrands() {
  return getTaxonomy('brands')
}

export async function getCategories() {
  return getTaxonomy('categories')
}

export function subscribeBrands(callback: (items: TaxonomyItem[]) => void): Unsubscribe {
  return subscribeTaxonomy('brands', callback)
}

export function subscribeCategories(callback: (items: TaxonomyItem[]) => void): Unsubscribe {
  return subscribeTaxonomy('categories', callback)
}

function subscribeTaxonomy(collectionName: 'brands' | 'categories', callback: (items: TaxonomyItem[]) => void): Unsubscribe {
  return onSnapshot(
    collection(db, collectionName),
    (snapshot) => callback(
      snapshot.docs
        .map((item) => {
          const data = item.data() as Partial<TaxonomyItem> & { name?: string }
          return {
            id: item.id,
            ...data,
            name: sanitizeTaxonomyName(data.name),
          } as TaxonomyItem
        })
        .filter((item) => Boolean(item.name)),
    ),
    () => callback([]),
  )
}