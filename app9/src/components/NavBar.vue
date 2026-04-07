<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRoute, useRouter } from 'vue-router'
import ConfirmModal from '@/components/ConfirmModal.vue'

const store = useUserStore()
const route = useRoute()
const router = useRouter()

const isLoggedIn = computed(() => store.isLoggedIn)
const showSignIn = computed(() => !isLoggedIn.value && route.name !== 'signIn')
const showCreateAccount = computed(() => !isLoggedIn.value && route.name !== 'createAccount')

const showSignOutModal = ref(false)

async function handleSignOut() {
  await store.signOut()
  router.push('/')
}
</script>

<template>
  <nav>
    <div class="nav-left">
      <RouterLink v-if="isLoggedIn" to="/main" class="link">Home</RouterLink>
      <RouterLink v-if="isLoggedIn" to="/main/friends" class="link">Friends</RouterLink>
    </div>
    <div class="nav-right">
      <span v-if="isLoggedIn" class="username">{{ store.currentUser?.username }}</span>
      <button v-if="isLoggedIn" @click="showSignOutModal = true" class="sign-out-btn">Sign Out</button>
      <RouterLink v-if="showSignIn" to="/sign-in" class="link">Sign In</RouterLink>
      <RouterLink v-if="showCreateAccount" to="/create-account" class="link">Create Account</RouterLink>
    </div>
  </nav>

  <ConfirmModal
    v-model="showSignOutModal"
    message="Are you sure you want to sign out?"
    confirmLabel="Sign Out"
    @confirmed="handleSignOut"
  />
</template>

<style scoped>
nav {
  background-color: #111;
  border-bottom: 2px solid #ff3333;
  padding: 10px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.nav-left, .nav-right {
  display: flex;
  align-items: center;
  gap: 10px;
}
.link {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 999px;
  color: #fff;
  text-decoration: none;
  font-weight: bold;
}
.link:hover {
  color: #ff3333;
}
.username {
  font-weight: bold;
  font-size: 14px;
  color: #ff3333;
}
.sign-out-btn {
  font-size: 12px;
  cursor: pointer;
  padding: 5px 10px;
  border: 1px solid #ff3333;
  border-radius: 999px;
  background: transparent;
  color: #fff;
}
.sign-out-btn:hover {
  background-color: #ff3333;
  color: #fff;
}
.router-link-active {
  color: #ff3333;
  background-color: rgba(255, 51, 51, 0.1);
  transition: all 0.25s ease-in;
}
</style>
