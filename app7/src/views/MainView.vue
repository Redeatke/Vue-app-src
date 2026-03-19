<script setup>
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
</script>

<template>
  <div class="main-view">
    <div class="sidebar">
      <div class="sidebar-section">
        <h4>Friends</h4>
        <ul v-if="userStore.currentUser?.friends.length > 0">
          <li
            v-for="friend in userStore.currentUser.friends"
            :key="friend"
          >
            <RouterLink :to="`/main/chat/${friend}`">{{ friend }}</RouterLink>
          </li>
        </ul>
        <p v-else class="empty">No friends yet</p>
      </div>
    </div>

    <div class="content">
      <RouterView />
      <div
        v-if="$route.path === '/main'"
        class="choose-prompt"
      >
        <p>Choose a friend to chat with</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-view {
  display: flex;
  height: 100%;
  color: #fff;
}
.sidebar {
  width: 200px;
  border-right: 1px solid #ff3333;
  background-color: #111;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.sidebar-section h4 {
  margin: 0 0 6px;
  color: #ff3333;
}
.sidebar-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.sidebar-section li {
  margin-bottom: 4px;
}
.sidebar-section a {
  text-decoration: none;
  color: #ccc;
}
.sidebar-section a:hover,
.sidebar-section a.router-link-active {
  color: #ff3333;
  text-decoration: underline;
}
.empty {
  font-size: 12px;
  color: #666;
}
.content {
  flex: 1;
  padding: 10px;
  background-color: #0a0a0a;
}
.choose-prompt {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #666;
  font-style: italic;
}
</style>
