import { collection, getDocs, onSnapshot, updateDoc, doc, type Unsubscribe } from 'firebase/firestore'
import { db } from '../firebase/firestore'
import type { UserProfile } from '../types/auth'

export async function getAllUsers(): Promise<UserProfile[]> {
  const snapshot = await getDocs(collection(db, 'users'))
  return snapshot.docs.map((item) => ({ ...item.data(), uid: String(item.data().uid ?? item.id), documentId: item.id } as UserProfile))
}

export function subscribeToUsers(onChange: (users: UserProfile[]) => void, onError: (error: Error) => void): Unsubscribe {
  return onSnapshot(collection(db, 'users'), (snapshot) => {
    onChange(snapshot.docs.map((item) => ({ ...item.data(), uid: String(item.data().uid ?? item.id), documentId: item.id } as UserProfile)))
  }, onError)
}

export async function updateUserActiveStatus(userId: string, isActive: boolean) {
  await updateDoc(doc(db, 'users', userId), { isActive })
}