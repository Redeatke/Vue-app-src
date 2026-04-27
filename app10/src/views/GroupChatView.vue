<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useChatStore } from '@/stores/chat'
import ConfirmModal from '@/components/ConfirmModal.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const chatStore = useChatStore()

const chatId = computed(() => route.params.chatId)

/**
 * Confirmed members only (excludes pending invites)
 */
const displayMembers = computed(() => {
  const me = userStore.currentUser
  const raw = chatInfo.value?.users ?? chatInfo.value?.members ?? []

  // Normalise each member to { key, label }
  const list = raw.map((m) => ({
    key: m.user_id ?? m.userId ?? m._id ?? m.username ?? String(m),
    label: m.username ?? String(m),
  }))

  // If current user is not in the list, prepend them
  if (me && !list.some((m) => m.label === me.username)) {
    list.unshift({ key: me._id ?? me.username, label: me.username })
  }

  return list
})

/** Users who have been invited but haven't accepted yet */
const displayPending = computed(() => {
  return pendingInvitations.value.map((inv) => {
    // Invitation entries can be plain string IDs or objects
    if (typeof inv === 'string') return { key: inv, label: inv }
    const label =
      inv.username ??
      inv.user?.username ??
      inv._id ??
      inv.userId ??
      inv.id ??
      String(inv)
    const key = inv._id ?? inv.userId ?? inv.id ?? label
    return { key, label }
  })
})

const memberCount = computed(() => displayMembers.value.length + displayPending.value.length)

const chatInfo = ref(null)
const pendingInvitations = ref([])

/** True if the logged-in user is the chat owner */
const isOwner = computed(() => {
  const me = userStore.currentUser
  if (!me || !chatInfo.value) return false
  const owner = chatInfo.value.owner ?? chatInfo.value.created_by ?? chatInfo.value.createdBy
  if (!owner) return false
  const ownerId = (typeof owner === 'string' ? owner : owner.user_id ?? owner._id ?? owner.id ?? '').toString()
  const ownerUsername = typeof owner === 'object' ? (owner.username ?? '') : ''
  const myId = (me._id ?? me.id ?? '').toString()
  return myId === ownerId || me.username === ownerUsername
})

const messages = ref([])
const newMessage = ref('')
const inviteUsername = ref('')
const feedback = ref('')
const inviteFeedback = ref('')
const isSending = ref(false)
const isInviting = ref(false)
const isLeaving = ref(false)
const showLeaveModal = ref(false)

let pollInterval = null

onMounted(async () => {
  await loadChat()
  
  // Set up polling every 5 seconds
  pollInterval = setInterval(async () => {
    await loadChat()
  }, 5000)
})

onUnmounted(() => {
  if (pollInterval) {
    clearInterval(pollInterval)
  }
})

async function loadChat() {
  // Try API first; fall back to locally cached chat data so name still shows
  const fromApi = await chatStore.getChatInfo(chatId.value)
  if (fromApi) {
    chatInfo.value = fromApi
  } else {
    // Use data from the local chats list if available
    const cached = chatStore.chats.find((c) => c._id === chatId.value)
    chatInfo.value = cached ?? null
  }
  // Fetch pending invitations so we can show who's been invited
  pendingInvitations.value = await chatStore.getChatPendingInvitations(chatId.value)
  messages.value = await chatStore.getMessages(chatId.value, 100, 0)
  
  // Background fetch all users so we have usernames mapped for people who left the chat
  userStore.fetchAllUsers()
}

async function sendMessage() {
  const text = newMessage.value.trim()
  if (!text) return
  isSending.value = true
  const result = await chatStore.sendMessage(chatId.value, text)
  if (result.success) {
    newMessage.value = ''
    // Refresh messages from server
    messages.value = await chatStore.getMessages(chatId.value, 100, 0)
  } else {
    feedback.value = result.message
  }
  isSending.value = false
}

async function inviteUser() {
  const name = inviteUsername.value.trim()
  if (!name) return
  isInviting.value = true
  inviteFeedback.value = ''
  const result = await chatStore.inviteUserByUsername(chatId.value, name)
  inviteFeedback.value = result.message
  if (result.success) {
    inviteUsername.value = ''
    // Reload chat info so the members panel reflects the newly invited user
    await loadChat()
  }
  isInviting.value = false
}

