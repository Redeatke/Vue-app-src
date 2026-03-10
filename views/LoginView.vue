<script setup>
import { ref, computed, useTemplateRef } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { validateUsername, validatePassword } from '@/utils/validators'
import ToggleSwitch from '@/components/ToggleSwitch.vue'

const router = useRouter()
const store = useUserStore()

const username = ref('')
const password = ref('')
const passwordInput = useTemplateRef('passwordInput')

const usernameErrors = computed(() => validateUsername(username.value))
const passwordErrors = computed(() => validatePassword(password.value))

const subtitle = computed(() =>
  store.user.username ? 'Login with another account' : 'Enter your credentials'
)

function togglePassword(event) {
  const target = event.target
  if (passwordInput.value) {
    passwordInput.value.type = target.checked ? 'text' : 'password'
  }
}

function login() {
  if (usernameErrors.value.length == 0 && passwordErrors.value.length == 0) {
    localStorage.setItem('username', username.value)
    store.user.username = username.value
    router.push('/home')
  }
}
</script>

<template>
  <div class="login-view">
    <div class="login-content">
      <div class="login-form">
        <h1>Let's Go!</h1>
        <h3>{{ subtitle }}</h3>
        <div>
          <div class="form-item">
            <label for="usernameInput">Username</label>
            <input id="usernameInput" v-model="username" />
          </div>
          <div class="form-item">
            <label for="passwordInput">Password</label>
            <ToggleSwitch class="align-right" @change="togglePassword" />
            <input
              type="password"
              id="passwordInput"
              v-model="password"
              ref="passwordInput"
              @keyup.enter="login"
            />
          </div>
        </div>
        <button @click="login">Log in</button>
      </div>
      <div
        class="error-messages"
        :class="{ 'no-width': passwordErrors.length == 0 && usernameErrors.length == 0 }"
      >
        <div v-show="usernameErrors.length > 0">
          <span>Username</span>
          <ul>
            <li v-for="msg in usernameErrors" :key="msg">
              <span>{{ msg }}</span>
            </li>
          </ul>
        </div>
        <div v-show="passwordErrors.length > 0">
          <span>Password</span>
          <ul>
            <li v-for="msg in passwordErrors" :key="msg">
              <span>{{ msg }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-view {
  flex: 1;
  background-color: #efeded;
  opacity: 97%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.login-content {
  display: flex;
  justify-content: center;
  gap: 20px;
}
.login-form {
  background-color: #f8f8f8;
  box-sizing: border-box;
  padding: 20px;
  font-size: small;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 200px;
}
.login-form h1 {
  margin: 0;
}
.login-form h3 {
  text-align: center;
}
.form-item {
  box-sizing: border-box;
  width: 160px;
  margin-bottom: 5px;
}
.form-item > label {
  display: inline-block;
  margin-bottom: 5px;
}
.form-item > input {
  box-sizing: border-box;
  width: 100%;
  margin-bottom: 5px;
}
.align-right {
  float: right;
}
.error-messages {
  align-self: center;
  color: #c70d0d;
  font-size: 12px;
  width: 200px;
  transition: width 1s linear;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.no-width {
  width: 0;
}
ul {
  padding-left: 15px;
  margin: 3px 0 10px;
}
.error-messages span {
  display: inline-block;
  min-width: max-content;
  white-space: nowrap;
}
.login-form > button {
  font-size: medium;
  color: #f8f8f8;
  background-color: #000;
  border-radius: 999px;
  padding: 5px 10px;
  border: 0;
}
.login-form > button:active {
  transform: scale(97%);
}
</style>
