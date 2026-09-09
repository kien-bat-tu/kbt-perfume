import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase/firestore'
import type { TaxonomyItem } from '../types/taxonomy'

async function getTaxonomy(collectionName: 'brands' | 'categories') {
  const snapshot = await getDocs(collection(db, collectionName))

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as TaxonomyItem[]
}

export async function getBrands() {
  return getTaxonomy('brands')
}

export async function getCategories() {
  return getTaxonomy('categories')
}