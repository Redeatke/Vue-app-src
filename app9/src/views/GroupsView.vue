<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chat'

const chatStore = useChatStore()
const router = useRouter()

const newChatName = ref('')
const createFeedback = ref('')
const isCreating = ref(false)
const inviteFeedback = ref('')

onMounted(async () => {
  await chatStore.getMyChats()
  await chatStore.getInvitations()
})

async function createChat() {
  const name = newChatName.value.trim()
  if (!name) return
  isCreating.value = true
  createFeedback.value = ''
  const result = await chatStore.createChat(name)
  createFeedback.value = result.success ? `"${name}" created!` : result.message
  if (result.success) newChatName.value = ''
  isCreating.value = false
}

async function respond(inv, accept) {
  inviteFeedback.value = ''
  // Determine chatId and requestId from the invitation shape
  const chatId = inv.chat_id ?? inv.chatId ?? inv.chat?._id
  const requestId = inv._id ?? inv.id
  const result = await chatStore.respondToInvitation(chatId, requestId, accept)
  inviteFeedback.value = result.message
}

function openChat(chat) {
  router.push(`/main/groups/${chat._id}`)
}
</script>

<template>
  <div class="groups-view">
    <h3>Group Chats</h3>

    <!-- ── Create Chat ───────────────────────────── -->
    <div class="section">
      <h4>Create a Chat</h4>
      <div class="create-row">
        <input
          v-model="newChatName"
          placeholder="Chat name…"
          @keyup.enter="createChat"
          maxlength="80"
        />
        <button @click="createChat" :disabled="isCreating || !newChatName.trim()">
          {{ isCreating ? '…' : 'Create' }}
        </button>
      </div>
      <p v-if="createFeedback" class="feedback">{{ createFeedback }}</p>
    </div>

    <!-- ── Pending Invitations ──────────────────── -->
    <div class="section">
      <h4>Pending Invitations</h4>
      <ul v-if="chatStore.chatInvitations.length > 0">
        <li v-for="inv in chatStore.chatInvitations" :key="inv._id ?? inv.id">
          <span class="chat-name">{{ inv.chat?.group_name ?? inv.group_name ?? 'Group Chat' }}</span>
          <div class="actions">
            <button class="accept-btn" @click="respond(inv, true)">Accept</button>
            <button class="decline-btn" @click="respond(inv, false)">Decline</button>
          </div>
        </li>
      </ul>
      <p v-else class="empty">No pending invitations</p>
      <p v-if="inviteFeedback" class="feedback">{{ inviteFeedback }}</p>
    </div>

    <!-- ── My Chats ─────────────────────────────── -->
    <div class="section">
      <h4>My Chats</h4>
      <ul v-if="chatStore.chats.length > 0">
        <li
          v-for="chat in chatStore.chats"
          :key="chat._id"
          class="chat-item"
          @click="openChat(chat)"
        >
          <span class="chat-name">{{ chat.group_name }}</span>
        </li>
      </ul>
      <p v-else class="empty">No group chats yet</p>
    </div>
  </div>
</template>

<style scoped>
.groups-view {
  color: #fff;
  padding: 0;
}
.groups-view h3 {
  margin: 0 0 16px;
  color: #ff3333;
  font-size: 1.25rem;
}
.section {
  margin-bottom: 22px;
  background-color: #111;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #333;
}
.section h4 {
  margin: 0 0 12px;
  color: #ccc;
  font-size: 0.92rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
/* Create row */
.create-row {
  display: flex;
  gap: 8px;
}
.create-row input {
  flex: 1;
  padding: 8px 12px;
  background-color: #1a1a1a;
  border: 1px solid #444;
  color: #fff;
  border-radius: 6px;
  outline: none;
  font-size: 14px;
}
.create-row input:focus {
  border-color: #ff3333;
}
.create-row button {
  padding: 8px 18px;
  background-color: #ff3333;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}
.create-row button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.create-row button:not(:disabled):hover {
  background-color: #ff0000;
}
/* Lists */
ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #2a2a2a;
}
li:last-child {
  border-bottom: none;
}
/* Chat item (clickable) */
.chat-item {
  cursor: pointer;
  border-radius: 6px;
  padding: 10px 8px;
  margin: 0 -8px;
  transition: background 0.15s;
}
.chat-item:hover {
  background-color: #1a1a1a;
}
.chat-name {
  font-weight: 600;
  color: #fff;
}
.member-count {
  font-size: 12px;
  color: #666;
}
/* Invitation buttons */
.actions {
  display: flex;
  gap: 6px;
}
.actions button {
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  border: none;
  font-weight: 600;
  transition: background 0.2s;
}
.accept-btn {
  background-color: #1a7a3a;
  color: #fff;
}
.accept-btn:hover {
  background-color: #22a34d;
}
.decline-btn {
  background-color: #333;
  color: #fff;
  border: 1px solid #555 !important;
}
.decline-btn:hover {
  background-color: #ff3333;
  border-color: #ff3333 !important;
}
.feedback {
  font-size: 13px;
  color: #ffaa00;
  margin-top: 10px;
}
.empty {
  font-size: 13px;
  color: #555;
  font-style: italic;
}
</style>
