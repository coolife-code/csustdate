<template>
  <section class="card">
    <div class="section-title">
      <h2>每周配对概览</h2>
      <button class="btn" @click="loadWeeks">刷新</button>
    </div>
    <p v-if="loadingWeeks">加载中...</p>
    <p v-else-if="weeks.length === 0">暂无周数据</p>
    <table v-else class="table">
      <thead>
        <tr>
          <th>week_key</th>
          <th>年</th>
          <th>周</th>
          <th>总匹配</th>
          <th>待处理</th>
          <th>已解锁</th>
          <th>已跳过</th>
          <th>活跃配对</th>
          <th>已结束配对</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="week in weeks" :key="week.week_key">
          <td>{{ week.week_key }}</td>
          <td>{{ week.year }}</td>
          <td>{{ week.week_number }}</td>
          <td>{{ week.total_matches }}</td>
          <td>{{ week.pending_count }}</td>
          <td>{{ week.unlocked_count }}</td>
          <td>{{ week.skipped_count }}</td>
          <td>{{ week.active_pairings }}</td>
          <td>{{ week.ended_pairings }}</td>
          <td><button class="btn btn-secondary" @click="selectWeek(week.week_key)">查看详情</button></td>
        </tr>
      </tbody>
    </table>
  </section>

  <section class="card">
    <h2>新建匹配</h2>
    <div class="grid">
      <input v-model="createForm.week_key" class="input" placeholder="week_key，例如 2026-W15" />
      <input v-model.number="createForm.week_number" class="input" type="number" placeholder="week_number" />
      <input v-model.number="createForm.year" class="input" type="number" placeholder="year" />
      <input v-model.number="createForm.user1_id" class="input" type="number" placeholder="user1_id" />
      <input v-model.number="createForm.user2_id" class="input" type="number" placeholder="user2_id" />
      <select v-model="createForm.status" class="input">
        <option v-for="status in statusOptions" :key="status" :value="status">{{ status }}</option>
      </select>
    </div>
    <div class="row">
      <input v-model.number="createForm.match_score" class="input small" type="number" step="0.1" placeholder="match_score" />
      <button class="btn" @click="createMatch">创建匹配</button>
    </div>
  </section>

  <section class="card">
    <div class="section-title">
      <h2>周匹配详情</h2>
      <div class="row">
        <input v-model="selectedWeekKey" class="input" placeholder="输入 week_key 并加载" />
        <button class="btn" @click="loadWeekMatches">加载</button>
        <button class="btn btn-secondary" @click="autoRefreshMatches = !autoRefreshMatches">
          {{ autoRefreshMatches ? '关闭自动刷新' : '开启自动刷新' }}
        </button>
      </div>
    </div>
    <p v-if="loadingMatches">加载中...</p>
    <p v-else-if="matches.length === 0">暂无匹配记录</p>
    <table v-else class="table">
      <thead>
        <tr>
          <th>match_id</th>
          <th>用户1</th>
          <th>用户2</th>
          <th>匹配状态</th>
          <th>分数</th>
          <th>配对状态</th>
          <th>结束时间</th>
          <th>解除人ID</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in matches" :key="item.id">
          <td>{{ item.id }}</td>
          <td>{{ item.user1?.id }} / {{ item.user1?.name || '-' }}</td>
          <td>{{ item.user2?.id }} / {{ item.user2?.name || '-' }}</td>
          <td>
            <select v-model="item.edit_status" class="input">
              <option v-for="status in statusOptions" :key="status" :value="status">{{ status }}</option>
            </select>
          </td>
          <td><input v-model.number="item.edit_match_score" class="input small" type="number" step="0.1" /></td>
          <td>{{ item.pairing?.status || '-' }}</td>
          <td>{{ formatDateTime(item.pairing?.ended_at) }}</td>
          <td>{{ item.pairing?.ended_by || '-' }}</td>
        </tr>
        <tr v-for="item in matches" :key="`editor-${item.id}`">
          <td colspan="8">
            <div class="row">
              <input v-model.number="item.edit_user1_id" class="input small" type="number" placeholder="新 user1_id" />
              <input v-model.number="item.edit_user2_id" class="input small" type="number" placeholder="新 user2_id" />
              <button class="btn" @click="saveMatch(item)">保存强制修改</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import api from '../api'

