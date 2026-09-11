export interface SupportTicket {
  id: string
  userId: string
  userName: string
  subject: string
  message: string
  status: 'open' | 'pending' | 'resolved'
  createdAt: string
}

export type CreateSupportTicketInput = Omit<SupportTicket, 'id' | 'createdAt'> & {
  createdAt?: string
}
