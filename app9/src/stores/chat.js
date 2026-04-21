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

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  /** Extract an array from various API response shapes */
  function toArray(data) {
    if (Array.isArray(data)) return data
    if (data && Array.isArray(data.chats)) return data.chats
    if (data && Array.isArray(data.data)) return data.data
    if (data && Array.isArray(data.results)) return data.results
    return []
  }

  // ─── Chat CRUD ───────────────────────────────────────────────────────────────

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

  /**
   * Fetches all chats the current user is associated with and splits them into:
   *   - chats:            chats where the user is a confirmed member / owner
   *   - chatInvitations:  chats where the user has a pending invitation
   *
   * Strategy:
   *   1. GET /chat  — returns every chat the user is somehow linked to.
   *   2. For each chat, call GET /chat/:id/invitation to see if the current
   *      user's ID appears as a *pending* invitation.  If yes → pending invite.
   *      If no → confirmed member.
   *
   * This avoids the old bug where the API adds the invited user straight into
   * `members`, making them look like a confirmed member before they accept.
   */
  async function getMyChats() {
    try {
      const userStore = useUserStore()
      const me = userStore.currentUser
      const myId = (me?._id ?? me?.id ?? '').toString()

      const response = await fetch(`${API_HOST}/chat`, { headers: authHeaders() })
      if (!response.ok) return

      const data = await response.json()
      const list = toArray(data)

      const confirmedChats = []
      const pendingInvites = []

      // Fetch invitation lists in parallel for all chats
      const invChecks = await Promise.allSettled(
        list.map((chat) =>
          fetch(`${API_HOST}/chat/${chat._id}/invitation`, { headers: authHeaders() })
            .then((r) => {
              if (!r.ok) return null
              return r.json().then((d) => {
                console.log(`[invitation] chat=${chat._id} (${chat.group_name}) →`, JSON.stringify(d))
                return d
              })
            })
            .catch(() => null),
        ),
      )

      for (let i = 0; i < list.length; i++) {
        const chat = list[i]
        const invData = invChecks[i].status === 'fulfilled' ? invChecks[i].value : null

        // Flatten invitation list from various response shapes
        let invList = []
        if (Array.isArray(invData)) {
          invList = invData
        } else if (invData?.invitations) {
          invList = invData.invitations
        } else if (invData?.data) {
          invList = invData.data
        } else if (invData?.pending) {
          invList = invData.pending
        }

        // Does MY id appear as a pending invitation in this chat?
        // Entries can be: a string ID, { _id }, { userId }, { id }, { user: { _id } }
        const isPending = myId && invList.some((inv) => {
          if (!inv) return false
          if (typeof inv === 'string') return inv === myId
          const id = (
            inv._id ??
            inv.userId ??
            inv.id ??
            inv.user?._id ??
            inv.user?.id ??
            ''
          ).toString()
          return id === myId
        })

        if (isPending) {
          pendingInvites.push({
            _id: myId,        // used as requestId in PATCH /invitation/:requestId
            chat_id: chat._id,
            chat,
            group_name: chat.group_name,
          })
        } else {
          confirmedChats.push(chat)
        }
      }

      chats.value = confirmedChats
      chatInvitations.value = pendingInvites
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

  /** Get the pending invitation list for a specific chat */
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

  // ─── Invitations ─────────────────────────────────────────────────────────────

  /** Invite any user (friend or not) by their MongoDB _id */
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

  /** Resolve username → _id via /users search, then invite */
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

  /** accept = true | false */
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

  // ─── Membership ──────────────────────────────────────────────────────────────

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
        console.log(`[leaveChat] ${url} → ${response.status}`, body)

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

  // ─── Messages ────────────────────────────────────────────────────────────────

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
        console.error('[sendMessage]', response.status, errMsg, data)
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

  /** Delete a chat entirely (owner only) — called when leaveChat returns a 403 */
  async function deleteChat(chatId) {
    try {
      const response = await fetch(`${API_HOST}/chat/${chatId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      let body = {}
      try { body = await response.clone().json() } catch {}
      console.log(`[deleteChat] /chat/${chatId} → ${response.status}`, body)
      if (response.ok) {
        chats.value = chats.value.filter((c) => c._id !== chatId)
        await getMyChats()
        return { success: true, message: 'Chat deleted.' }
      }
      return { success: false, message: body.message ?? body.error ?? `Error ${response.status}` }
    } catch (e) {
      console.error('[deleteChat]', e)
      return { success: false, message: 'Network error.' }
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
    deleteChat,
    sendMessage,
    getMessages,
  }
})
