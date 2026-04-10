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
    const profilePayload = {
      nickname: data.nickname,
      name: data.name,
      gender: data.gender,
      campus: data.campus,
      college: data.college,
      major: data.major,
      grade: data.grade,
      bio: data.bio,
      wechat: data.wechat,
      qq: data.qq,
      phone: data.phone
    }
    const preferencePayload = {
      preferred_gender: data.preferred_gender || data.preferredGender || 'both'
    }
    const [profileRes] = await Promise.all([
      api.put('/users/profile', profilePayload),
      api.put('/users/preferences', preferencePayload)
    ])
    user.value = profileRes.data
    return profileRes.data
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
