import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useUserStore } from '@/stores/user'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Restore user session from saved token before mounting so the router
// guard sees isLoggedIn = true and doesn't redirect to sign-in on refresh.
const userStore = useUserStore()
if (userStore.authToken) {
  userStore.getUser().then(() => {
    app.mount('#app')
  })
} else {
  app.mount('#app')
}
