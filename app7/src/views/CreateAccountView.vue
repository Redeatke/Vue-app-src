<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { validateUsername, validatePassword } from '@/utils/validators'
import ToggleSwitch from '@/components/ToggleSwitch.vue'

const router = useRouter()
const userStore = useUserStore()

const username = ref('')
const password = ref('')
const feedback = ref('')
const showPassword = ref(false)

const usernameErrors = computed(() => validateUsername(username.value))
const passwordErrors = computed(() => validatePassword(password.value))

const isValid = computed(
  () => usernameErrors.value.length === 0 && passwordErrors.value.length === 0,
)

function createAccount() {
  if (!isValid.value) return

  const result = userStore.createAccount(username.value, password.value)
  if (result.success) {
    // Auto-login the new user and redirect to main application
    userStore.signIn(username.value, password.value)
    router.push('/main')
  } else {
    feedback.value = result.message
  }
}
</script>

<template>
  <div class="create-account-view">
    <h2>Create Account</h2>

    <div class="form-item">
      <label for="username">Username</label>
      <input id="username" v-model="username" />
      <ul v-if="usernameErrors.length > 0" class="errors">
        <li v-for="msg in usernameErrors" :key="msg">{{ msg }}</li>
      </ul>
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
      <ul v-if="passwordErrors.length > 0" class="errors">
        <li v-for="msg in passwordErrors" :key="msg">{{ msg }}</li>
      </ul>
    </div>

    <p v-if="feedback" class="feedback">{{ feedback }}</p>

    <button :disabled="!isValid" @click="createAccount">Create</button>

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
.errors {
  color: #ff4444;
  font-size: 12px;
  padding-left: 16px;
  margin: 6px 0 0;
}
.feedback {
  color: #ff4444;
  font-size: 13px;
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
.link {
  margin-top: 16px;
  font-size: 13px;
  text-align: center;
}
.link a {
  color: #ff3333;
}
</style>
