<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import simulationMessages from '@/data/messages.js'

const router = useRouter()

// Extract unique users from simulation data
const users = []
const seen = new Set()
for (const msg of simulationMessages) {
    if (!seen.has(msg.username)) {
        seen.add(msg.username)
        users.push({
            username: msg.username,
            firstName: msg.firstName,
            lastName: msg.lastName,
        })
    }
}

const selectedUser = ref('')

function login() {
    const user = users.find((u) => u.username === selectedUser.value)
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user))
        router.push('/messenger')
    }
}
</script>

<template>
    <div class="view">
        <h1>Login</h1>
        <nav>
            <label for="user-select">Choose a user</label>
            <br>
            <select id="user-select" v-model="selectedUser">
                <option value="" disabled>-- Select a user --</option>
                <option v-for="user in users" :key="user.username" :value="user.username">
                    {{ user.firstName }} {{ user.lastName }}
                </option>
            </select>
            &nbsp;&nbsp;
            <button :disabled="!selectedUser" @click="login">Sign In</button>
        </nav>
    </div>
</template>

<style scoped>
.view {
    height: 100%;
    width: 100%;
    background-color: #efeded;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
.view > * {
    padding: 20px;
}
h1 {
    font-size: 1.4em;
    color: #333;
}
label {
    font-size: 0.9em;
    color: #555;
    margin-bottom: 6px;
    display: inline-block;
}
select {
    padding: 8px 12px;
    border: 1px solid #bbb;
    border-radius: 6px;
    font-size: 0.95em;
    outline: none;
}
select:focus {
    border-color: #2c6fbb;
}
button {
    padding: 8px 18px;
    border: none;
    border-radius: 6px;
    background-color: #2c6fbb;
    color: #fff;
    font-size: 0.9em;
    cursor: pointer;
}
button:hover:not(:disabled) {
    background-color: #245a9e;
}
button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>
