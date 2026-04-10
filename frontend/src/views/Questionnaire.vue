<template>
  <div class="min-h-screen bg-white">
    <header class="border-b border-border">
      <div class="max-w-5xl mx-auto px-md py-md flex justify-between items-center">
        <h1 class="text-2xl font-serif font-semibold">问卷系统</h1>
        <nav class="flex gap-lg">
          <router-link to="/profile" class="text-text-secondary hover:text-primary transition">个人资料</router-link>
          <router-link to="/match" class="text-text-secondary hover:text-primary transition">本周匹配</router-link>
          <router-link to="/pairings" class="text-text-secondary hover:text-primary transition">我的配对</router-link>
        </nav>
      </div>
    </header>
    <main class="max-w-5xl mx-auto px-md py-xl space-y-xl">
      <div class="border border-border p-lg">
        <p class="text-sm text-text-secondary">完成度：{{ progress.completeness }}%</p>
        <div class="w-full bg-gray-100 h-2 mt-sm">
          <div class="bg-primary h-2" :style="{ width: `${progress.completeness}%` }"></div>
        </div>
      </div>

      <div v-for="section in sections" :key="section.name" class="border border-border p-lg space-y-md">
        <h2 class="text-xl font-semibold">{{ section.title }}</h2>
        <div v-for="question in section.questions" :key="question.id" class="space-y-sm">
          <p class="font-medium">{{ question.question_text }}</p>
          <div v-if="question.question_type === 'single'" class="space-y-xs">
            <label v-for="option in normalizeOptions(question.options)" :key="option" class="flex items-center gap-sm">
              <input type="radio" :name="`q-${question.id}`" :value="option" v-model="answers[question.id]" />
              <span>{{ option }}</span>
            </label>
          </div>
          <div v-else-if="question.question_type === 'multiple'" class="space-y-xs">
            <label v-for="option in normalizeOptions(question.options)" :key="option" class="flex items-center gap-sm">
              <input type="checkbox" :value="option" :checked="isChecked(question.id, option)" @change="toggleMulti(question.id, option)" />
              <span>{{ option }}</span>
            </label>
          </div>
          <div v-else>
            <textarea v-model="answers[question.id]" rows="2" class="w-full px-md py-sm border border-border focus:border-primary focus:outline-none"></textarea>
          </div>
        </div>
      </div>
      <button @click="saveAll" :disabled="saving" class="w-full py-md bg-primary text-white font-semibold hover:bg-secondary disabled:opacity-50">
        {{ saving ? '保存中...' : '保存问卷' }}
      </button>
    </main>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import api from '@/api'

const sections = ref([])
const answers = reactive({})
const saving = ref(false)
const progress = ref({
  completeness: 0
})

const normalizeOptions = (options) => {
  if (!options) {
    return []
  }
  if (Array.isArray(options)) {
    return options
  }
  if (typeof options === 'object') {
    return Object.values(options)
  }
  return []
}

const isChecked = (questionId, option) => {
  return Array.isArray(answers[questionId]) && answers[questionId].includes(option)
}

const toggleMulti = (questionId, option) => {
  const current = Array.isArray(answers[questionId]) ? [...answers[questionId]] : []
  if (current.includes(option)) {
    answers[questionId] = current.filter(item => item !== option)
  } else {
    answers[questionId] = [...current, option]
  }
}

const loadQuestions = async () => {
  const res = await api.get('/questionnaire/questions')
  sections.value = res.data.sections
}

const loadAnswers = async () => {
  const res = await api.get('/questionnaire/answers')
  const allQuestions = sections.value.flatMap(section => section.questions)
  for (const question of allQuestions) {
    const value = res.data.answers[question.question_code]
    if (value !== undefined) {
      answers[question.id] = value
    }
  }
}

const loadProgress = async () => {
  const res = await api.get('/questionnaire/progress')
  progress.value = res.data
}

const saveAll = async () => {
  const payload = Object.entries(answers)
    .filter(([, value]) => value !== '' && value !== null && value !== undefined && (!Array.isArray(value) || value.length > 0))
    .map(([questionId, answerValue]) => ({
      question_id: Number(questionId),
      answer_value: answerValue
    }))
  if (payload.length === 0) {
    alert('请至少填写一题')
    return
  }
  saving.value = true
  try {
    await api.post('/questionnaire/answers', { answers: payload })
    await loadProgress()
    alert('保存成功')
  } catch (error) {
    alert(error.error?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await loadQuestions()
  await loadAnswers()
  await loadProgress()
})
</script>
