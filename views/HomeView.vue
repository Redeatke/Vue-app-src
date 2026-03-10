<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

const store = useUserStore()
const router = useRouter()

const welcomeName = computed(() => {
  if (store.user.username) {
    const name = store.user.username
    return name.charAt(0).toUpperCase() + name.slice(1)
  } else {
    router.push('/login')
  }
})
</script>

<template>
  <div class="home-view">
    <h1>Welcome {{ welcomeName }}!</h1>
  </div>
</template>

<style scoped>
.home-view {
  box-sizing: border-box;
  padding: 20px;
  background-color: #efeded;
  opacity: 97%;
  display: flex;
  flex-direction: column;
  flex: 1;
}
</style>

