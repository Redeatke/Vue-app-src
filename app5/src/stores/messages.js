import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Message } from '@/models/Message.js'
import simulationMessages from '@/data/messages.js'

export const useMessageStore = defineStore('messages', () => {
    const messages = ref([...simulationMessages])

    function addMessage(username, firstName, lastName, text) {
        messages.value.push(new Message(username, firstName, lastName, text))
    }

    function redactMessage(index, username) {
        const msg = messages.value[index]
        if (msg && msg.username === username && !msg.redacted) {
            msg._originalText = msg.message
            msg.message = '[REDACTED]'
            msg.redacted = true
        }
    }

    function unredactMessage(index, username) {
        const msg = messages.value[index]
        if (msg && msg.username === username && msg.redacted && msg._originalText) {
            msg.message = msg._originalText
            msg._originalText = null
            msg.redacted = false
        }
    }

    return { messages, addMessage, redactMessage, unredactMessage }
})
