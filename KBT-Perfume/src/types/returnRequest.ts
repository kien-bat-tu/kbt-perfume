export type ReturnRequestStatus = 'pending' | 'approved' | 'rejected' | 'refunded'

export interface ReturnRequest {
  id: string
  orderId: string
  userId: string
  userName: string
  reason: string
  refundAmount: number
  status: ReturnRequestStatus
  createdAt: string
  updatedAt?: string
}

export type CreateReturnRequestInput = Omit<ReturnRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>