async function leaveChat() {
  isLeaving.value = true
  feedback.value = ''
  const result = await chatStore.leaveChat(chatId.value)
  if (result.success) {
    router.push('/main/groups')
  } else {
    feedback.value = result.message
    isLeaving.value = false
  }
}

/** Resolve a raw sender value (ID string, object, or username) → display username */
function resolveSender(raw) {
  if (!raw) return null
  // Already an object with username
  if (typeof raw === 'object' && raw.username) return raw.username
  // It's a string — could be an _id or a username
  const me = userStore.currentUser
  if (me && (raw === me._id || raw === me.id || raw === me.username)) return me.username
  // Try to match against chat members
  const members = chatInfo.value?.users ?? chatInfo.value?.members ?? []
  const found = members.find((m) => m.user_id === raw || m._id === raw || m.id === raw || m.userId === raw || m.username === raw)
  if (found) return found.username ?? found
  // Fall back to the user store cache in case the user has left the chat
  if (typeof raw === 'string' && userStore.userCache[raw]) return userStore.userCache[raw]
  // Last resort — return as-is (real usernames pass through, IDs show shortened)
  return raw
}

function myMessage(msg) {
  const sender = resolveSender(msg.sender ?? msg.from)
  return sender === userStore.currentUser?.username
}

function senderName(msg) {
  return resolveSender(msg.sender ?? msg.from) ?? 'Unknown'
}

function formatTime(msg) {
  const ts = msg.timestamp || msg.createdAt || msg.created_at
  if (!ts) return ''
  const date = new Date(ts)
  if (isNaN(date.getTime())) return ''
  return date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="group-chat-view">

    <div class="chat-header">
      <div class="header-left">
        <button class="back-btn" @click="router.push('/main/groups')">← Groups</button>
        <div>
          <h3>{{ chatInfo?.group_name ?? 'Group Chat' }}</h3>
          <span class="member-pill">{{ memberCount }} member{{ memberCount === 1 ? '' : 's' }}</span>
        </div>
      </div>
      <button v-if="!isOwner" class="leave-btn" @click="showLeaveModal = true" :disabled="isLeaving">
        {{ isLeaving ? '…' : 'Leave Chat' }}
      </button>
    </div>

    <div class="body">

      <div class="messages-panel">
        <div class="messages">
          <p v-if="messages.length === 0" class="empty">No messages yet. Say something!</p>
          <div
            v-for="(msg, i) in messages"
            :key="msg._id ?? i"
            class="message"
            :class="{ mine: myMessage(msg) }"
          >
            <div class="message-header">
              <strong>{{ senderName(msg) }}</strong>
              <span v-if="formatTime(msg)" class="timestamp">{{ formatTime(msg) }}</span>
            </div>
            <span class="message-body">{{ msg.message ?? msg.text ?? msg.content }}</span>
          </div>
        </div>

        <p v-if="feedback" class="feedback">{{ feedback }}</p>

        <div class="send-area">
          <input
            v-model="newMessage"
            placeholder="Type a message…"
            @keyup.enter="sendMessage"
          />
          <button @click="sendMessage" :disabled="isSending || !newMessage.trim()">Send</button>
        </div>
      </div>


      <div class="sidebar">
        <!-- Members -->
        <div class="sidebar-section">
          <h4>Members</h4>
          <ul>
            <li v-for="m in displayMembers" :key="m.key">
              <div class="member-avatar">{{ m.label.charAt(0).toUpperCase() }}</div>
              <span>{{ m.label }}</span>
            </li>
            <li v-for="m in displayPending" :key="'p-' + m.key" class="pending-member">
              <div class="member-avatar pending-avatar">{{ m.label.charAt(0).toUpperCase() }}</div>
              <span>{{ m.label }} <em class="pending-tag">pending</em></span>
            </li>
          </ul>
          <p v-if="displayMembers.length === 0 && displayPending.length === 0" class="empty-members">No members</p>
        </div>

        <!-- Invite -->
        <div class="sidebar-section">
          <h4>Invite User</h4>
          <div class="invite-row">
            <input
              v-model="inviteUsername"
              placeholder="Username…"
              @keyup.enter="inviteUser"
            />
            <button @click="inviteUser" :disabled="isInviting || !inviteUsername.trim()">
              {{ isInviting ? '…' : 'Invite' }}
            </button>
          </div>
          <p v-if="inviteFeedback" class="feedback">{{ inviteFeedback }}</p>
        </div>
      </div>
    </div>
  </div>

  <ConfirmModal
    v-model="showLeaveModal"
    message="Are you sure you want to leave this chat?"
    confirmLabel="Leave Chat"
    @confirmed="leaveChat"
  />
</template>

<style scoped>
.group-chat-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  color: #fff;
}

