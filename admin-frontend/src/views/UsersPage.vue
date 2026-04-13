<template>
  <section class="card">
    <div class="section-title">
      <h2>用户管理</h2>
      <button class="btn" @click="loadUsers">刷新</button>
    </div>
    <p v-if="loadingUsers">加载中...</p>
    <p v-else-if="users.length === 0">暂无用户</p>
    <table v-else class="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>昵称</th>
          <th>邮箱</th>
          <th>学院</th>
          <th>专业</th>
          <th>年级</th>
          <th>状态</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.id }}</td>
          <td>{{ user.name || '-' }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.college || '-' }}</td>
          <td>{{ user.major || '-' }}</td>
          <td>{{ user.grade || '-' }}</td>
          <td>{{ user.status }}</td>
          <td class="row">
            <button class="btn btn-secondary" @click="selectUser(user.id)">详情</button>
            <button class="btn btn-secondary" @click="prepareEdit(user)">编辑</button>
            <button class="btn btn-danger" @click="removeUser(user.id)">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
  </section>

  <section class="card">
    <h2>新建用户</h2>
    <div class="grid">
      <input v-model="createForm.email" class="input" placeholder="邮箱" />
      <input v-model="createForm.password" class="input" placeholder="密码" type="password" />
      <input v-model="createForm.name" class="input" placeholder="姓名" />
      <input v-model="createForm.nickname" class="input" placeholder="昵称" />
      <input v-model="createForm.college" class="input" placeholder="学院" />
      <input v-model="createForm.major" class="input" placeholder="专业" />
      <input v-model="createForm.grade" class="input" placeholder="年级" />
      <select v-model="createForm.status" class="input">
        <option value="active">active</option>
        <option value="inactive">inactive</option>
        <option value="banned">banned</option>
      </select>
    </div>
    <div class="row">
      <button class="btn" @click="createUser">创建用户</button>
    </div>
  </section>

  <section class="card">
    <h2>编辑用户</h2>
    <p v-if="!editForm.id">请先点击用户列表中的“编辑”</p>
    <div v-else>
      <div class="grid">
        <input v-model="editForm.email" class="input" placeholder="邮箱" />
        <input v-model="editForm.password" class="input" placeholder="新密码(可留空)" type="password" />
        <input v-model="editForm.name" class="input" placeholder="姓名" />
        <input v-model="editForm.nickname" class="input" placeholder="昵称" />
        <input v-model="editForm.college" class="input" placeholder="学院" />
        <input v-model="editForm.major" class="input" placeholder="专业" />
        <input v-model="editForm.grade" class="input" placeholder="年级" />
        <select v-model="editForm.status" class="input">
          <option value="active">active</option>
          <option value="inactive">inactive</option>
          <option value="banned">banned</option>
        </select>
      </div>
      <div class="row">
        <button class="btn" @click="updateUser">保存修改</button>
      </div>
    </div>
  </section>

  <section class="card">
    <h2>用户详情</h2>
    <p v-if="loadingUserDetail">加载中...</p>
    <p v-else-if="!selectedUserDetail">请先点击“详情”</p>
    <pre v-else class="json-view">{{ JSON.stringify(selectedUserDetail, null, 2) }}</pre>
  </section>

  <section class="card">
    <h2>单用户模板邮件</h2>
    <p class="tip" v-pre>可用变量：{{name}} {{nickname}} {{email}} {{college}} {{major}} {{grade}}</p>
    <div class="grid">
      <input v-model.number="mailForm.user_id" class="input" type="number" placeholder="目标 user_id" />
      <input v-model="mailForm.subject" class="input" placeholder="邮件标题" />
    </div>
    <textarea v-model="mailForm.html_template" class="input textarea" placeholder="<p>你好，&#123;&#123;nickname&#125;&#125;</p>"></textarea>
    <div class="row">
      <button class="btn" @click="sendCustomMail">发送邮件</button>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import api from '../api'

const users = ref([])
const loadingUsers = ref(false)
const loadingUserDetail = ref(false)
const selectedUserDetail = ref(null)

const createForm = ref({
  email: '',
  password: '',
  name: '',
  nickname: '',
  college: '',
  major: '',
  grade: '',
  status: 'active'
})

const editForm = ref({
  id: null,
  email: '',
  password: '',
  name: '',
  nickname: '',
  college: '',
  major: '',
  grade: '',
  status: 'active'
})

const mailForm = ref({
  user_id: null,
  subject: '',
  html_template: '<p>你好，{{nickname}}，这是管理员发送的一封测试邮件。</p>'
})

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
  loadingUserDetail.value = true
  try {
    const res = await api.get(`/admin/users/${userId}`)
    selectedUserDetail.value = res.data || null
  } catch (error) {
    handleError(error, '加载用户详情失败')
  } finally {
    loadingUserDetail.value = false
  }
}

const createUser = async () => {
  try {
    await api.post('/admin/users', createForm.value)
    await loadUsers()
    alert('用户创建成功')
  } catch (error) {
    handleError(error, '创建用户失败')
  }
}

const prepareEdit = (user) => {
  editForm.value = {
    id: user.id,
    email: user.email || '',
    password: '',
    name: user.name || '',
    nickname: user.nickname || '',
    college: user.college || '',
    major: user.major || '',
    grade: user.grade || '',
    status: user.status || 'active'
  }
}

const updateUser = async () => {
  if (!editForm.value.id) {
    alert('请先选择要编辑的用户')
    return
  }
  try {
    await api.patch(`/admin/users/${editForm.value.id}`, editForm.value)
    await loadUsers()
    alert('用户更新成功')
  } catch (error) {
    handleError(error, '更新用户失败')
  }
}

const removeUser = async (userId) => {
  if (!confirm(`确认删除用户 ${userId} 及关联数据吗？`)) {
    return
  }
  try {
    await api.delete(`/admin/users/${userId}`)
    await loadUsers()
    alert('用户删除成功')
  } catch (error) {
    handleError(error, '删除用户失败')
  }
}

const sendCustomMail = async () => {
  try {
    await api.post('/admin/email/send-custom', mailForm.value)
    alert('邮件发送成功')
  } catch (error) {
    handleError(error, '发送邮件失败')
  }
}

onMounted(() => {
  loadUsers()
})
</script>
