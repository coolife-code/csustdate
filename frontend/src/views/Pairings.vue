<template>
  <div class="min-h-screen bg-white">
    <header class="border-b border-border">
      <div class="max-w-5xl mx-auto px-md py-md flex justify-between items-center">
        <h1 class="text-2xl font-serif font-semibold">配对管理</h1>
        <nav class="flex gap-lg">
          <router-link to="/match" class="text-text-secondary hover:text-primary transition">本周匹配</router-link>
          <router-link to="/questionnaire" class="text-text-secondary hover:text-primary transition">问卷</router-link>
          <router-link to="/profile" class="text-text-secondary hover:text-primary transition">个人资料</router-link>
        </nav>
      </div>
    </header>
    <main class="max-w-5xl mx-auto px-md py-xl space-y-xl">
      <section class="border border-border p-xl">
        <h2 class="text-xl font-semibold mb-md">当前配对</h2>
        <div v-if="loadingActive" class="text-text-muted">加载中...</div>
        <div v-else-if="!activePairing">暂无活跃配对</div>
        <div v-else class="space-y-sm">
          <p>昵称：{{ activePairing.match_user?.nickname || '未填写' }}</p>
          <p>姓名：{{ activePairing.match_user?.name || '未填写' }}</p>
          <p>邮箱：{{ activePairing.match_user?.email || '未填写' }}</p>
          <p>微信：{{ activePairing.match_user?.wechat || '未填写' }}</p>
          <p>QQ：{{ activePairing.match_user?.qq || '未填写' }}</p>
          <p>电话：{{ activePairing.match_user?.phone || '未填写' }}</p>
          <button @click="endCurrentPairing" class="mt-md px-lg py-sm border border-border hover:bg-gray-50">解除配对</button>
        </div>
      </section>

      <section class="border border-border p-xl">
        <h2 class="text-xl font-semibold mb-md">历史配对</h2>
        <div v-if="loadingHistory" class="text-text-muted">加载中...</div>
        <div v-else-if="history.length === 0">暂无历史配对记录</div>
        <div v-else class="space-y-md">
          <div v-for="item in history" :key="item.id" class="border border-border p-md">
            <p>对象：{{ item.match_user?.nickname || item.match_user?.name || '未填写' }}</p>
            <p>状态：{{ item.status }}</p>
            <p>创建时间：{{ formatTime(item.created_at) }}</p>
            <p v-if="item.ended_at">结束时间：{{ formatTime(item.ended_at) }}</p>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api'

const activePairing = ref(null)
const history = ref([])
const loadingActive = ref(true)
const loadingHistory = ref(true)

const formatTime = (time) => {
  if (!time) {
    return '-'
  }
  return new Date(time).toLocaleString()
}

const loadActivePairing = async () => {
  loadingActive.value = true
  try {
    const res = await api.get('/pairings/active')
    activePairing.value = res.data?.pairing || null
  } finally {
    loadingActive.value = false
  }
}

const loadHistory = async () => {
  loadingHistory.value = true
  try {
    const res = await api.get('/pairings/history')
    history.value = res.data.pairings || []
  } finally {
    loadingHistory.value = false
  }
}

const endCurrentPairing = async () => {
  if (!activePairing.value) {
    return
  }
  try {
    await api.post(`/pairings/${activePairing.value.id}/end`)
    await Promise.all([loadActivePairing(), loadHistory()])
    alert('配对已解除')
  } catch (error) {
    alert(error.error?.message || '解除失败')
  }
}

onMounted(() => {
  loadActivePairing()
  loadHistory()
})
</script>
