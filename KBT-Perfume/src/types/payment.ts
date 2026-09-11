export type PaymentMethod = 'cod' | 'bank_transfer'
export type PaymentStatus = 'unpaid' | 'pending_confirmation' | 'paid' | 'failed'

export interface BankAccountSettings {
  bankName: string
  accountNumber: string
  accountHolder: string
  transferNote: string
  bankTransferEnabled?: boolean
  sepayApiKey?: string
  vnpayTmnCode?: string
  vnpayHashSecret?: string
  vnpayEndpoint?: string
  vnpayCallbackUrl?: string
  vnpayEnabled?: boolean
  momoPartnerCode?: string
  momoAccessKey?: string
  momoSecretKey?: string
  momoEndpoint?: string
  momoCallbackUrl?: string
  momoIpnUrl?: string
  momoEnabled?: boolean
  updatedAt?: string
}
