import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import LandingView from '@/views/LandingView.vue'
import CreateAccountView from '@/views/CreateAccountView.vue'
import SignInView from '@/views/SignInView.vue'
import MainView from '@/views/MainView.vue'
import ChatView from '@/views/ChatView.vue'
import FriendsView from '@/views/FriendsView.vue'

// Reactive route error message — used by App.vue to display invalid route feedback
import { ref } from 'vue'
export const routeError = ref('')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: LandingView,
    },
    {
      path: '/create-account',
      name: 'createAccount',
      component: CreateAccountView,
    },
    {
      path: '/sign-in',
      name: 'signIn',
      component: SignInView,
    },
    {
      path: '/main',
      name: 'main',
      component: MainView,
      children: [
        {
          path: 'chat/:friendUsername',
          name: 'chat',
          component: ChatView,
        },
        {
          path: 'friends',
          name: 'friends',
          component: FriendsView,
        },
      ],
    },
  ],
})

router.beforeEach((to, from) => {
  const userStore = useUserStore()

  // Invalid route handling — cancel navigation and show error
  if (!to.matched.length) {
    routeError.value = `"${to.fullPath}" is not a valid route`
    setTimeout(() => {
      routeError.value = ''
    }, 3000)
    return false
  }

  // Auth guard — redirect to sign-in if not logged in
  if (to.path.startsWith('/main') && !userStore.isLoggedIn) {
    return { name: 'signIn' }
  }

  // Redirect logged-in users away from auth pages
  const authPages = ['/', '/create-account', '/sign-in']
  if (authPages.includes(to.path) && userStore.isLoggedIn) {
    return { name: 'main' }
  }
})

export default router
