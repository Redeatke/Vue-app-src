import { reactive } from 'vue'
import { defineStore } from 'pinia'

export const useMessagesStore = defineStore('messages', () => {
    // Conversations keyed by sorted user-pair string e.g. "alice:bob"
    const conversations = reactive({})

    function getConversationKey(userA, userB) {
        return [userA, userB].sort().join(':')
    }

    function getConversation(userA, userB) {
        const key = getConversationKey(userA, userB)
        return conversations[key] || []
    }

    function sendMessage(from, to, text) {
        const key = getConversationKey(from, to)
        if (!conversations[key]) {
            conversations[key] = []
        }
        conversations[key].push({
            from,
            text,
            timestamp: Date.now(),
        })
    }

    return {
        conversations,
        getConversation,
        sendMessage,
    }
})
