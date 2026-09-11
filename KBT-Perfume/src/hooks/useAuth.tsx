import {
  onAuthStateChanged,
  signOut,
  type User,
} from 'firebase/auth'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { auth } from '../firebase/auth'
import { getProfileForAuthUser } from '../services/profileService'
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
      try {
        setUser(currentUser)

        if (!currentUser) {
          setProfile(null)
          return
        }

        const loadedProfile = await getProfileForAuthUser(currentUser.uid, currentUser.email, currentUser.displayName)
        if (loadedProfile.isActive === false) {
          setProfile(null)
          await signOut(auth)
          return
        }

        setProfile(loadedProfile)
      } catch {
        setProfile(null)
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