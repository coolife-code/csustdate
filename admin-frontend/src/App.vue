<template>
  <div class="page">
    <header class="header">
      <h1>DateDrop 本地管理员面板</h1>
      <p>独立前端，仅用于本地管理，不和用户端页面关联</p>
    </header>

    <section class="card">
      <h2>管理员密钥</h2>
      <div class="row">
        <input v-model="adminKeyInput" class="input" type="password" placeholder="输入 ADMIN_LOCAL_KEY" />
        <button class="btn" @click="saveAdminKey">保存密钥</button>
        <button class="btn btn-secondary" @click="clearAdminKey">清除密钥</button>
      </div>
      <p class="tip">当前状态：{{ hasAdminKey ? '已设置' : '未设置' }}</p>
    </section>

    <nav class="card nav-row">
      <RouterLink class="nav-link" to="/users">用户管理</RouterLink>
      <RouterLink class="nav-link" to="/matches">匹配管理</RouterLink>
      <RouterLink class="nav-link" to="/emails">邮件中心</RouterLink>
    </nav>

    <RouterView />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'

const adminKeyInput = ref(localStorage.getItem('admin_key') || '')
const hasAdminKey = computed(() => Boolean(localStorage.getItem('admin_key')))

const saveAdminKey = () => {
  localStorage.setItem('admin_key', adminKeyInput.value.trim())
  alert('管理员密钥已保存')
}

const clearAdminKey = () => {
  localStorage.removeItem('admin_key')
  adminKeyInput.value = ''
  alert('管理员密钥已清除')
}
</script>
