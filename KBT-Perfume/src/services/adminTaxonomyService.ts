import { addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/firestore'
import type { TaxonomyItem } from '../types/taxonomy'

export type TaxonomyCollection = 'brands' | 'categories'

export async function createTaxonomyItem(collectionName: TaxonomyCollection, input: Omit<TaxonomyItem, 'id'>) {
  const reference = await addDoc(collection(db, collectionName), input)
  return reference.id
}

export async function updateTaxonomyItem(collectionName: TaxonomyCollection, itemId: string, input: Partial<Omit<TaxonomyItem, 'id'>>) {
  await updateDoc(doc(db, collectionName, itemId), input)
}

export async function deleteTaxonomyItem(collectionName: TaxonomyCollection, itemId: string) {
  await deleteDoc(doc(db, collectionName, itemId))
}
