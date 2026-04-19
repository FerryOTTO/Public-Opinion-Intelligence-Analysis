import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { LoginUserProfile } from '@/api/auth'

const storedProfileRaw = localStorage.getItem('user_profile')
const storedProfile = storedProfileRaw ? (JSON.parse(storedProfileRaw) as LoginUserProfile) : null
const storedToken = localStorage.getItem('user_token') || ''
const storedLoggedIn = localStorage.getItem('user_logged_in') === '1'
const storedLoginMeta = localStorage.getItem('user_login_meta') || ''

export const useUserStore = defineStore('user', () => {
  const profile = ref<LoginUserProfile | null>(storedProfile)
  const token = ref(storedToken)
  const loggedIn = ref(storedLoggedIn)
  const loginMeta = ref(storedLoginMeta)

  const userName = computed(() => profile.value?.displayName || profile.value?.username || '管理员')

  const login = (userProfile: LoginUserProfile, authToken: string, metaText: string) => {
    profile.value = userProfile
    token.value = authToken
    loggedIn.value = true
    loginMeta.value = metaText
    localStorage.setItem('user_profile', JSON.stringify(userProfile))
    localStorage.setItem('user_name', userProfile.displayName)
    localStorage.setItem('user_token', authToken)
    localStorage.setItem('user_login_meta', metaText)
    localStorage.setItem('user_logged_in', '1')
  }

  const logout = () => {
    loggedIn.value = false
    token.value = ''
    loginMeta.value = ''
    profile.value = null
    localStorage.removeItem('user_logged_in')
    localStorage.removeItem('user_name')
    localStorage.removeItem('user_profile')
    localStorage.removeItem('user_token')
    localStorage.removeItem('user_login_meta')
  }

  return { profile, token, loggedIn, loginMeta, userName, login, logout }
})
