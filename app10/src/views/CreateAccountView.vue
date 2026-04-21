<script setup>
import { ref, computed } from 'vue'
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

const usernameReqs = computed(() => {
  const u = username.value
  return {
    length: u.length >= 5 && u.length <= 16,
    letterStart: /^[a-zA-Z]/.test(u),
    alphanumeric: /^[a-zA-Z0-9]+$/.test(u) && u.length > 0
  }
})

const passwordReqs = computed(() => {
  const p = password.value
  return {
    length: p.length >= 8 && p.length <= 64,
    upper: /[A-Z]/.test(p),
    lower: /[a-z]/.test(p),
    number: /[0-9]/.test(p),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(p)
  }
})

const emailValid = computed(() => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)
})

const isFormValid = computed(() => {
  const uValid = Object.values(usernameReqs.value).every(Boolean)
  const pValid = Object.values(passwordReqs.value).every(Boolean)
  return uValid && pValid &&
         firstName.value.trim() !== '' &&
         lastName.value.trim() !== '' &&
         emailValid.value
})

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
  <div class="create-account-container">
    <div class="create-account-form">
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

      <button :disabled="isLoading || !isFormValid" @click="createAccount">
        {{ isLoading ? 'Creating...' : 'Create' }}
      </button>
    </div>

    <div class="requirements-panel">
      <h4>Requirements</h4>
      <div class="req-section">
        <h5>Profile Info</h5>
        <ul>
          <li :class="firstName.trim() ? 'req-met' : 'req-unmet'">First name is required</li>
          <li :class="lastName.trim() ? 'req-met' : 'req-unmet'">Last name is required</li>
          <li :class="emailValid ? 'req-met' : 'req-unmet'">Email is required</li>
        </ul>
      </div>
      <div class="req-section">
        <h5>Username</h5>
        <ul>
          <li :class="usernameReqs.length ? 'req-met' : 'req-unmet'">5&ndash;16 characters</li>
          <li :class="usernameReqs.letterStart ? 'req-met' : 'req-unmet'">Must begin with a letter</li>
          <li :class="usernameReqs.alphanumeric ? 'req-met' : 'req-unmet'">Only letters and numbers allowed</li>
        </ul>
      </div>
      <div class="req-section">
        <h5>Password</h5>
        <ul>
          <li :class="passwordReqs.length ? 'req-met' : 'req-unmet'">8&ndash;64 characters</li>
          <li :class="passwordReqs.upper ? 'req-met' : 'req-unmet'">1 uppercase letter</li>
          <li :class="passwordReqs.lower ? 'req-met' : 'req-unmet'">1 lowercase letter</li>
          <li :class="passwordReqs.number ? 'req-met' : 'req-unmet'">1 number</li>
          <li :class="passwordReqs.special ? 'req-met' : 'req-unmet'">1 special character</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.create-account-container {
  display: flex;
  justify-content: center;
  align-items: stretch;
  gap: 30px;
  max-width: 800px;
  margin: 60px auto;
  padding: 0 20px;
}
.create-account-form {
  flex: 1;
  max-width: 320px;
  color: #fff;
  background-color: #111;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 24px;
}
.create-account-form h2 {
  margin-top: 0;
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

/* Requirements Panel */
.requirements-panel {
  flex: 1;
  max-width: 320px;
  background-color: #111;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 24px;
}
.requirements-panel h4 {
  margin: 0 0 16px;
  color: #ff3333;
  font-size: 15px;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.req-section {
  margin-bottom: 20px;
}
.req-section:last-child {
  margin-bottom: 0;
}
.req-section h5 {
  margin: 0 0 8px;
  color: #eee;
  font-size: 14px;
}
.req-section ul {
  margin: 0;
  padding-left: 18px;
  font-size: 13px;
  line-height: 1.6;
}
.req-section li {
  margin-bottom: 4px;
  transition: color 0.3s ease;
}
.req-met {
  color: #4caf50;
  list-style-type: none;
  position: relative;
}
.req-met::before {
  content: '✓ ';
  position: absolute;
  left: -16px;
  color: #4caf50;
}
.req-unmet {
  color: #ff5555;
}

@media (max-width: 700px) {
  .create-account-container {
    flex-direction: column;
    align-items: center;
  }
}

</style>
