<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMessageStore } from '@/stores/messages.js'

const router = useRouter()
const store = useMessageStore()

const currentUser = ref(null)
const newMessageText = ref('')
const messagesContainer = ref(null)

onMounted(() => {
    const saved = localStorage.getItem('currentUser')
    if (!saved) {
        router.push('/')
        return
    }
    currentUser.value = JSON.parse(saved)
    scrollToBottom()
})

function isOwnMessage(msg) {
    return currentUser.value && msg.username === currentUser.value.username
}

async function sendMessage() {
    const text = newMessageText.value.trim()
    if (!text || !currentUser.value) return

    store.addMessage(
        currentUser.value.username,
        currentUser.value.firstName,
        currentUser.value.lastName,
        text,
    )
    newMessageText.value = ''
    await nextTick()
    scrollToBottom()
}

function redact(index) {
    if (currentUser.value) {
        store.redactMessage(index, currentUser.value.username)
    }
}

function unredact(index) {
    if (currentUser.value) {
        store.unredactMessage(index, currentUser.value.username)
    }
}

function scrollToBottom() {
    if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
}

function logout() {
    localStorage.removeItem('currentUser')
    router.push('/')
}
</script>

<template>
    <div class="view" v-if="currentUser">
        <div class="profile">
            <h1>{{ currentUser.firstName }} {{ currentUser.lastName }}</h1>
            <button @click="logout">Logout</button>
        </div>

        <div class="messages">
            <div class="messages-area" ref="messagesContainer">
                <div v-for="(msg, index) in store.messages" :key="index"
                     class="message" :class="{ own: isOwnMessage(msg), redacted: msg.redacted }">
                    <span class="author">{{ msg.firstName }}:</span>
                    <span class="text">{{ msg.message }}</span>
                    <span class="actions" v-if="isOwnMessage(msg)">
                        <button v-if="!msg.redacted" @click="redact(index)">Redact</button>
                        <button v-else @click="unredact(index)">Unredact</button>
                    </span>
                </div>
            </div>

            <div class="input-area">
                <input v-model="newMessageText" type="text" placeholder="Type a message..."
                       @keyup.enter="sendMessage">
                <button :disabled="!newMessageText.trim()" @click="sendMessage">Send</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.view {
    height: 100%;
    width: 100%;
    background-color: #efeded;
    display: flex;
    justify-content: center;
    gap: 20px;
}
.profile {
    padding: 20px;
    align-content: start;
    flex: 0 0 200px;
}
.profile h1 {
    font-size: 1.2em;
    color: #333;
    margin-bottom: 12px;
}
.profile button {
    padding: 6px 14px;
    border: 1px solid #bbb;
    border-radius: 6px;
    background: #fff;
    color: #555;
    cursor: pointer;
    font-size: 0.85em;
}
.profile button:hover {
    background: #eee;
}
.messages {
    padding: 20px;
    background-color: #f5f2f2;
    flex: 1 0;
    display: flex;
    flex-direction: column;
}
.messages-area {
    flex: 1;
    overflow-y: auto;
    max-height: 70vh;
    display: flex;
    flex-direction: column;
    gap: 8px;
}
.message {
    padding: 10px 14px;
    background-color: #e2e0e0;
    border-radius: 10px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    line-height: 1.4;
}
.message.own {
    background-color: #c8e6c9;
    text-align: right;
}
.message.redacted {
    opacity: 0.6;
    border: 1px dashed #999;
}
.author {
    font-weight: bold;
    margin-right: 5px;
    font-size: 0.85em;
    color: #555;
}
.text {
    display: inline;
}
.message.redacted .text {
    font-style: italic;
    color: #666;
}
.actions {
    margin-left: 10px;
}
.actions button {
    font-size: 0.72em;
    padding: 3px 10px;
    border: 1px solid #bbb;
    border-radius: 4px;
    background: #fff;
    cursor: pointer;
}
.actions button:hover {
    background: #eee;
}
.input-area {
    margin-top: 12px;
    display: flex;
    gap: 10px;
}
.input-area input {
    flex: 1;
    padding: 10px 12px;
    border: 1px solid #bbb;
    border-radius: 6px;
    font-size: 0.95em;
    outline: none;
}
.input-area input:focus {
    border-color: #2c6fbb;
}
.input-area button {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    background-color: #2c6fbb;
    color: #fff;
    font-size: 0.9em;
    cursor: pointer;
}
.input-area button:hover:not(:disabled) {
    background-color: #245a9e;
}
.input-area button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>
