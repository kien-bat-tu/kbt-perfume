import { addDoc, collection, doc, getDocs, onSnapshot, orderBy, query, updateDoc, where, type Unsubscribe } from 'firebase/firestore'
import { db } from '../firebase/firestore'
import type { CreateReturnRequestInput, ReturnRequest, ReturnRequestStatus } from '../types/returnRequest'

export async function createReturnRequest(input: CreateReturnRequestInput) {
  const createdAt = new Date().toISOString()
  const request = await addDoc(collection(db, 'returnRequests'), { ...input, status: 'pending', createdAt })
  return request.id
}

export async function getReturnRequestsByUser(userId: string): Promise<ReturnRequest[]> {
  const snapshot = await getDocs(query(collection(db, 'returnRequests'), where('userId', '==', userId)))
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as ReturnRequest)).sort((first, second) => second.createdAt.localeCompare(first.createdAt))
}

export function subscribeToReturnRequests(onChange: (requests: ReturnRequest[]) => void, onError: (error: Error) => void): Unsubscribe {
  return onSnapshot(query(collection(db, 'returnRequests'), orderBy('createdAt', 'desc')), (snapshot) => {
    onChange(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as ReturnRequest)))
  }, onError)
}

export async function updateReturnRequestStatus(requestId: string, status: ReturnRequestStatus) {
  await updateDoc(doc(db, 'returnRequests', requestId), { status, updatedAt: new Date().toISOString() })
}