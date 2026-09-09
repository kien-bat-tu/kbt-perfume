import {
  onAuthStateChanged,
  signOut,
  type User,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { auth } from '../firebase/auth'
import { db } from '../firebase/firestore'
import type { AuthContextValue, UserProfile } from '../types/auth'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)

      if (!currentUser) {
        setProfile(null)
        setLoading(false)
        return
      }

      try {
        const profileSnapshot = await getDoc(doc(db, 'users', currentUser.uid))
        setProfile(
          profileSnapshot.exists()
            ? (profileSnapshot.data() as UserProfile)
            : {
                uid: currentUser.uid,
                email: currentUser.email ?? '',
                fullName: currentUser.displayName ?? 'Khách hàng',
                role: 'customer',
              },
        )
      } catch {
        setProfile({
          uid: currentUser.uid,
          email: currentUser.email ?? '',
          fullName: currentUser.displayName ?? 'Khách hàng',
          role: 'customer',
        })
      } finally {
        setLoading(false)
      }
    })

    return unsubscribe
  }, [])

  const value: AuthContextValue = {
    user,
    profile,
    loading,
    signOutUser: () => signOut(auth),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}