import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || '')
  
  const isLoggedIn = computed(() => !!token.value && !!user.value)
  
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    token.value = res.data.token
    user.value = res.data.user
    localStorage.setItem('token', res.data.token)
    return res.data.user
  }
  
  const logout = () => {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
  }
  
  const fetchProfile = async () => {
    const res = await api.get('/users/profile')
    user.value = res.data.user
    return res.data
  }
  
  const updateProfile = async (data) => {
    const res = await api.put('/users/profile', data)
    user.value = res.data
    return res.data
  }
  
  return {
    user,
    token,
    isLoggedIn,
    login,
    logout,
    fetchProfile,
    updateProfile
  }
})
