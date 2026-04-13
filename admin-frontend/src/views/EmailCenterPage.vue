<template>
  <section class="card">
    <div class="section-title">
      <h2>邮件发送任务</h2>
      <div class="row">
        <select v-model="jobFilter.status" class="input small">
          <option value="">全部状态</option>
          <option value="pending">pending</option>
          <option value="processing">processing</option>
          <option value="sent">sent</option>
          <option value="failed">failed</option>
        </select>
        <select v-model="jobFilter.type" class="input small">
          <option value="">全部类型</option>
          <option value="match_notification">match_notification</option>
          <option value="pairing_unlocked">pairing_unlocked</option>
        </select>
        <button class="btn" @click="loadEmailJobs">刷新</button>
      </div>
    </div>
    <p v-if="loadingEmailJobs">加载中...</p>
    <p v-else-if="emailJobs.length === 0">暂无邮件任务</p>
    <table v-else class="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>类型</th>
          <th>状态</th>
          <th>收件用户</th>
          <th>匹配对象</th>
          <th>尝试次数</th>
          <th>计划时间</th>
          <th>最近错误</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="job in emailJobs" :key="job.id">
          <td>{{ job.id }}</td>
          <td>{{ job.type }}</td>
          <td>{{ job.status }}</td>
          <td>{{ job.toUser?.id }} / {{ job.toUser?.nickname || job.toUser?.name || '-' }}</td>
          <td>{{ job.matchUser?.id }} / {{ job.matchUser?.nickname || job.matchUser?.name || '-' }}</td>
          <td>{{ job.attempts }} / {{ job.max_attempts }}</td>
          <td>{{ formatDateTime(job.scheduled_at) }}</td>
          <td>{{ job.last_error || '-' }}</td>
          <td>
            <button class="btn btn-secondary" :disabled="job.status !== 'failed'" @click="retryEmailJob(job.id)">
              重试
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <p class="tip">当前页：{{ jobPagination.page }} / 总数：{{ jobPagination.total }}</p>
  </section>

  <section class="card">
    <div class="section-title">
      <h2>匹配邮件 AI 文案配置</h2>
      <button class="btn" @click="loadEmailConfig">刷新配置</button>
    </div>
    <div class="grid">
      <label class="row">
        <input v-model="emailConfig.ai_enabled" type="checkbox" />
        <span>启用 AI 助攻文案（仅匹配通知）</span>
      </label>
      <input v-model.number="emailConfig.temperature" class="input" type="number" step="0.1" placeholder="temperature" />
      <input v-model.number="emailConfig.max_tokens" class="input" type="number" placeholder="max_tokens" />
    </div>
    <div class="detail-block">
      <label>匹配通知 system prompt</label>
      <textarea v-model="emailConfig.match_system_prompt" class="input textarea"></textarea>
      <label>匹配通知 user rules</label>
      <textarea v-model="emailConfig.match_user_rules" class="input textarea"></textarea>
    </div>
    <div class="row">
      <button class="btn" @click="saveEmailConfig">保存配置</button>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import api from '../api'

const loadingEmailJobs = ref(false)
const emailJobs = ref([])
const jobPagination = ref({ page: 1, page_size: 20, total: 0 })
const jobFilter = ref({ status: '', type: '' })
const emailConfig = ref({
  ai_enabled: true,
  temperature: 0.7,
  max_tokens: 180,
  match_system_prompt: '',
  match_user_rules: ''
})

const handleError = (error, fallback) => {
  alert(error?.error?.message || fallback)
}

const loadEmailJobs = async () => {
  loadingEmailJobs.value = true
  try {
    const res = await api.get('/admin/email/jobs', {
      params: {
        status: jobFilter.value.status || undefined,
        type: jobFilter.value.type || undefined,
        page: 1,
        page_size: 20
      }
    })
    emailJobs.value = res.data?.jobs || []
    jobPagination.value = res.data?.pagination || { page: 1, page_size: 20, total: 0 }
  } catch (error) {
    handleError(error, '加载邮件任务失败')
  } finally {
    loadingEmailJobs.value = false
  }
}

const retryEmailJob = async (jobId) => {
  try {
    await api.post(`/admin/email/jobs/${jobId}/retry`)
    await loadEmailJobs()
    alert(`任务 ${jobId} 已重新入队`)
  } catch (error) {
    handleError(error, '重试邮件任务失败')
  }
}

const loadEmailConfig = async () => {
  try {
    const res = await api.get('/admin/email/config')
    emailConfig.value = {
      ...emailConfig.value,
      ...(res.data || {})
    }
  } catch (error) {
    handleError(error, '加载邮件配置失败')
  }
}

const saveEmailConfig = async () => {
  try {
    await api.patch('/admin/email/config', {
      ai_enabled: emailConfig.value.ai_enabled,
      temperature: emailConfig.value.temperature,
      max_tokens: emailConfig.value.max_tokens,
      match_system_prompt: emailConfig.value.match_system_prompt,
      match_user_rules: emailConfig.value.match_user_rules
    })
    await loadEmailConfig()
    alert('邮件配置已保存')
  } catch (error) {
    handleError(error, '保存邮件配置失败')
  }
}

const formatDateTime = (value) => {
  if (!value) {
    return '-'
  }
  return new Date(value).toLocaleString()
}

onMounted(async () => {
  await Promise.all([loadEmailJobs(), loadEmailConfig()])
})
</script>
