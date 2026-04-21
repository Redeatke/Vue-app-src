import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useUserStore } from '@/stores/user'

const API_HOST = 'https://stingray-app-u3bsh.ondigitalocean.app'

export const useChatStore = defineStore('chat', () => {
  const chats = ref([])
  const chatInvitations = ref([])

  function authHeaders() {
    const userStore = useUserStore()
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userStore.authToken}`,
    }
  }

  // Helpers
  function toArray(data) {
    if (Array.isArray(data)) return data
    if (data && Array.isArray(data.chats)) return data.chats
    if (data && Array.isArray(data.data)) return data.data
    if (data && Array.isArray(data.results)) return data.results
    return []
  }

  // Chat CRUD

  async function createChat(groupName) {
    try {
      const response = await fetch(`${API_HOST}/chat`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ group_name: groupName, chat_type: 'group' }),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        return { success: false, message: data.message || 'Failed to create chat.' }
      }

      // Push the newly created chat directly into local state immediately
      const newChat = data.chat ?? data
      if (newChat && newChat._id) {
        const alreadyExists = chats.value.some((c) => c._id === newChat._id)
        if (!alreadyExists) chats.value.push(newChat)
      }

      // Refresh from server to sync
      await getMyChats()

      return { success: true, chat: newChat }
    } catch {
      return { success: false, message: 'Network error.' }
    }
  }

  // Fetches all chats the current user is associated with and splits them into:
  //   - chats:            chats where the user is a confirmed member (from currentUser.chat_sessions)
  //   - chatInvitations:  chats where the user has a pending invitation (from currentUser.requests)
  async function getMyChats() {
    try {
      const userStore = useUserStore()
      await userStore.getUser() // Ensure we have the latest profile data
      const me = userStore.currentUser

      // 1. Fetch confirmed chats from user.chat_sessions
      const sessionIds = me?.chat_sessions ?? []
      const confirmedChats = []
      
      for (const chatId of sessionIds) {
        try {
          const res = await fetch(`${API_HOST}/chat/${chatId}`, { headers: authHeaders() })
          const chatData = await res.json()
          if (res.ok) {
            confirmedChats.push(chatData.chat ?? chatData)
          }
        } catch (err) {
          console.error(`[getMyChats] failed fetching chat ${chatId}`, err)
        }
      }
      
      chats.value = confirmedChats

      // 2. Fetch pending chat invitations from user.requests
      const requests = me?.requests ?? []
      chatInvitations.value = requests
        .filter((req) => req.kind === 'ChatInvite')
        .map((req) => ({
          _id: req._id, 
          id: req._id, // request ID used for the PATCH accept/decline endpoint!
          chat_id: req.chat?.chatId,
          group_name: req.chat?.name ?? 'Group Chat',
          sender_username: req.sender?.username ?? ''
        }))
        
    } catch (e) {
      console.error('[getMyChats]', e)
    }
  }

  // Alias — GroupsView calls this separately but getMyChats already populates both
  async function getInvitations() {
    await getMyChats()
  }

  async function getChatInfo(chatId) {
    try {
      const response = await fetch(`${API_HOST}/chat/${chatId}`, { headers: authHeaders() })
      if (!response.ok) return null
      const data = await response.json()
      return data.chat ?? data
    } catch {
      return null
    }
  }

  // Get the pending invitation list for a specific chat
  async function getChatPendingInvitations(chatId) {
    try {
      const response = await fetch(`${API_HOST}/chat/${chatId}/invitation`, { headers: authHeaders() })
      if (!response.ok) return []
      const data = await response.json()
      if (Array.isArray(data)) return data
      return data?.invitations ?? data?.data ?? data?.pending ?? []
    } catch {
      return []
    }
  }

  // Invitations

  // Invite any user (friend or not) by their MongoDB _id
  async function inviteUser(chatId, userId) {
    try {
      const response = await fetch(`${API_HOST}/chat/${chatId}/invitation/${userId}`, {
        method: 'POST',
        headers: authHeaders(),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) return { success: false, message: data.message || 'Failed to send invite.' }
      // Refresh chat list so the inviter sees the updated members panel
      await getMyChats()
      return { success: true, message: 'Invitation sent!' }
    } catch {
      return { success: false, message: 'Network error.' }
    }
  }

  // Resolve username → _id via /users search, then invite
  async function inviteUserByUsername(chatId, username) {
    try {
      const searchRes = await fetch(
        `${API_HOST}/users?search=${encodeURIComponent(username)}`,
        { headers: authHeaders() },
      )
      const searchData = await searchRes.json()
      const target = (searchData?.users ?? []).find((u) => u.username === username)
      if (!target) return { success: false, message: `User "${username}" not found.` }
      return inviteUser(chatId, target._id)
    } catch {
      return { success: false, message: 'Network error.' }
    }
  }

  // accept = true | false
  async function respondToInvitation(chatId, requestId, accept) {
    try {
      const response = await fetch(
        `${API_HOST}/chat/${chatId}/invitation/${requestId}?accept=${accept}`,
        { method: 'PATCH', headers: authHeaders() },
      )
      if (response.ok) {
        await getMyChats()
      }
      return {
        success: response.ok,
        message: response.ok
          ? accept
            ? 'Joined the chat!'
            : 'Invitation declined.'
          : 'Failed to respond.',
      }
    } catch {
      return { success: false, message: 'Network error.' }
    }
  }

  // Membership

  async function leaveChat(chatId) {
    // Try both known endpoint variants
    const endpoints = [
      `${API_HOST}/chat/${chatId}/membership`,
      `${API_HOST}/chat/${chatId}/member`,
    ]

    for (const url of endpoints) {
      try {
        const response = await fetch(url, {
          method: 'DELETE',
          headers: {
            ...authHeaders(),
            'Content-Type': 'application/json',
          },
        })
        let body = {}
        try { body = await response.clone().json() } catch {}
        if (response.ok) {
          chats.value = chats.value.filter((c) => c._id !== chatId)
          await getMyChats()
          return { success: true, message: 'Left the chat.' }
        }

        // If it's a 404 the endpoint doesn't exist — try the next one
        if (response.status === 404) continue

        // Any other error (403, 400, 500…) — surface the server message
        const errMsg = body.message ?? body.error ?? `Error ${response.status}`
        return { success: false, message: errMsg }
      } catch (e) {
        console.error(`[leaveChat] ${url} threw:`, e)
      }
    }

    return { success: false, message: 'Failed to leave chat. Check console for details.' }
  }

  // Messages

  async function sendMessage(chatId, message) {
    try {
      const response = await fetch(`${API_HOST}/chat/${chatId}/message`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ message }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        const errMsg = data.message ?? data.error ?? `Error ${response.status}`
        return { success: false, message: errMsg }
      }
      return { success: true }
    } catch {
      return { success: false, message: 'Network error.' }
    }
  }

  async function getMessages(chatId, limit = 50, offset = 0) {
    try {
      const response = await fetch(
        `${API_HOST}/chat/${chatId}/messages?limit=${limit}&offset=${offset}`,
        { headers: authHeaders() },
      )
      if (!response.ok) return []
      const data = await response.json()
      return Array.isArray(data) ? data : (data.messages ?? [])
    } catch {
      return []
    }
  }



  return {
    chats,
    chatInvitations,
    createChat,
    getMyChats,
    getChatInfo,
    getChatPendingInvitations,
    getInvitations,
    inviteUser,
    inviteUserByUsername,
    respondToInvitation,
    leaveChat,
    sendMessage,
    getMessages,
  }
})
