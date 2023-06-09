import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  runTransaction,
} from "firebase/firestore"
import { createContext, useContext, useEffect, useState } from "react"
import { db, userCollectionRef } from "~/utils/firebase"
import { Center, Loading } from "../components"
import type { UserDataInterface, UserDataTypes } from "../components/types"
import { useAuth } from "./AuthContext"

interface CurrentUserInterface extends UserDataTypes {
  contacts: UserDataTypes[]
}

type UserContextTypes = {
  userId: string[]
  userData: UserDataInterface[]
  checkUserID: (userId: string) => void
  setCurrentUserId: (cuid: string) => void
  promptMessage: string
  handleAddToContacts: (uid: string) => Promise<void>
  currentUserId: string | null
  currentUserData: CurrentUserInterface | null
}

const UserContext = createContext<UserContextTypes>({
  userId: [],
  userData: [],
  checkUserID: () => null,
  setCurrentUserId: () => null,
  promptMessage: "",
  handleAddToContacts: async () => {},
  currentUserId: null,
  currentUserData: null,
})

export const useUser = () => useContext(UserContext)
export const UserProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const [userId, setNewId] = useState<string[]>([])
  const [userData, setUserData] = useState<UserDataInterface[]>([])
  const [currentUserId, setCUID] = useState<string | null>(null)
  const [currentUserData, setCurrentUserData] =
    useState<CurrentUserInterface | null>(null)
  const [loading, setLoading] = useState(true)
  const { currentUser } = useAuth()
  const [promptMessage, setPromptMessage] = useState<string>("")

  function resetUserData() {
    setNewId([])
    setUserData([])
    setCUID(null)
    setCurrentUserData(null)
    setLoading(true)
    setPromptMessage("")
  }

  useEffect(() => resetUserData(), [currentUser])

  const checkUserID = (uid: string) => {
    const userIndex = userId.findIndex((id) => id === uid)
    if (userIndex === -1) return setNewId((p) => [...p, uid])
    return console.log(`User already exist, found on index: ${userIndex}`)
  }
  const setCurrentUserId = (uid: string) => {
    setCUID(uid)
  }

  async function handleAddToContacts(uid: string) {
    const currentUserRef = doc(db, `/users/${currentUserId}`)
    if (!currentUserId) return setPromptMessage("You need to sign in first")
    try {
      await runTransaction(db, async (tsx) => {
        const currentUserDoc = await tsx.get(currentUserRef)
        const { contacts } = currentUserDoc.data() as UserDataInterface
        if (contacts && userData.length > 0) {
          const userViewData = userData.filter(
            ({ userId }) => userId === uid
          )[0]
          const { email, emailVerified, photoURL, displayName } = userViewData
          const isUserExistInContactList =
            contacts.filter((currentCntcs) => currentCntcs.email === email)
              .length > 0
          if (isUserExistInContactList)
            return setPromptMessage(`You've already added this user`)
          return tsx.update(currentUserRef, {
            contacts: arrayUnion({
              email,
              emailVerified,
              photoURL,
              displayName,
            }),
          })
        } else if (!contacts && currentUserData) {
          const userToAddDoc = await getDoc(doc(userCollectionRef, uid))
          const { email, emailVerified, photoURL, displayName } = {
            ...(userToAddDoc.data() as UserDataTypes),
          }
          // Will only run as contact initializer
          return tsx.update(currentUserRef, {
            contacts: arrayUnion(
              {
                email: currentUserData.email,
                emailVerified: currentUserData.emailVerified,
                photoURL: currentUserData.photoURL,
                displayName: currentUserData.displayName,
              },
              { email, emailVerified, photoURL, displayName }
            ),
          })
        }
        if (currentUserId === uid)
          setPromptMessage("You're this user.. Badum, awkward")
      })
    } catch (err) {
      console.log(err)
    }
  }

  async function fetchUser(uid: string) {
    try {
      await runTransaction(db, async (tsx) => {
        const userDataDoc = await tsx.get(doc(db, `/users/${uid}`))
        if (userDataDoc.exists()) {
          console.log("setting user")
          const newUserData = {
            ...userDataDoc.data(),
            userId: uid,
          } as UserDataInterface
          return setUserData((p) => [...p, newUserData])
        }
        console.log("user not found")
      })
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    let isMounted = true
    if (isMounted) {
      // Ensures that we get the latest value
      if (userId.length > 0) fetchUser(userId[userId.length - 1])

      setLoading(false)
    }
    return () => {
      isMounted = false
    }
  }, [userId])

  useEffect(() => {
    let isMounted = true
    if (currentUserId && isMounted)
      onSnapshot(doc(db, `/users/${currentUserId}`), (doc) => {
        setCurrentUserData(doc.data() as CurrentUserInterface)
      })
    return () => {
      console.log("Current user data has been set-up!")
      isMounted = true
    }
  }, [currentUserId])

  const value = {
    userId,
    userData,
    checkUserID,
    setCurrentUserId,
    promptMessage,
    handleAddToContacts,
    currentUserId,
    currentUserData,
  }

  return (
    <UserContext.Provider value={value}>
      {loading ? (
        <Center>
          <Loading />
        </Center>
      ) : (
        children
      )}
    </UserContext.Provider>
  )
}
export default UserContext
