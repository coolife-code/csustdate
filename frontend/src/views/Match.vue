<template>
  <div class="min-h-screen bg-white">
    <header class="border-b border-border">
      <div class="max-w-4xl mx-auto px-md py-md flex justify-between items-center">
        <h1 class="text-2xl font-serif font-semibold">本周匹配</h1>
        <nav class="flex gap-lg">
          <router-link to="/questionnaire" class="text-text-secondary hover:text-primary transition">问卷</router-link>
          <router-link to="/pairings" class="text-text-secondary hover:text-primary transition">我的配对</router-link>
          <router-link to="/profile" class="text-text-secondary hover:text-primary transition">个人资料</router-link>
        </nav>
      </div>
    </header>
    <main class="max-w-4xl mx-auto px-md py-xl">
      <div v-if="loading" class="text-center text-text-muted">加载中...</div>
      <div v-else-if="!match" class="border border-border p-xl text-center space-y-md">
        <p>本周暂未生成匹配，先完善问卷可提升匹配成功率。</p>
        <button @click="runMatch" class="px-lg py-sm bg-primary text-white hover:bg-secondary">立即尝试匹配</button>
      </div>
      <div v-else class="border border-border p-xl space-y-lg">
        <h2 class="text-xl font-semibold">{{ match.match_user?.nickname || '匿名同学' }}</h2>
        <p>匹配分数：{{ match.match_score }}</p>
        <p>学院：{{ match.match_user?.college || '未填写' }}</p>
        <p>专业：{{ match.match_user?.major || '未填写' }}</p>
        <p>年级：{{ match.match_user?.grade || '未填写' }}</p>
        <p>简介：{{ match.match_user?.bio || '暂无' }}</p>
        <div class="flex gap-md">
          <button @click="unlock" :disabled="acting" class="flex-1 py-sm bg-primary text-white hover:bg-secondary disabled:opacity-50">解锁</button>
          <button @click="skip" :disabled="acting" class="flex-1 py-sm border border-border hover:bg-gray-50 disabled:opacity-50">跳过</button>
        </div>
        <p class="text-sm text-text-secondary">当前状态：{{ match.status }}</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api'

const loading = ref(true)
const acting = ref(false)
const match = ref(null)

const loadCurrentMatch = async () => {
  loading.value = true
  try {
    const res = await api.get('/matches/current')
    match.value = res.data?.match || null
  } finally {
    loading.value = false
  }
}

const runMatch = async () => {
  try {
    await api.post('/matches/run')
    await loadCurrentMatch()
  } catch (error) {
    alert(error.error?.message || '触发匹配失败')
  }
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
      alert('你们已双向解锁，联系方式已通过邮件发送')
    }
  } catch (error) {
    alert(error.error?.message || '操作失败')
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
  } catch (error) {
    alert(error.error?.message || '操作失败')
  } finally {
    acting.value = false
  }
}

onMounted(loadCurrentMatch)
</script>
