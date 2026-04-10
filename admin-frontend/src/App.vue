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

    <section class="card">
      <div class="section-title">
        <h2>用户列表</h2>
        <button class="btn" @click="loadUsers">刷新</button>
      </div>
      <p class="tip">点击某一行可查看该用户在数据库中的完整数据</p>
      <p v-if="loadingUsers">加载中...</p>
      <p v-else-if="users.length === 0">暂无用户</p>
      <table v-else class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>姓名</th>
            <th>邮箱</th>
            <th>学院</th>
            <th>专业</th>
            <th>年级</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="user in users"
            :key="user.id"
            class="clickable-row"
            :class="{ 'selected-row': selectedUserId === user.id }"
            @click="selectUser(user.id)"
          >
            <td>{{ user.id }}</td>
            <td>{{ user.name || '-' }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.college || '-' }}</td>
            <td>{{ user.major || '-' }}</td>
            <td>{{ user.grade || '-' }}</td>
            <td>{{ user.status }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="card">
      <div class="section-title">
        <h2>用户完整数据详情</h2>
        <button class="btn btn-secondary" @click="clearUserDetail">清空</button>
      </div>
      <p v-if="loadingUserDetail">加载中...</p>
      <p v-else-if="!selectedUserDetail">请先在上方用户列表点击一个用户</p>
      <div v-else class="detail-block">
        <p>当前用户ID：{{ selectedUserId }}</p>
        <pre class="json-view">{{ JSON.stringify(selectedUserDetail, null, 2) }}</pre>
      </div>
    </section>

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
            <th>状态</th>
            <th>分数</th>
            <th>配对</th>
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
          </tr>
          <tr v-for="item in matches" :key="`editor-${item.id}`">
            <td colspan="6">
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
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import api from './api'

const statusOptions = [
  'pending',
  'user1_unlocked',
  'user2_unlocked',
  'both_unlocked',
  'user1_skipped',
  'user2_skipped',
  'both_skipped'
]

const users = ref([])
const weeks = ref([])
const matches = ref([])
const loadingUsers = ref(false)
const loadingWeeks = ref(false)
const loadingMatches = ref(false)
const loadingUserDetail = ref(false)
const adminKeyInput = ref(localStorage.getItem('admin_key') || '')
const hasAdminKey = ref(Boolean(localStorage.getItem('admin_key')))
const selectedWeekKey = ref('')
const selectedUserId = ref(null)
const selectedUserDetail = ref(null)

const createForm = ref({
  week_key: '',
  week_number: null,
  year: null,
  user1_id: null,
  user2_id: null,
  status: 'pending',
  match_score: 0
})

const saveAdminKey = () => {
  localStorage.setItem('admin_key', adminKeyInput.value.trim())
  hasAdminKey.value = Boolean(adminKeyInput.value.trim())
  alert('管理员密钥已保存')
}

const clearAdminKey = () => {
  localStorage.removeItem('admin_key')
  adminKeyInput.value = ''
  hasAdminKey.value = false
  alert('管理员密钥已清除')
}

const handleError = (error, fallback) => {
  alert(error?.error?.message || fallback)
}

const loadUsers = async () => {
  loadingUsers.value = true
  try {
    const res = await api.get('/admin/users')
    users.value = res.data?.users || []
  } catch (error) {
    handleError(error, '加载用户失败')
  } finally {
    loadingUsers.value = false
  }
}

const selectUser = async (userId) => {
  selectedUserId.value = userId
  loadingUserDetail.value = true
  try {
    const res = await api.get(`/admin/users/${userId}`)
    selectedUserDetail.value = res.data || null
  } catch (error) {
    handleError(error, '加载用户完整数据失败')
  } finally {
    loadingUserDetail.value = false
  }
}

const clearUserDetail = () => {
  selectedUserId.value = null
  selectedUserDetail.value = null
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

const loadWeekMatches = async () => {
  if (!selectedWeekKey.value.trim()) {
    alert('请先输入 week_key')
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

onMounted(async () => {
  await Promise.all([loadUsers(), loadWeeks()])
})
</script>
