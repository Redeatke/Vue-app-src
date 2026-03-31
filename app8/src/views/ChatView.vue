<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useMessagesStore } from '@/stores/messages'

const route = useRoute()
const userStore = useUserStore()
const messagesStore = useMessagesStore()

const newMessage = ref('')

const friendUsername = computed(() => route.params.friendUsername)

const messages = computed(() =>
  messagesStore.getConversation(
    userStore.currentUser?.username,
    friendUsername.value,
  ),
)

function sendMessage() {
  const text = newMessage.value.trim()
  if (!text) return

  messagesStore.sendMessage(
    userStore.currentUser.username,
    friendUsername.value,
    text,
  )
  newMessage.value = ''
}
</script>

<template>
  <div class="chat-view">
    <h3>Chat with {{ friendUsername }}</h3>

    <div class="messages">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        class="message"
        :class="{ mine: msg.from === userStore.currentUser?.username }"
      >
        <strong>{{ msg.from }}:</strong> {{ msg.text }}
      </div>
      <p v-if="messages.length === 0" class="empty">No messages yet. Say hello!</p>
    </div>

    <div class="send-area">
      <input
        v-model="newMessage"
        placeholder="Type a message..."
        @keyup.enter="sendMessage"
      />
      <button @click="sendMessage">Send</button>
    </div>
  </div>
</template>

<style scoped>
.chat-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  color: #fff;
}
.chat-view h3 {
  margin: 0 0 10px;
  color: #ff3333;
}
.messages {
  flex: 1;
  overflow-y: auto;
  border: 1px solid #333;
  background-color: #111;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
}
.message {
  margin-bottom: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  background-color: #222;
  width: fit-content;
  max-width: 80%;
}
.message strong {
  color: #ccc;
  font-size: 0.9em;
  display: block;
  margin-bottom: 2px;
}
.message.mine {
  margin-left: auto;
  background-color: #400; /* dark red for own messages */
  border: 1px solid #700;
}
.message.mine strong {
  color: #ff8888;
}
.empty {
  color: #666;
  text-align: center;
  margin-top: 20px;
}
.send-area {
  display: flex;
  gap: 8px;
}
.send-area input {
  flex: 1;
  padding: 10px;
  background-color: #222;
  border: 1px solid #444;
  color: #fff;
  border-radius: 20px;
  outline: none;
}
.send-area input:focus {
  border-color: #ff3333;
}
.send-area button {
  padding: 8px 20px;
  cursor: pointer;
  background-color: #ff3333;
  color: #fff;
  border: none;
  border-radius: 20px;
  font-weight: bold;
}
.send-area button:hover {
  background-color: #ff0000;
}
</style>
