import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { collection, getFirestore } from "firebase/firestore"
// import { getAnalytics } from "firebase/analytics"

const firebaseApp = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  // measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
})

export const db = getFirestore(firebaseApp)
export const auth = getAuth(firebaseApp)
export const chatsCollectionRef = collection(db, "chats")
export const userCollectionRef = collection(db, "users")
// export const analytics = getAnalytics(firebaseApp)
