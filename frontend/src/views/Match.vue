<template>
  <div class="min-h-screen bg-gradient-to-b from-white to-rose-50/30">
    <header class="border-b border-border bg-white/90 backdrop-blur">
      <div class="max-w-4xl mx-auto px-md py-md flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-serif font-semibold">本周匹配</h1>
          <p class="text-sm text-text-secondary mt-1">不必慌张，无需言说，本期匹配已至</p>
        </div>
        <nav class="flex gap-lg">
          <router-link to="/questionnaire" class="text-text-secondary hover:text-primary transition">问卷</router-link>
          <router-link to="/pairings" class="text-text-secondary hover:text-primary transition">我的配对</router-link>
          <router-link to="/profile" class="text-text-secondary hover:text-primary transition">个人资料</router-link>
        </nav>
      </div>
    </header>
    <main class="max-w-4xl mx-auto px-md py-xl space-y-lg">
      <div class="rounded-2xl border border-border bg-white/85 p-lg shadow-sm">
        <p class="text-sm text-text-secondary">每周二，你的教育邮箱会如约收到一封来信</p>
        <p class="text-sm text-text-secondary mt-1">那是算法悄悄为你觅得的，一个灵魂相近的人</p>
      </div>
      <p v-if="registeredCount !== null" class="text-sm text-text-secondary">
        当前已注册 <span class="font-semibold text-primary">{{ registeredCount }}</span> 人
      </p>
      <div v-if="actionMessage" class="rounded-xl border px-md py-sm text-sm" :class="actionMessage.type === 'error' ? 'border-red-300 bg-red-50 text-red-700' : 'border-emerald-300 bg-emerald-50 text-emerald-700'">
        {{ actionMessage.text }}
      </div>
      <div v-if="loading" class="text-center text-text-muted">加载中...</div>
      <div v-else-if="!match" class="rounded-2xl border border-border bg-white p-xl text-center space-y-md shadow-sm">
        <p>本周暂未生成匹配，先完善问卷会更容易遇见合拍的人。</p>
        <button @click="goFillProfile" class="px-lg py-sm rounded-full bg-primary text-white hover:bg-secondary transition">立即尝试填写</button>
      </div>
      <div v-else class="rounded-2xl border border-border bg-white p-xl space-y-lg shadow-sm">
        <div class="flex items-center justify-between gap-md">
          <h2 class="text-2xl font-semibold">{{ match.match_user?.nickname || '匿名同学' }}</h2>
          <span class="px-sm py-1 rounded-full text-xs border border-border bg-surface text-text-secondary">匹配分数 {{ match.match_score }}</span>
        </div>
        <p class="text-text-secondary leading-relaxed">“{{ match.match_user?.bio || '这个人还没来得及写下自我介绍，也许你们会在聊天里慢慢认识彼此。' }}”</p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-md text-sm">
          <p class="rounded-xl border border-border bg-surface/70 px-md py-sm">学院：{{ match.match_user?.college || '未填写' }}</p>
          <p class="rounded-xl border border-border bg-surface/70 px-md py-sm">专业：{{ match.match_user?.major || '未填写' }}</p>
          <p class="rounded-xl border border-border bg-surface/70 px-md py-sm">年级：{{ match.match_user?.grade || '未填写' }}</p>
        </div>
        <div class="flex gap-md">
          <button @click="unlock" :disabled="acting" class="flex-1 py-sm rounded-full bg-primary text-white hover:bg-secondary disabled:opacity-50 transition">解锁</button>
          <button @click="skip" :disabled="acting" class="flex-1 py-sm rounded-full border border-border hover:bg-gray-50 disabled:opacity-50 transition">暂不解锁</button>
        </div>
        <p class="text-sm text-text-secondary">当前状态：{{ statusLabel }}</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'

const router = useRouter()
const loading = ref(true)
const acting = ref(false)
const match = ref(null)
const registeredCount = ref(null)
const actionMessage = ref('')

const statusLabel = computed(() => {
  if (!match.value?.status) {
    return '待确认'
  }
  if (match.value.status === 'pending') {
    return '等待你的选择'
  }
  if (match.value.status === 'unlocked') {
    return '你已解锁，等待对方回应'
  }
  if (match.value.status === 'paired') {
    return '已双向解锁'
  }
  if (match.value.status === 'skipped') {
    return '你已跳过本次匹配'
  }
  return match.value.status
})

const loadRegisteredCount = async () => {
  try {
    const res = await api.get('/docs/email-register')
    if (typeof res.data?.registered_count === 'number') {
      registeredCount.value = res.data.registered_count
    }
  } catch (error) {
    registeredCount.value = null
  }
}

const loadCurrentMatch = async () => {
  loading.value = true
  try {
    const res = await api.get('/matches/current')
    match.value = res.data?.match || null
  } finally {
    loading.value = false
  }
}

const goFillProfile = () => {
  router.push('/profile')
}

const unlock = async () => {
  if (!match.value) {
    return
  }
  acting.value = true
  try {
    const res = await api.post(`/matches/${match.value.id}/unlock`)
    match.value.status = res.data.status
    if (res.data.pairing_id) {
      actionMessage.value = {
        type: 'success',
        text: '你们已双向解锁，联系方式已通过邮件发送。'
      }
      return
    }
    actionMessage.value = {
      type: 'success',
      text: '已解锁，等对方回应就会收到下一封来信。'
    }
  } catch (error) {
    actionMessage.value = {
      type: 'error',
      text: error.error?.message || '操作失败，请稍后再试'
    }
  } finally {
    acting.value = false
  }
}

const skip = async () => {
  if (!match.value) {
    return
  }
  acting.value = true
  try {
    const res = await api.post(`/matches/${match.value.id}/skip`)
    match.value.status = res.data.status
    actionMessage.value = {
      type: 'success',
      text: '已跳过本次匹配，愿下一次刚好遇见。'
    }
  } catch (error) {
    actionMessage.value = {
      type: 'error',
      text: error.error?.message || '操作失败，请稍后再试'
    }
  } finally {
    acting.value = false
  }
}

onMounted(() => {
  loadCurrentMatch()
  loadRegisteredCount()
})
</script>
