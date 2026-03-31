import { defineStore } from 'pinia'
import { reactive } from 'vue'

export const useUserStore = defineStore('userStore', () => ({
  user: reactive({
    username: localStorage.getItem('username')
  })
}))
