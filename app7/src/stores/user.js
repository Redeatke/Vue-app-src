import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
    // Simulated DB of all registered users
    const users = ref([])

    // Currently logged-in user (null if not logged in)
    const currentUser = ref(null)

    const isLoggedIn = computed(() => currentUser.value !== null)

    function createAccount(username, password) {
        // Check if username already exists
        const exists = users.value.find((u) => u.username === username)
        if (exists) {
            return { success: false, message: 'Username already exists' }
        }

        users.value.push({
            username,
            password,
            friends: [],
            pending: [],
        })

        return { success: true, message: 'Account created successfully' }
    }

    function signIn(username, password) {
        const user = users.value.find(
            (u) => u.username === username && u.password === password,
        )
        if (!user) {
            return { success: false, message: 'Invalid username or password' }
        }

        currentUser.value = user
        return { success: true }
    }

    function signOut() {
        currentUser.value = null
    }

    function sendFriendRequest(targetUsername) {
        if (!currentUser.value) {
            return { success: false, message: 'You must be logged in' }
        }

        if (targetUsername === currentUser.value.username) {
            return { success: false, message: "You can't add yourself" }
        }

        const targetUser = users.value.find((u) => u.username === targetUsername)
        if (!targetUser) {
            return { success: false, message: 'User not found' }
        }

        // Check if already friends
        if (currentUser.value.friends.includes(targetUsername)) {
            return { success: false, message: 'Already friends' }
        }

        // Check if request already pending
        if (targetUser.pending.includes(currentUser.value.username)) {
            return { success: false, message: 'Friend request already sent' }
        }

        // Add current user to target's pending array
        targetUser.pending.push(currentUser.value.username)
        return { success: true, message: 'Friend request sent' }
    }

    function acceptFriendRequest(fromUsername) {
        if (!currentUser.value) {
            return { success: false, message: 'You must be logged in' }
        }

        const index = currentUser.value.pending.indexOf(fromUsername)
        if (index === -1) {
            return { success: false, message: 'No pending request from this user' }
        }

        // Remove from pending
        currentUser.value.pending.splice(index, 1)

        // Add to both users' friends lists
        currentUser.value.friends.push(fromUsername)

        const fromUser = users.value.find((u) => u.username === fromUsername)
        if (fromUser) {
            fromUser.friends.push(currentUser.value.username)
        }

        return { success: true, message: 'Friend request accepted' }
    }

    return {
        users,
        currentUser,
        isLoggedIn,
        createAccount,
        signIn,
        signOut,
        sendFriendRequest,
        acceptFriendRequest,
    }
})
