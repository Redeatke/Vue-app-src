<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRoute, useRouter } from 'vue-router'

const store = useUserStore()
const route = useRoute()
const router = useRouter()

const isLoggedIn = computed(() => store.user.username !== null)
const showLoginLink = computed(() => !isLoggedIn.value && route.path !== '/login')
const showLogoutLink = computed(() => isLoggedIn.value && route.path !== '/login')

function logout() {
  localStorage.removeItem('username')
  store.user.username = null
  router.push('/login')
}
</script>

<template>
  <nav>
    <div>
      <RouterLink :class="[{ hidden: !isLoggedIn }, 'link']" to="/home">Home</RouterLink>
    </div>
    <div>
      <RouterLink v-show="showLoginLink" to="/login" class="link">Log in</RouterLink>
      <RouterLink v-show="showLogoutLink" to="/login" class="link">
        <span @click="logout()">Log out</span>
      </RouterLink>
    </div>
  </nav>
</template>

<style scoped>
nav {
  background-color: #dcdcdc;
  padding: 10px;
  display: flex;
  justify-content: space-between;
}
.link {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 999px;
  color: #000;
}
.hidden {
  visibility: hidden;
}
.router-link-active {
  background-color: gray;
  color: #fff;
  transition: background-color 0.25s ease-in, color 0s ease-in 0.25s;
}
</style>
