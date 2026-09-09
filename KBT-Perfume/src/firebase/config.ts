import { initializeApp } from 'firebase/app'

const firebaseConfig = {
  apiKey: 'AIzaSyA9bFJgpmef0hcZEveo3e8EETdlSd-L-bE',
  authDomain: 'kbt-perfume.firebaseapp.com',
  projectId: 'kbt-perfume',
  storageBucket: 'kbt-perfume.firebasestorage.app',
  messagingSenderId: '368555255434',
  appId: '1:368555255434:web:db87033dee103d6675af73',
  measurementId: 'G-PXTNK1PKXL',
}

export const app = initializeApp(firebaseConfig)

export default app