const statusOptions = [
  'pending',
  'user1_unlocked',
  'user2_unlocked',
  'both_unlocked',
  'user1_skipped',
  'user2_skipped',
  'both_skipped'
]

const weeks = ref([])
const matches = ref([])
const loadingWeeks = ref(false)
const loadingMatches = ref(false)
const selectedWeekKey = ref('')
const autoRefreshMatches = ref(true)
let autoRefreshTimer = null

const createForm = ref({
  week_key: '',
  week_number: null,
  year: null,
  user1_id: null,
  user2_id: null,
  status: 'pending',
  match_score: 0
})

const handleError = (error, fallback) => {
  alert(error?.error?.message || fallback)
}

const loadWeeks = async () => {
  loadingWeeks.value = true
  try {
    const res = await api.get('/admin/weeks')
    weeks.value = res.data?.weeks || []
  } catch (error) {
    handleError(error, '加载周统计失败')
  } finally {
    loadingWeeks.value = false
  }
}

const normalizeMatchRows = (list) => list.map((item) => ({
  ...item,
  edit_user1_id: item.user1_id,
  edit_user2_id: item.user2_id,
  edit_status: item.status,
  edit_match_score: item.match_score
}))

const loadWeekMatches = async ({ silentIfEmpty = false } = {}) => {
  if (!selectedWeekKey.value.trim()) {
    if (!silentIfEmpty) {
      alert('请先输入 week_key')
    }
    return
  }
  loadingMatches.value = true
  try {
    const res = await api.get('/admin/matches', {
      params: { week_key: selectedWeekKey.value.trim() }
    })
    matches.value = normalizeMatchRows(res.data?.matches || [])
  } catch (error) {
    handleError(error, '加载周匹配失败')
  } finally {
    loadingMatches.value = false
  }
}

const selectWeek = (weekKey) => {
  selectedWeekKey.value = weekKey
  loadWeekMatches()
}

const saveMatch = async (item) => {
  try {
    await api.patch(`/admin/matches/${item.id}`, {
      user1_id: Number(item.edit_user1_id),
      user2_id: Number(item.edit_user2_id),
      status: item.edit_status,
      match_score: Number(item.edit_match_score)
    })
    await loadWeekMatches()
    await loadWeeks()
    alert(`匹配 ${item.id} 已更新`)
  } catch (error) {
    handleError(error, '更新匹配失败')
  }
}

const createMatch = async () => {
  try {
    await api.post('/admin/matches', {
      week_key: createForm.value.week_key.trim(),
      week_number: Number(createForm.value.week_number),
      year: Number(createForm.value.year),
      user1_id: Number(createForm.value.user1_id),
      user2_id: Number(createForm.value.user2_id),
      status: createForm.value.status,
      match_score: Number(createForm.value.match_score || 0)
    })
    await loadWeeks()
    if (selectedWeekKey.value.trim() === createForm.value.week_key.trim()) {
      await loadWeekMatches()
    }
    alert('新匹配创建成功')
  } catch (error) {
    handleError(error, '创建匹配失败')
  }
}

const formatDateTime = (value) => {
  if (!value) {
    return '-'
  }
  return new Date(value).toLocaleString()
}

const startAutoRefresh = () => {
  if (autoRefreshTimer) {
    return
  }
  autoRefreshTimer = setInterval(() => {
    if (autoRefreshMatches.value && selectedWeekKey.value.trim()) {
      loadWeekMatches({ silentIfEmpty: true })
      loadWeeks()
    }
  }, 10000)
}

const stopAutoRefresh = () => {
  if (!autoRefreshTimer) {
    return
  }
  clearInterval(autoRefreshTimer)
  autoRefreshTimer = null
}

onMounted(() => {
  loadWeeks()
  startAutoRefresh()
})

onBeforeUnmount(() => {
  stopAutoRefresh()
})
</script>
