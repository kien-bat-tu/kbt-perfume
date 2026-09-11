import type { User } from 'firebase/auth'

export type UserRole = 'customer' | 'admin'

export interface UserProfile {
  uid: string
  documentId?: string
  email: string
  fullName: string
  role: UserRole
  isActive?: boolean
  phone?: string
  address?: string
  createdAt?: string
}

export interface AuthContextValue {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signOutUser: () => Promise<void>
}