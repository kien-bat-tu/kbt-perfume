import { addDoc, collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore'
import { db } from '../firebase/firestore'
import type { CreateSupportTicketInput, SupportTicket } from '../types/support'

export async function getSupportTicketsByUser(userId: string): Promise<SupportTicket[]> {
  const ticketQuery = query(collection(db, 'supportTickets'), where('userId', '==', userId))
  const snapshot = await getDocs(ticketQuery)

  return snapshot.docs
    .map((document) => ({ id: document.id, ...document.data() } as SupportTicket))
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt))
}

export async function createSupportTicket(input: CreateSupportTicketInput) {
  const ticketRef = await addDoc(collection(db, 'supportTickets'), {
    ...input,
    createdAt: input.createdAt ?? new Date().toISOString(),
  })

  return ticketRef.id
}

export async function getAllSupportTickets(): Promise<SupportTicket[]> {
  const snapshot = await getDocs(collection(db, 'supportTickets'))

  return snapshot.docs
    .map((document) => ({ id: document.id, ...document.data() } as SupportTicket))
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt))
}

export async function updateSupportTicketStatus(ticketId: string, status: SupportTicket['status']) {
  await updateDoc(doc(db, 'supportTickets', ticketId), { status })
}
