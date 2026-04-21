<script setup>
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useChatStore } from '@/stores/chat'
import { useUserStore } from '@/stores/user'

const chatStore = useChatStore()
const userStore = useUserStore()
const route = useRoute()

const onFriendsPath = computed(() =>
  route.path.startsWith('/main/friends') || route.path.startsWith('/main/profile'),
)

const onHome = computed(() => route.path === '/main')

onMounted(async () => {
  await chatStore.getMyChats()
})
</script>

<template>
  <div class="main-view">
    <div class="sidebar">

      <!-- Home: show both friends AND group chats -->
      <template v-if="onHome">
        <div class="sidebar-section">
          <h4>Friends</h4>
          <ul v-if="userStore.currentUser?.friends?.length > 0">
            <li
              v-for="friend in userStore.currentUser.friends"
              :key="friend._id || friend.userId || friend.username"
            >
              <span class="sidebar-label">{{ friend.username || friend }}</span>
            </li>
          </ul>
          <p v-else class="empty">No friends yet</p>
        </div>
        <div class="sidebar-section">
          <h4>Group Chats</h4>
          <ul v-if="chatStore.chats.length > 0">
            <li v-for="chat in chatStore.chats" :key="chat._id">
              <RouterLink :to="`/main/groups/${chat._id}`">{{ chat.group_name }}</RouterLink>
            </li>
          </ul>
          <p v-else class="empty">No chats yet</p>
        </div>
      </template>

      <!-- Friends / Profile: show friends only -->
      <template v-else-if="onFriendsPath">
        <div class="sidebar-section">
          <h4>Your Friends</h4>
          <ul v-if="userStore.currentUser?.friends?.length > 0">
            <li
              v-for="friend in userStore.currentUser.friends"
              :key="friend._id || friend.userId || friend.username"
            >
              <span class="sidebar-label">{{ friend.username || friend }}</span>
            </li>
          </ul>
          <p v-else class="empty">No friends yet</p>
        </div>
      </template>

      <!-- Chats: show group chats only -->
      <template v-else>
        <div class="sidebar-section">
          <h4>Group Chats</h4>
          <ul v-if="chatStore.chats.length > 0">
            <li v-for="chat in chatStore.chats" :key="chat._id">
              <RouterLink :to="`/main/groups/${chat._id}`">{{ chat.group_name }}</RouterLink>
            </li>
          </ul>
          <p v-else class="empty">No chats yet</p>
        </div>
      </template>

    </div>

    <div class="content">
      <RouterView />
      <div v-if="$route.path === '/main'" class="choose-prompt">
        <p>Select a chat or go to <RouterLink to="/main/groups">Chats</RouterLink> to create one</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-view {
  display: flex;
  height: 100%;
  color: #fff;
  /* no padding-top — let the navbar border sit flush, spacing comes from section padding */
}
.sidebar {
  width: 200px;
  border-right: 1px solid #ff3333;
  background-color: #111;
  padding: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  flex-shrink: 0;
}
.sidebar-section {
  padding: 10px;
  border-bottom: 1px solid #1e1e1e;
}
.sidebar-section h4 {
  margin: 0 0 6px;
  color: #ff3333;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.sidebar-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.sidebar-section li {
  margin-bottom: 3px;
}
/* Clickable chat links */
.sidebar-section a {
  text-decoration: none;
  color: #ccc;
  font-size: 13px;
  display: block;
  padding: 4px 5px;
  border-radius: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: background 0.15s, color 0.15s;
}
.sidebar-section a:hover,
.sidebar-section a.router-link-active {
  color: #ff3333;
  background-color: rgba(255, 51, 51, 0.1);
}
/* Static text labels (friends) */
.sidebar-label {
  font-size: 13px;
  color: #ccc;
  display: block;
  padding: 4px 5px;
}
.empty {
  font-size: 12px;
  color: #555;
  font-style: italic;
  padding: 2px 5px;
}
.content {
  flex: 1;
  overflow: hidden;
  background-color: #0a0a0a;
  display: flex;
  flex-direction: column;
  padding: 0 10px;
}
.choose-prompt {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #555;
  font-style: italic;
  text-align: center;
}
.choose-prompt a {
  color: #ff3333;
  text-decoration: underline;
}
</style>
