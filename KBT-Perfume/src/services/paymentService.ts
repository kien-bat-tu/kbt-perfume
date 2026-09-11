import { doc, getDoc, onSnapshot, setDoc, type Unsubscribe } from 'firebase/firestore'
import { db } from '../firebase/firestore'
import type { BankAccountSettings } from '../types/payment'

const paymentSettingsReference = doc(db, 'storeSettings', 'payment')

export async function getBankAccountSettings(): Promise<BankAccountSettings | null> {
  const snapshot = await getDoc(paymentSettingsReference)
  return snapshot.exists() ? snapshot.data() as BankAccountSettings : null
}

export function subscribeBankAccountSettings(
  callback: (settings: BankAccountSettings | null) => void,
): Unsubscribe {
  return onSnapshot(paymentSettingsReference, (snapshot) => {
    callback(snapshot.exists() ? snapshot.data() as BankAccountSettings : null)
  })
}

export async function saveBankAccountSettings(settings: BankAccountSettings) {
  await setDoc(paymentSettingsReference, {
    ...settings,
    updatedAt: new Date().toISOString(),
  })
}
