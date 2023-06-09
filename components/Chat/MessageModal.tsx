import React, { useRef, useState } from "react"
import { toggleModal } from "~/utils/redux/actions/uiActions"
import { useAppDispatch, useAppSelector } from "~/utils/redux/hooks"
import { Minimize } from "../Buttons"
import { useMessage } from "../../contexts/MessageContext"
import type { ClientMessageTypes, UserMessageHeader } from "../types"
import { useUser } from "../../contexts/UserContext"

const initialRecipient = {
  email: "",
  displayName: "",
  emailVerified: false,
  photoURL: "",
}

const MessageModal = () => {
  const { currentUserData, currentUserId, handleAddToContacts } = useUser()
  const { sendMessage, selectChatHead, chatHeads } = useMessage()
  const dispatch = useAppDispatch()
  const { messageModal, submitContactMessage } = useAppSelector((s) => s.ui)
  const divRef = useRef<HTMLDivElement>(null)
  const [recipient, setRecipient] =
    useState<UserMessageHeader>(initialRecipient)

  const handleChangeRecipient = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = divRef.current?.querySelector("input")
    const div = divRef.current?.querySelector("#suggest")
    if (input && div && currentUserData) {
      try {
        if (currentUserData.contacts !== undefined) {
          const contactList = currentUserData.contacts.filter(
            ({ displayName }) =>
              displayName.toLowerCase().includes(input.value.toLowerCase())
          )
          const buttons = contactList.map(({ displayName, email }, i) => {
            const button = document.createElement("button")
            button.setAttribute("key", `${i}`)
            button.classList.add("bg-blue-400")
            button.setAttribute("value", email)
            button.textContent = displayName
            return button
          })
          const parent = document.createElement("div")
          parent.setAttribute("id", "suggest")
          parent.setAttribute("class", "flex flex-col overflow-y-auto")
          parent.append(...buttons)
          buttons.forEach((button) =>
            button.addEventListener("click", (e) => {
              e.preventDefault()
              dispatch(toggleModal("submitContactMessage", true))
              setRecipient(() => {
                const { lastOnline, ...rest } = contactList.filter(
                  ({ email }) => email === button.value
                )[0]
                return rest
              })
              parent.classList.remove("flex")
              parent.classList.add("hidden")
            })
          )
          div.replaceWith(parent)
        } else if (currentUserId) handleAddToContacts(currentUserId)
      } catch (err) {
        console.log("No contacts exists!", err)
      }
    }
    dispatch(toggleModal("submitContactMessage", false))
    setRecipient((p) => ({ ...p, displayName: e.target.value }))
  }

  return messageModal ? (
    <div
      className="absolute z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-100
      w-1/2 shadow-md rounded-md p-4"
    >
      <Minimize
        onClick={() => dispatch(toggleModal("messageModal"))}
        name="-"
      />
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          const message = e.currentTarget.querySelector("textarea")
          sendMessage({
            recipient,
            sentTime: new Date().getTime(),
            message: message ? message.value : "",
          })
          setRecipient(initialRecipient)
          selectChatHead(chatHeads[0])
          dispatch(toggleModal("messageModal"))
        }}
      >
        <div className="grid" ref={divRef}>
          <input
            required
            type="text"
            placeholder="recipient..."
            className="w-full p-4 rounded-md"
            value={recipient.displayName}
            onChange={handleChangeRecipient}
          />
          <div className="flex flex-col" id="suggest">
            <button />
          </div>
        </div>
        <textarea
          required
          name="content"
          className="w-full resize-none p-4 rounded-md"
          placeholder="message"
        />
        <button
          disabled={!submitContactMessage}
          className={`${
            submitContactMessage
              ? "add-contacts-button"
              : "add-contacts-button-disabled"
          } rounded-md border px-2 w-full`}
        >
          Send
        </button>
      </form>
    </div>
  ) : (
    <></>
  )
}

export default MessageModal
