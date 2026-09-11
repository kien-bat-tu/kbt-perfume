import { collection, doc, getDoc, getDocs, limit, query, where } from 'firebase/firestore'
import { db } from '../firebase/firestore'
import type { UserProfile } from '../types/auth'

const localAdminEmail = 'nguyentrungkien012003@gmail.com'

export async function getProfileForAuthUser(uid: string, email: string | null, displayName: string | null): Promise<UserProfile> {
  const fallbackProfile: UserProfile = {
    uid,
    email: email ?? '',
    fullName: displayName ?? 'Khách hàng',
    role: email?.toLowerCase() === localAdminEmail ? 'admin' : 'customer',
  }

  try {
    const profileSnapshot = await getDoc(doc(db, 'users', uid))
    const usersQuerySnapshot = profileSnapshot.exists()
      ? null
      : await getDocs(query(collection(db, 'users'), where('uid', '==', uid), limit(1)))
    const legacyProfileSnapshot = profileSnapshot.exists() || usersQuerySnapshot?.docs.length
      ? null
      : await getDoc(doc(db, 'user', uid))
    const legacyQuerySnapshot = profileSnapshot.exists() || usersQuerySnapshot?.docs.length || legacyProfileSnapshot?.exists()
      ? null
      : await getDocs(query(collection(db, 'user'), where('uid', '==', uid), limit(1)))
    const data = profileSnapshot.exists()
      ? profileSnapshot.data()
      : usersQuerySnapshot?.docs[0]?.data()
        ?? (legacyProfileSnapshot?.exists() ? legacyProfileSnapshot.data() : legacyQuerySnapshot?.docs[0]?.data() ?? null)

    return data
      ? {
          ...fallbackProfile,
          ...data,
          uid: String(data.uid ?? uid),
          email: String(data.email ?? email ?? ''),
          fullName: String(data.fullName ?? displayName ?? 'Khách hàng'),
          role: data.role === 'admin' ? 'admin' : 'customer',
        }
      : fallbackProfile
  } catch {
    return fallbackProfile
  }
}
