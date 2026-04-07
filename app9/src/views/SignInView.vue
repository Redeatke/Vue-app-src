<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import ToggleSwitch from '@/components/ToggleSwitch.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const username = ref('')
const password = ref('')
const errorMessage = ref('')
const showPassword = ref(false)
const isLoading = ref(false)

// Show success message if redirected from Create Account
const justRegistered = route.query.registered === 'true'

async function signIn() {
  errorMessage.value = ''
  isLoading.value = true

  const result = await userStore.signIn(username.value, password.value)

  isLoading.value = false

  if (result.success) {
    router.push('/main')
  } else {
    errorMessage.value = result.message
  }
}
</script>

<template>
  <div class="sign-in-view">
    <h2>Sign In</h2>

    <p v-if="justRegistered" class="success-message">
      An account has been created. Please log in.
    </p>

    <div class="form-item">
      <label for="username">Username</label>
      <input id="username" v-model="username" />
    </div>

    <div class="form-item">
      <label for="password">Password</label>
      <div class="password-wrapper">
        <input id="password" :type="showPassword ? 'text' : 'password'" v-model="password" @keyup.enter="signIn" />
        <div class="toggle-container">
          <ToggleSwitch v-model="showPassword" />
          <span class="toggle-label">Show</span>
        </div>
      </div>
    </div>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <button :disabled="isLoading" @click="signIn">
      {{ isLoading ? 'Signing in...' : 'Sign In' }}
    </button>

  </div>
</template>

<style scoped>
.sign-in-view {
  max-width: 300px;
  margin: 60px auto;
  color: #fff;
}
h2 {
  color: #ff3333;
}
.success-message {
  color: #4caf50;
  font-size: 13px;
  margin-bottom: 20px;
  background-color: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.3);
  padding: 10px 12px;
  border-radius: 4px;
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
.error {
  color: #ff4444;
  font-size: 13px;
  margin-top: 5px;
  margin-bottom: 12px;
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
