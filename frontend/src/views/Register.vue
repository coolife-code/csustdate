<template>
  <div class="min-h-screen bg-white flex flex-col">
    <header class="border-b border-border">
      <div class="max-w-md mx-auto px-md py-md">
        <router-link to="/" class="text-2xl font-serif font-semibold">CSUST DateDrop</router-link>
      </div>
    </header>

    <main class="flex-1 flex items-center justify-center px-md py-2xl">
      <div class="w-full max-w-md">
        <h2 class="text-3xl font-serif font-semibold text-center mb-md">创建账号</h2>
        
        <div class="flex justify-center mb-2xl">
          <div class="flex items-center gap-sm">
            <div 
              v-for="step in 3" 
              :key="step"
              class="flex items-center"
            >
              <div 
                :class="[
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold',
                  currentStep >= step ? 'bg-primary text-white' : 'bg-surface text-text-muted'
                ]"
              >
                {{ step }}
              </div>
              <div v-if="step < 3" class="w-12 h-0.5 mx-sm" :class="currentStep > step ? 'bg-primary' : 'bg-border'"></div>
            </div>
          </div>
        </div>

        <form @submit.prevent="handleNext">
          <div v-if="currentStep === 1" class="space-y-lg">
            <h3 class="text-xl font-semibold mb-lg">验证邮箱</h3>
            
            <div>
              <label class="block text-sm font-semibold mb-sm">教育邮箱</label>
              <div class="flex">
                <input
                  v-model.trim="form.emailPrefix"
                  type="text"
                  placeholder="student"
                  required
                  class="flex-1 px-md py-sm border border-border border-r-0 focus:border-primary focus:outline-none transition"
                />
                <span class="px-md py-sm border border-border bg-surface text-text-secondary select-none">@csust.edu.cn</span>
              </div>
              <p class="text-xs text-text-muted mt-xs">必须使用长沙理工大学教育邮箱</p>
            </div>

            <div>
              <label class="block text-sm font-semibold mb-sm">验证码</label>
              <div class="flex gap-sm">
                <input
                  v-model="form.code"
                  type="text"
                  maxlength="6"
                  placeholder="6位验证码"
                  required
                  class="flex-1 px-md py-sm border border-border focus:border-primary focus:outline-none transition"
                />
                <button
                  type="button"
                  @click="sendCode"
                  :disabled="countdown > 0"
                  class="px-md py-sm bg-surface text-text-primary hover:bg-border disabled:opacity-50 disabled:cursor-not-allowed transition whitespace-nowrap"
                >
                  {{ countdown > 0 ? `${countdown}秒后重试` : '获取验证码' }}
                </button>
              </div>
            </div>
          </div>

          <div v-if="currentStep === 2" class="space-y-lg">
            <h3 class="text-xl font-semibold mb-lg">设置密码</h3>
            
            <div>
              <label class="block text-sm font-semibold mb-sm">密码</label>
              <input
                v-model="form.password"
                type="password"
                placeholder="至少8位，包含字母和数字"
                required
                class="w-full px-md py-sm border border-border focus:border-primary focus:outline-none transition"
              />
            </div>

          </div>

          <div v-if="currentStep === 3" class="space-y-lg">
            <h3 class="text-xl font-semibold mb-lg">基本信息</h3>
            
            <div>
              <label class="block text-sm font-semibold mb-sm">昵称</label>
              <input
                v-model.trim="form.nickname"
                type="text"
                placeholder="请输入昵称（将用于匹配邮件展示）"
                required
                class="w-full px-md py-sm border border-border focus:border-primary focus:outline-none transition"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold mb-sm">性别</label>
              <div class="flex gap-lg">
                <label class="flex items-center cursor-pointer">
                  <input v-model="form.gender" type="radio" value="male" class="mr-sm" />
                  <span>男</span>
                </label>
                <label class="flex items-center cursor-pointer">
                  <input v-model="form.gender" type="radio" value="female" class="mr-sm" />
                  <span>女</span>
                </label>
                <label class="flex items-center cursor-pointer">
                  <input v-model="form.gender" type="radio" value="other" class="mr-sm" />
                  <span>其他</span>
                </label>
              </div>
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

          </div>

          <div class="flex gap-md mt-2xl">
            <button
              v-if="currentStep > 1"
              type="button"
              @click="currentStep--"
              class="flex-1 py-md border border-primary text-primary font-semibold hover:bg-surface transition"
            >
              上一步
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="flex-1 py-md bg-primary text-white font-semibold hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {{ loading ? '处理中...' : (currentStep === 3 ? '完成注册' : '下一步') }}
            </button>
          </div>

          <p class="text-center text-text-secondary mt-lg">
            已有账号？
            <router-link to="/login" class="text-primary font-semibold hover:underline">立即登录</router-link>
          </p>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import api from '@/api'

const router = useRouter()
const userStore = useUserStore()

const currentStep = ref(1)
const loading = ref(false)
const countdown = ref(0)

const form = ref({
  emailPrefix: '',
  code: '',
  password: '',
  nickname: '',
  gender: '',
  campus: ''
})

const sendCode = async () => {
  if (!form.value.emailPrefix || form.value.emailPrefix.includes('@')) {
    alert('请输入正确的邮箱前缀')
    return
  }
  const email = `${form.value.emailPrefix}@csust.edu.cn`

  try {
    await api.post('/auth/send-code', {
      email,
      type: 'register'
    })
    
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
    
    alert('验证码已发送到您的邮箱')
  } catch (error) {
    alert(error.error?.message || '验证码发送失败')
  }
}

const handleNext = async () => {
  if (currentStep.value === 1) {
    if (!form.value.code) {
      alert('请输入验证码')
      return
    }
    currentStep.value = 2
  } else if (currentStep.value === 2) {
    if (form.value.password.length < 8) {
      alert('密码至少8位')
      return
    }
    currentStep.value = 3
  } else {
    await handleRegister()
  }
}

const handleRegister = async () => {
  loading.value = true
  try {
    const email = `${form.value.emailPrefix}@csust.edu.cn`
    const res = await api.post('/auth/register', {
      email,
      nickname: form.value.nickname,
      gender: form.value.gender || null,
      campus: form.value.campus || null,
      password: form.value.password,
      code: form.value.code
    })
    
    localStorage.setItem('token', res.data.token)
    userStore.token = res.data.token
    userStore.user = res.data.user
    await userStore.fetchProfile()
    router.push('/questionnaire')
  } catch (error) {
    alert(error.error?.message || '注册失败')
  } finally {
    loading.value = false
  }
}
</script>
