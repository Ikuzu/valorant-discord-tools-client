import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const userId = ref<string | null>(null)
  const userName = ref<string | null>(null)
  const userAvatar = ref<string | null>(null)

  const setAuth = (data: { userId: string; userName: string; userAvatar: string }) => {
    userId.value = data.userId
    userName.value = data.userName
    userAvatar.value = data.userAvatar
  }

  const resetAuth = () => {
    userId.value = null
    userName.value = null
    userAvatar.value = null
  }

  return { userId, userName, userAvatar, setAuth, resetAuth }
})
