import type { User } from 'firebase/auth'

export type UserRole = 'customer' | 'admin'

export interface UserProfile {
  uid: string
  email: string
  fullName: string
  role: UserRole
  createdAt?: string
}

export interface AuthContextValue {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signOutUser: () => Promise<void>
}