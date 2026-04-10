<template>
  <div class="min-h-screen bg-white">
    <header class="border-b border-border">
      <div class="max-w-6xl mx-auto px-md py-md flex justify-between items-center">
        <h1 class="text-2xl font-serif font-semibold">CSUST DateDrop</h1>
        <nav class="flex gap-lg items-center">
          <router-link to="/questionnaire" class="text-text-secondary hover:text-primary transition">我的问卷</router-link>
          <router-link to="/match" class="text-text-secondary hover:text-primary transition">本周匹配</router-link>
          <router-link to="/pairings" class="text-text-secondary hover:text-primary transition">我的配对</router-link>
          <button @click="logout" class="text-text-secondary hover:text-primary transition">退出</button>
        </nav>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-md py-2xl">
      <h2 class="text-3xl font-serif font-semibold mb-2xl">个人资料</h2>

      <form @submit.prevent="handleSave" class="space-y-2xl">
        <div class="border border-border p-xl">
          <h3 class="text-xl font-semibold mb-lg">基本信息</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-lg">
            <div>
              <label class="block text-sm font-semibold mb-sm">昵称</label>
              <input
                v-model="form.nickname"
                type="text"
                placeholder="将用于匹配展示与匹配邮件"
                class="w-full px-md py-sm border border-border focus:border-primary focus:outline-none transition"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold mb-sm">姓名</label>
              <input
                v-model="form.name"
                type="text"
                placeholder="仅双向解锁后可见"
                class="w-full px-md py-sm border border-border focus:border-primary focus:outline-none transition"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold mb-sm">性别</label>
              <select
                v-model="form.gender"
                class="w-full px-md py-sm border border-border focus:border-primary focus:outline-none transition"
              >
                <option value="">请选择</option>
                <option value="male">男</option>
                <option value="female">女</option>
                <option value="other">其他</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-semibold mb-sm">校区</label>
              <select
                v-model="form.campus"
                class="w-full px-md py-sm border border-border focus:border-primary focus:outline-none transition"
              >
                <option value="">请选择</option>
                <option value="云塘校区">云塘校区</option>
                <option value="金盆岭校区">金盆岭校区</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-semibold mb-sm">学院</label>
              <select
                v-model="form.college"
                class="w-full px-md py-sm border border-border focus:border-primary focus:outline-none transition"
              >
                <option value="">请选择</option>
                <option v-for="college in colleges" :key="college.id" :value="college.name">
                  {{ college.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-semibold mb-sm">专业</label>
              <input
                v-model="form.major"
                type="text"
                class="w-full px-md py-sm border border-border focus:border-primary focus:outline-none transition"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold mb-sm">年级</label>
              <select
                v-model="form.grade"
                class="w-full px-md py-sm border border-border focus:border-primary focus:outline-none transition"
              >
                <option value="">请选择</option>
                <option v-for="grade in grades" :key="grade.id" :value="grade.name">
                  {{ grade.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="mt-lg">
            <label class="block text-sm font-semibold mb-sm">个人简介</label>
            <textarea
              v-model="form.bio"
              rows="4"
              maxlength="500"
              placeholder="介绍一下自己吧..."
              class="w-full px-md py-sm border border-border focus:border-primary focus:outline-none transition resize-none"
            ></textarea>
            <p class="text-xs text-text-muted mt-xs">{{ form.bio.length }}/500</p>
          </div>
        </div>

        <div class="border border-border p-xl">
          <h3 class="text-xl font-semibold mb-lg">联系方式（双向解锁后可见）</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-lg">
            <div>
              <label class="block text-sm font-semibold mb-sm">微信号</label>
              <input
                v-model="form.wechat"
                type="text"
                class="w-full px-md py-sm border border-border focus:border-primary focus:outline-none transition"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold mb-sm">QQ号</label>
              <input
                v-model="form.qq"
                type="text"
                class="w-full px-md py-sm border border-border focus:border-primary focus:outline-none transition"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold mb-sm">手机号</label>
              <input
                v-model="form.phone"
                type="text"
                class="w-full px-md py-sm border border-border focus:border-primary focus:outline-none transition"
              />
            </div>
          </div>
        </div>

        <div class="border border-border p-xl">
          <h3 class="text-xl font-semibold mb-lg">匹配偏好</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-lg">
            <div>
              <label class="block text-sm font-semibold mb-sm">期望性别</label>
              <select
                v-model="form.preferredGender"
                class="w-full px-md py-sm border border-border focus:border-primary focus:outline-none transition"
              >
                <option value="both">都可以</option>
                <option value="male">男</option>
                <option value="female">女</option>
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-md bg-primary text-white font-semibold hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {{ loading ? '保存中...' : '保存' }}
        </button>
      </form>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import api from '@/api'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const colleges = ref([])
const grades = ref([])

const form = ref({
  nickname: '',
  name: '',
  gender: '',
  campus: '',
  college: '',
  major: '',
  grade: '',
  bio: '',
  wechat: '',
  qq: '',
  phone: '',
  preferredGender: 'both'
})

const loadColleges = async () => {
  try {
    const res = await api.get('/users/colleges')
    colleges.value = res.data.colleges
  } catch (error) {
    console.error('加载学院列表失败', error)
  }
}

const loadGrades = async () => {
  try {
    const res = await api.get('/users/grades')
    grades.value = res.data.grades
  } catch (error) {
    console.error('加载年级列表失败', error)
  }
}

const loadProfile = async () => {
  if (userStore.user) {
    Object.assign(form.value, userStore.user)
  }
  try {
    const res = await userStore.fetchProfile()
    Object.assign(form.value, res.user)
    if (res.preferences) {
      form.value.preferredGender = res.preferences.preferred_gender || 'both'
    }
  } catch (error) {
    console.error('加载用户资料失败', error)
    if (userStore.user) {
      Object.assign(form.value, userStore.user)
    }
  }
}

const handleSave = async () => {
  loading.value = true
  try {
    await userStore.updateProfile(form.value)
    alert('保存成功')
  } catch (error) {
    alert(error.error?.message || '保存失败')
  } finally {
    loading.value = false
  }
}

const logout = () => {
  userStore.logout()
  router.push('/login')
}

onMounted(() => {
  loadColleges()
  loadGrades()
  loadProfile()
})
</script>
