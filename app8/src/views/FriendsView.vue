<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const friendUsername = ref('')
const feedback = ref('')
const isLoading = ref(false)

onMounted(() => {
  userStore.getFriendRequests()
})

async function addFriend() {
  const target = friendUsername.value.trim()
  if (!target) return

  isLoading.value = true
  feedback.value = ''
  const result = await userStore.sendFriendRequest(target)
  feedback.value = result.message
  isLoading.value = false

  if (result.success) {
    friendUsername.value = ''
  }
}

async function respondToRequest(requestId, accept) {
  const result = await userStore.respondToFriendRequest(requestId, accept)
  feedback.value = result.message
}
</script>

<template>
  <div class="friends-view">
    <h3>Friends</h3>

    <div class="section">
      <h4>Add Friend</h4>
      <div class="add-friend">
        <input
          v-model="friendUsername"
          placeholder="Enter username"
          @keyup.enter="addFriend"
        />
        <button @click="addFriend" :disabled="isLoading">
          {{ isLoading ? '...' : 'Add' }}
        </button>
      </div>
      <p v-if="feedback" class="feedback">{{ feedback }}</p>
    </div>

    <div class="section">
      <h4>Pending Requests</h4>
      <ul v-if="userStore.friendRequests.length > 0">
        <li
          v-for="req in userStore.friendRequests"
          :key="req._id"
        >
          <span>{{ req.sender?.username || req.sender_name || req.sender_id }}</span>
          <div class="request-actions">
            <button class="accept-btn" @click="respondToRequest(req._id || req.id, true)">Accept</button>
            <button class="decline-btn" @click="respondToRequest(req._id || req.id, false)">Decline</button>
          </div>
        </li>
      </ul>
      <p v-else class="empty">No pending requests</p>
    </div>

    <div class="section">
      <h4>Your Friends</h4>
      <ul v-if="userStore.currentUser?.friends?.length > 0">
        <li
          v-for="friend in userStore.currentUser.friends"
          :key="friend._id || friend.userId || friend.username"
        >
          {{ friend.username || friend }}
        </li>
      </ul>
      <p v-else class="empty">No friends yet</p>
    </div>
  </div>
</template>


<style scoped>
.friends-view {
  color: #fff;
}
.friends-view h3 {
  margin: 0 0 15px;
  color: #ff3333;
}
.section {
  margin-bottom: 24px;
  background-color: #111;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #333;
}
.section h4 {
  margin: 0 0 10px;
  color: #ccc;
}
.add-friend {
  display: flex;
  gap: 8px;
}
.add-friend input {
  flex: 1;
  padding: 8px 12px;
  background-color: #222;
  border: 1px solid #444;
  color: #fff;
  border-radius: 4px;
  outline: none;
}
.add-friend input:focus {
  border-color: #ff3333;
}
.add-friend button {
  padding: 8px 16px;
  cursor: pointer;
  background-color: #ff3333;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-weight: bold;
}
.add-friend button:hover {
  background-color: #ff0000;
}
.feedback {
  font-size: 13px;
  color: #ffaa00;
  margin-top: 8px;
}
ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #333;
}
li:last-child {
  border-bottom: none;
}
.request-actions {
  display: flex;
  gap: 6px;
}
li button {
  font-size: 12px;
  cursor: pointer;
  background-color: #333;
  color: #fff;
  border: 1px solid #555;
  padding: 4px 10px;
  border-radius: 4px;
}
.accept-btn:hover, .accept-btn {
  background-color: #1a7a3a;
  border-color: #1a7a3a;
}
.accept-btn:hover {
  background-color: #22a34d;
}
.decline-btn {
  background-color: #333;
  border-color: #555;
}
.decline-btn:hover {
  background-color: #ff3333;
  border-color: #ff3333;
}
.empty {
  font-size: 13px;
  color: #666;
  font-style: italic;
}
</style>
