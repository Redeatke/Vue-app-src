<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import ToggleSwitch from '@/components/ToggleSwitch.vue'

const router = useRouter()
const userStore = useUserStore()

const username = ref('')
const password = ref('')
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const apiErrors = ref([])
const showPassword = ref(false)
const isLoading = ref(false)

async function createAccount() {
  apiErrors.value = []
  isLoading.value = true

  const result = await userStore.createAccount({
    username: username.value,
    password: password.value,
    firstName: firstName.value,
    lastName: lastName.value,
    email: email.value,
  })

  isLoading.value = false

  if (result.success) {
    // Redirect to Sign In with a success flag
    router.push({ path: '/sign-in', query: { registered: 'true' } })
  } else {
    apiErrors.value = result.errors || ['An unknown error occurred.']
  }
}
</script>

<template>
  <div class="create-account-view">
    <h2>Create Account</h2>

    <div class="form-item">
      <label for="username">Username</label>
      <input id="username" v-model="username" />
    </div>

    <div class="form-item">
      <label for="password">Password</label>
      <div class="password-wrapper">
        <input id="password" :type="showPassword ? 'text' : 'password'" v-model="password" />
        <div class="toggle-container">
          <ToggleSwitch v-model="showPassword" />
          <span class="toggle-label">Show</span>
        </div>
      </div>
    </div>

    <div class="form-item">
      <label for="firstName">First Name</label>
      <input id="firstName" v-model="firstName" />
    </div>

    <div class="form-item">
      <label for="lastName">Last Name</label>
      <input id="lastName" v-model="lastName" />
    </div>

    <div class="form-item">
      <label for="email">Email</label>
      <input id="email" v-model="email" type="email" />
    </div>

    <ul v-if="apiErrors.length > 0" class="api-errors">
      <li v-for="(err, index) in apiErrors" :key="index">{{ err }}</li>
    </ul>

    <button :disabled="isLoading" @click="createAccount">
      {{ isLoading ? 'Creating...' : 'Create' }}
    </button>

  </div>
</template>

<style scoped>
.create-account-view {
  max-width: 300px;
  margin: 60px auto;
  color: #fff;
}
h2 {
  color: #ff3333;
}
.form-item {
  margin-bottom: 20px;
}
.form-item label {
  display: block;
  margin-bottom: 4px;
}
.form-item input {
  width: 100%;
  box-sizing: border-box;
  padding: 8px;
  background-color: #222;
  border: 1px solid #444;
  color: #fff;
  border-radius: 4px;
}
.password-wrapper {
  position: relative;
}
.toggle-container {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}
.toggle-label {
  font-size: 12px;
  color: #aaa;
}
.api-errors {
  color: #ff4444;
  font-size: 13px;
  padding-left: 16px;
  margin: 0 0 16px;
}
.api-errors li {
  margin-bottom: 4px;
}
button {
  padding: 10px 16px;
  width: 100%;
  cursor: pointer;
  background-color: #ff3333;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-weight: bold;
}
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #666;
}
button:hover:not(:disabled) {
  background-color: #ff0000;
}
</style>