/* Header */
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background-color: #111;
  border-bottom: 1px solid #ff3333;
  flex-shrink: 0;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.chat-header h3 {
  margin: 0;
  font-size: 1.05rem;
  color: #fff;
}
.back-btn {
  background: transparent;
  border: 1px solid #555;
  color: #ccc;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: border-color 0.2s, color 0.2s;
}
.back-btn:hover {
  border-color: #ff3333;
  color: #ff3333;
}
.member-pill {
  font-size: 11px;
  color: #666;
}
.leave-btn {
  background: transparent;
  border: 1px solid #ff3333;
  color: #ff3333;
  padding: 5px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: background 0.2s, color 0.2s;
}
.leave-btn:hover {
  background-color: #ff3333;
  color: #fff;
}
.leave-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Body layout */
.body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* Messages panel */
.messages-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 10px;
  overflow: hidden;
}
.messages {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  background-color: #0d0d0d;
  border: 1px solid #222;
  border-radius: 8px;
  margin-bottom: 10px;
}
.message {
  display: flex;
  flex-direction: column;
  gap: 2px;
  background-color: #1a1a1a;
  border-radius: 8px;
  padding: 8px 12px;
  width: fit-content;
  max-width: 75%;
}
.message-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
}
.message strong {
  font-size: 0.8em;
  color: #888;
}
.timestamp {
  font-size: 0.7em;
  color: #666;
  white-space: nowrap;
}
.message-body {
  font-size: 0.95em;
  color: #eee;
}
.message.mine {
  align-self: flex-end;
  background-color: #3a0000;
  border: 1px solid #700;
}
.message.mine strong {
  color: #ff8888;
}
.message.mine .timestamp {
  color: #aa6666;
}
.empty {
  color: #555;
  font-style: italic;
  text-align: center;
  margin: auto;
}

/* Send area */
.send-area {
  display: flex;
  gap: 8px;
}
.send-area input {
  flex: 1;
  padding: 10px 14px;
  background-color: #1a1a1a;
  border: 1px solid #444;
  color: #fff;
  border-radius: 20px;
  outline: none;
  font-size: 14px;
}
.send-area input:focus {
  border-color: #ff3333;
}
.send-area button {
  padding: 8px 20px;
  background-color: #ff3333;
  color: #fff;
  border: none;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}
.send-area button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.send-area button:not(:disabled):hover {
  background-color: #ff0000;
}

/* Sidebar */
.sidebar {
  width: 200px;
  border-left: 1px solid #222;
  background-color: #0a0a0a;
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow-y: auto;
  flex-shrink: 0;
}
.sidebar-section {
  padding: 14px 12px;
  border-bottom: 1px solid #1a1a1a;
}
.sidebar-section h4 {
  margin: 0 0 10px;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #ff3333;
}
/* Members list */
.sidebar-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.sidebar-section li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #ccc;
}
.member-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff3333, #880000);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  color: #fff;
  flex-shrink: 0;
}

/* Invite */
.invite-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.invite-row input {
  padding: 7px 10px;
  background-color: #1a1a1a;
  border: 1px solid #444;
  color: #fff;
  border-radius: 6px;
  outline: none;
  font-size: 13px;
}
.invite-row input:focus {
  border-color: #ff3333;
}
.invite-row button {
  padding: 6px 0;
  background-color: #ff3333;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.2s;
}
.invite-row button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.invite-row button:not(:disabled):hover {
  background-color: #ff0000;
}
.pending-member {
  opacity: 0.65;
}
.pending-avatar {
  background: linear-gradient(135deg, #555, #333) !important;
}
.pending-tag {
  font-size: 10px;
  color: #aaa;
  font-style: italic;
  margin-left: 2px;
}
.empty-members {
  font-size: 12px;
  color: #555;
  font-style: italic;
}
.feedback {
  font-size: 12px;
  color: #ffaa00;
  margin-top: 8px;
}
</style>
