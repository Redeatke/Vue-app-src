import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

const API_HOST = 'https://stingray-app-u3bsh.ondigitalocean.app'

export const useUserStore = defineStore('user', () => {
    const currentUser = ref(null)
    const authToken = ref(localStorage.getItem('authToken') || null)
    const friendRequests = ref([])

    const isLoggedIn = computed(() => currentUser.value !== null)

    // ── Account ───────────────────────────────────────────────────────────────

    async function createAccount(userData) {
        try {
            const response = await fetch(API_HOST + '/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            })

            if (!response.ok) {
                const result = await response.json()
                const messages = []

                if (result.code === 11000 || result.errorResponse?.code === 11000) {
                    const key = result.keyValue || result.errorResponse?.keyValue || {}
                    messages.push(key.username ? `Username "${key.username}" is already taken.` : 'Account already exists.')
                } else if (result.errors) {
                    Object.entries(result.errors).forEach(([field, e]) => {
                        const label = field.charAt(0).toUpperCase() + field.slice(1)
                        const msg = (e.message || e).replace(/^Path `[^`]+` /, '')
                        messages.push(`${label}: ${msg}`)
                    })
                } else {
                    messages.push(result.message || 'An unknown error occurred.')
                }

                return { success: false, errors: messages }
            }

            return { success: true }
        } catch {
            return { success: false, errors: ['Network error. Please try again.'] }
        }
    }

    // ── Auth ──────────────────────────────────────────────────────────────────

    async function signIn(username, password) {
        try {
            const response = await fetch(API_HOST + '/user/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            })

            if (!response.ok) return { success: false, message: 'Invalid username or password' }

            const result = await response.json()
            currentUser.value = result.user
            authToken.value = result.authToken
            localStorage.setItem('authToken', result.authToken)
            localStorage.setItem('username', result.user.username)

            return { success: true }
        } catch {
            return { success: false, message: 'Network error. Please try again.' }
        }
    }

    function signOut() {
        currentUser.value = null
        authToken.value = null
        friendRequests.value = []
        localStorage.removeItem('authToken')
        localStorage.removeItem('username')
    }

    // ── Friends ───────────────────────────────────────────────────────────────

    function authHeaders() {
        return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken.value}` }
    }

    async function getUser() {
        try {
            const response = await fetch(API_HOST + '/user', { headers: authHeaders() })
            if (response.ok) currentUser.value = await response.json()
        } catch {}
    }

    async function sendFriendRequest(username) {
        try {
            const searchRes = await fetch(`${API_HOST}/users?search=${encodeURIComponent(username)}`, { headers: authHeaders() })
            const searchData = await searchRes.json()
            const target = (searchData?.users || []).find(u => u.username === username)

            if (!target) return { success: false, message: `User "${username}" not found.` }

            const response = await fetch(`${API_HOST}/friend-request/${target._id}`, { method: 'POST', headers: authHeaders() })
            const data = await response.json()
            if (!response.ok) return { success: false, message: data.message || 'Failed to send request.' }
            return { success: true, message: `Friend request sent to ${username}!` }
        } catch {
            return { success: false, message: 'Network error. Please try again.' }
        }
    }

    async function getFriendRequests() {
        try {
            const response = await fetch(API_HOST + '/friend-requests', { headers: authHeaders() })
            if (response.ok) friendRequests.value = await response.json()
        } catch {}
    }

    async function respondToFriendRequest(requestId, accept) {
        try {
            const response = await fetch(`${API_HOST}/friend-request/${requestId}?accept=${accept}`, { method: 'PATCH', headers: authHeaders() })
            if (response.ok) {
                await getFriendRequests()
                await getUser()
            }
            return { success: response.ok, message: response.ok ? (accept ? 'Friend added!' : 'Request declined.') : 'Failed.' }
        } catch {
            return { success: false, message: 'Network error.' }
        }
    }

    return {
        currentUser,
        authToken,
        friendRequests,
        isLoggedIn,
        createAccount,
        signIn,
        signOut,
        getUser,
        sendFriendRequest,
        getFriendRequests,
        respondToFriendRequest,
    }
})
