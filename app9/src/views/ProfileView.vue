<script setup>
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const store = useUserStore()

// Refresh user data when profile is viewed
onMounted(async () => {
  await store.getUser()
})
</script>

<template>
  <div class="profile-page">
    <!-- Avatar + username header -->
    <div class="profile-header">
      <div class="avatar">
        {{ store.currentUser?.username?.charAt(0).toUpperCase() }}
      </div>
      <div class="header-info">
        <h1 class="username">{{ store.currentUser?.username }}</h1>
      </div>
    </div>

    <!-- Info cards -->
    <div class="info-grid">
      <div class="info-card">
        <div class="card-label">Full Name</div>
        <div class="card-value">{{ [store.currentUser?.firstName, store.currentUser?.lastName].filter(Boolean).join(' ') || '—' }}</div>
      </div>
      <div class="info-card">
        <div class="card-label">Email</div>
        <div class="card-value">{{ store.currentUser?.email || '—' }}</div>
      </div>
      <div class="info-card wide">
        <div class="card-label">Friends <span class="count">({{ store.currentUser?.friends?.length || 0 }})</span></div>
        <div v-if="store.currentUser?.friends?.length > 0" class="friends-list">
          <div
            v-for="friend in store.currentUser.friends"
            :key="friend._id || friend.username || friend"
            class="friend-chip"
          >
            <div class="friend-avatar">
              {{ (friend.username || friend).charAt(0).toUpperCase() }}
            </div>
            <span>{{ friend.username || friend }}</span>
          </div>
        </div>
        <p v-else class="empty">No friends yet.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  padding: 30px;
  color: #fff;
  max-width: 700px;
  margin: 0 auto;
}

/* Header */
.profile-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(255, 51, 51, 0.3);
}

.avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff3333, #990000);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 800;
  color: #fff;
  flex-shrink: 0;
  box-shadow: 0 0 20px rgba(255, 51, 51, 0.4);
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.username {
  font-size: 26px;
  font-weight: 700;
  margin: 0;
  color: #fff;
}

.badge {
  display: inline-block;
  background-color: rgba(255, 51, 51, 0.15);
  color: #ff3333;
  border: 1px solid rgba(255, 51, 51, 0.4);
  border-radius: 999px;
  padding: 2px 10px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  width: fit-content;
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.info-card {
  background-color: #1a1a1a;
  border: 1px solid rgba(255, 51, 51, 0.2);
  border-radius: 12px;
  padding: 18px 20px;
  transition: border-color 0.2s ease;
}

.info-card:hover {
  border-color: rgba(255, 51, 51, 0.5);
}

.info-card.wide {
  grid-column: 1 / -1;
}

.card-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #ff3333;
  margin-bottom: 8px;
}

.card-value {
  font-size: 16px;
  color: #eee;
  word-break: break-all;
}

.count {
  color: #888;
  font-weight: 400;
}

/* Friends list */
.friends-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 4px;
}

.friend-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #222;
  border: 1px solid rgba(255, 51, 51, 0.25);
  border-radius: 999px;
  padding: 6px 14px 6px 6px;
  font-size: 14px;
  color: #ccc;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.friend-chip:hover {
  background-color: rgba(255, 51, 51, 0.1);
  border-color: rgba(255, 51, 51, 0.5);
  color: #fff;
}

.friend-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff3333, #660000);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}

.empty {
  font-size: 13px;
  color: #555;
  font-style: italic;
  margin: 4px 0 0;
}
</style>
