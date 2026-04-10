# 前端开发文档

## 技术栈选型（轻量化方案）

考虑到服务器配置为2核2G，前端需要选择轻量化的技术方案：

- **框架**：Vue 3 + Vite（构建快、体积小）
- **UI组件库**：不使用重型UI库，采用自定义组件
- **CSS方案**：Tailwind CSS（按需生成，体积小）
- **状态管理**：Pinia（Vue 3官方推荐，轻量）
- **路由**：Vue Router
- **HTTP客户端**：Axios
- **图标**：Lucide Icons（轻量级图标库）

## UI设计风格 - New Yorker 风格

### 设计原则

New Yorker网站以其优雅、简洁、文学气质著称，我们的设计将遵循以下原则：

1. **极简主义**：大量留白，内容为中心
2. **优雅字体**：衬线字体为主，传达文学气质
3. **经典配色**：黑白灰为主，点缀色彩
4. **精致排版**：注重阅读体验
5. **微妙动效**：不过度使用动画

### 配色方案

```css
:root {
  --color-primary: #000000;
  --color-secondary: #333333;
  --color-accent: #D32F2F;
  --color-background: #FFFFFF;
  --color-surface: #F5F5F5;
  --color-border: #E0E0E0;
  --color-text-primary: #1A1A1A;
  --color-text-secondary: #666666;
  --color-text-muted: #999999;
  --color-success: #2E7D32;
  --color-error: #C62828;
  --color-warning: #F57C00;
}
```

### 字体规范

```css
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Source+Sans+Pro:wght@300;400;600&display=swap');

:root {
  --font-serif: 'Playfair Display', 'Georgia', serif;
  --font-sans: 'Source Sans Pro', 'Helvetica Neue', sans-serif;
  
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 2rem;
  --font-size-4xl: 2.5rem;
  --font-size-5xl: 3rem;
}
```

### 间距系统

```css
:root {
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;
  --spacing-3xl: 4rem;
  --spacing-4xl: 6rem;
}
```

## 页面结构

### 1. 首页 (Landing Page)

```
┌─────────────────────────────────────────────────┐
│  Logo                    登录 | 注册             │
├─────────────────────────────────────────────────┤
│                                                 │
│              CSUST DateDrop                     │
│         让每一次相遇都值得期待                    │
│                                                 │
│            [ 开始配对 ] 按钮                     │
│                                                 │
│                                                 │
│  ─────────────────────────────────────────────  │
│                                                 │
│  每周二，我们为你精心挑选                         │
│  一位志同道合的伙伴                               │
│                                                 │
│  ─────────────────────────────────────────────  │
│                                                 │
│  简单三步，遇见TA                                 │
│                                                 │
│  ┌───────┐   ┌───────┐   ┌───────┐            │
│  │ 注册  │ → │ 等待  │ → │ 解锁  │            │
│  └───────┘   └───────┘   └───────┘            │
│                                                 │
│                                                 │
├─────────────────────────────────────────────────┤
│  © 2024 CSUST DateDrop                          │
└─────────────────────────────────────────────────┘
```

### 2. 登录页面

```
┌─────────────────────────────────────────────────┐
│  Logo                                          │
├─────────────────────────────────────────────────┤
│                                                 │
│                                                 │
│              欢迎回来                            │
│                                                 │
│         ┌─────────────────────┐                │
│         │ 邮箱                 │                │
│         └─────────────────────┘                │
│                                                 │
│         ┌─────────────────────┐                │
│         │ 密码                 │                │
│         └─────────────────────┘                │
│                                                 │
│         忘记密码？                               │
│                                                 │
│         ┌─────────────────────┐                │
│         │      登  录         │                │
│         └─────────────────────┘                │
│                                                 │
│         还没有账号？立即注册                      │
│                                                 │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 3. 注册页面

```
┌─────────────────────────────────────────────────┐
│  Logo                                          │
├─────────────────────────────────────────────────┤
│                                                 │
│              创建账号                            │
│                                                 │
│  步骤指示器：○ ── ○ ── ○                         │
│                                                 │
│  ─────────────────────────────────────────────  │
│                                                 │
│  步骤1：验证邮箱                                 │
│                                                 │
│         ┌─────────────────────┐                │
│         │ 教育邮箱             │                │
│         └─────────────────────┘                │
│                                                 │
│         ┌─────────────────────┐                │
│         │ 验证码      获取验证码│                │
│         └─────────────────────┘                │
│                                                 │
│         ┌─────────────────────┐                │
│         │      下 一 步       │                │
│         └─────────────────────┘                │
│                                                 │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 4. 个人资料设置

```
┌─────────────────────────────────────────────────┐
│  Logo          首页  我的配对  设置   退出        │
├─────────────────────────────────────────────────┤
│                                                 │
│  个人资料                                        │
│  ─────────────────────────────────────────────  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │                                          │  │
│  │  ┌──────┐                               │  │
│  │  │ 头像  │  基本信息                     │  │
│  │  └──────┘                               │  │
│  │                                          │  │
│  │  姓名        [______________]            │  │
│  │  性别        ○ 男  ○ 女  ○ 其他          │  │
│  │  出生日期    [____年____月____日]        │  │
│  │  学院        [下拉选择]                  │  │
│  │  专业        [______________]            │  │
│  │  年级        [下拉选择]                  │  │
│  │                                          │  │
│  │  个人简介                                 │  │
│  │  ┌────────────────────────────────┐     │  │
│  │  │                                │     │  │
│  │  │  多行文本输入框                 │     │  │
│  │  │                                │     │  │
│  │  └────────────────────────────────┘     │  │
│  │                                          │  │
│  │  兴趣爱好                                 │  │
│  │  [编程] [音乐] [运动] [阅读] [旅行] ...   │  │
│  │                                          │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  联系方式（双向解锁后可见）                │  │
│  │                                          │  │
│  │  微信号      [______________]            │  │
│  │  QQ号        [______________]            │  │
│  │  手机号      [______________]            │  │
│  │                                          │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  匹配偏好                                 │  │
│  │                                          │  │
│  │  期望性别    ○ 男  ○ 女  ○ 都可以        │  │
│  │  年龄范围    [__] 岁 ~ [__] 岁           │  │
│  │  学院偏好    [多选下拉]                   │  │
│  │                                          │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│         ┌─────────────────────┐                │
│         │      保  存         │                │
│         └─────────────────────┘                │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 5. 问卷填写页面

```
┌─────────────────────────────────────────────────┐
│  Logo          首页  我的配对  设置   退出        │
├─────────────────────────────────────────────────┤
│                                                 │
│  完善资料                                        │
│  ─────────────────────────────────────────────  │
│                                                 │
│  进度条：[████████░░░░░░░░░░] 45%              │
│                                                 │
│  当前部分：外貌与生活方式 (1/8)                   │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │                                          │  │
│  │  Q1.1 你的身高是？                        │  │
│  │                                          │  │
│  │  ○ A. 155cm以下                          │  │
│  │  ○ B. 155-160cm                          │  │
│  │  ○ C. 160-165cm                          │  │
│  │  ● D. 165-170cm  (已选中)                │  │
│  │  ○ E. 170-175cm                          │  │
│  │  ○ F. 175-180cm                          │  │
│  │  ○ G. 180-185cm                          │  │
│  │  ○ H. 185cm以上                           │  │
│  │                                          │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │                                          │  │
│  │  Q1.2 你期望的理想对象身高范围是？         │  │
│  │                                          │  │
│  │  ○ A. 比我高就行                          │  │
│  │  ○ B. 170cm以上                           │  │
│  │  ● C. 175cm以上  (已选中)                 │  │
│  │  ○ D. 180cm以上                           │  │
│  │  ○ E. 身高不重要，内在更重要              │  │
│  │                                          │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  部分进度：3/15 已完成                          │
│                                                 │
│  ┌────────────┐  ┌────────────┐              │
│  │   上一步    │  │   下一步    │              │
│  └────────────┘  └────────────┘              │
│                                                 │
│  [保存并稍后继续]                               │
│                                                 │
└─────────────────────────────────────────────────┘
```

**问卷部分导航**：

```
┌─────────────────────────────────────────────────┐
│  选择问卷部分                                    │
│  ─────────────────────────────────────────────  │
│                                                 │
│  ✓ 外貌与生活方式 (15题) - 已完成               │
│  ✓ 性格特征 (11题) - 已完成                     │
│  ● 价值观与恋爱观 (15题) - 进行中 8/15          │
│  ○ 兴趣爱好 (10题) - 未开始                     │
│  ○ 学业与规划 (7题) - 未开始                    │
│  ○ 家庭与背景 (8题) - 未开始                    │
│  ○ 期望偏好 (9题) - 未开始                      │
│  ○ 附加问题 (5题) - 未开始                      │
│                                                 │
│  总进度：45/80 (56%)                            │
│                                                 │
│  [继续填写]                                      │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 6. 本周匹配页面

```
┌─────────────────────────────────────────────────┐
│  Logo          首页  我的配对  设置   退出        │
├─────────────────────────────────────────────────┤
│                                                 │
│  本周匹配                                        │
│  2024年第15周                                    │
│  ─────────────────────────────────────────────  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │                                          │  │
│  │  ┌────────┐                             │  │
│  │  │        │  张三                        │  │
│  │  │  头像   │  计算机学院 · 软件工程       │  │
│  │  │        │  大三 · 男 · 21岁            │  │
│  │  └────────┘                             │  │
│  │                                          │  │
│  │  ────────────────────────────────────   │  │
│  │                                          │  │
│  │  个人简介                                 │  │
│  │  热爱编程，喜欢运动和音乐。平时喜欢看书    │  │
│  │  和旅行，希望找到志同道合的朋友...        │  │
│  │                                          │  │
│  │  ────────────────────────────────────   │  │
│  │                                          │  │
│  │  兴趣爱好                                 │  │
│  │  编程 · 音乐 · 运动 · 阅读 · 旅行        │  │
│  │                                          │  │
│  │  ────────────────────────────────────   │  │
│  │                                          │  │
│  │  匹配度：85%                              │  │
│  │  ████████░░                              │  │
│  │                                          │  │
│  │  ┌────────────┐  ┌────────────┐        │  │
│  │  │   解  锁    │  │   跳  过    │        │  │
│  │  └────────────┘  └────────────┘        │  │
│  │                                          │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  提示：解锁后，如果对方也解锁了你，你们将        │
│  互相获得对方的联系方式                          │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 6. 我的配对页面

```
┌─────────────────────────────────────────────────┐
│  Logo          首页  我的配对  设置   退出        │
├─────────────────────────────────────────────────┤
│                                                 │
│  我的配对                                        │
│  ─────────────────────────────────────────────  │
│                                                 │
│  当前配对                                        │
│  ┌──────────────────────────────────────────┐  │
│  │  ┌────────┐                             │  │
│  │  │        │  李四                        │  │
│  │  │  头像   │  数学学院 · 应用数学         │  │
│  │  │        │  大二 · 女 · 20岁            │  │
│  │  └────────┘                             │  │
│  │                                          │  │
│  │  配对时间：2024年4月9日                   │  │
│  │                                          │  │
│  │  联系方式：                               │  │
│  │  邮箱：lisi@csust.edu.cn                 │  │
│  │  微信：lisi_wx                            │  │
│  │  QQ：123456789                            │  │
│  │                                          │  │
│  │  ┌────────────┐                         │  │
│  │  │  解除配对   │                         │  │
│  │  └────────────┘                         │  │
│  │                                          │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ─────────────────────────────────────────────  │
│                                                 │
│  历史配对                                        │
│  ┌──────────────────────────────────────────┐  │
│  │  王五  外语学院  已结束                    │  │
│  │  配对时间：2024年3月12日 - 2024年4月2日   │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
└─────────────────────────────────────────────────┘
```

## 组件设计

### 1. Button 组件

```vue
<template>
  <button 
    :class="[
      'btn',
      `btn-${variant}`,
      `btn-${size}`,
      { 'btn-loading': loading }
    ]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="btn-spinner"></span>
    <slot />
  </button>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'outline', 'text'].includes(v)
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v)
  },
  loading: Boolean,
  disabled: Boolean
})

defineEmits(['click'])
</script>

<style scoped>
.btn {
  font-family: var(--font-sans);
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-secondary);
}

.btn-secondary {
  background: var(--color-surface);
  color: var(--color-text-primary);
}

.btn-outline {
  background: transparent;
  border: 2px solid var(--color-primary);
  color: var(--color-primary);
}

.btn-text {
  background: transparent;
  color: var(--color-primary);
}

.btn-sm {
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: var(--font-size-sm);
}

.btn-md {
  padding: var(--spacing-sm) var(--spacing-lg);
  font-size: var(--font-size-base);
}

.btn-lg {
  padding: var(--spacing-md) var(--spacing-xl);
  font-size: var(--font-size-lg);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
```

### 2. Input 组件

```vue
<template>
  <div class="input-wrapper">
    <label v-if="label" class="input-label">
      {{ label }}
      <span v-if="required" class="required">*</span>
    </label>
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="['input', { 'input-error': error }]"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <span v-if="error" class="input-error-text">{{ error }}</span>
    <span v-if="hint" class="input-hint">{{ hint }}</span>
  </div>
</template>

<script setup>
defineProps({
  modelValue: [String, Number],
  label: String,
  type: {
    type: String,
    default: 'text'
  },
  placeholder: String,
  disabled: Boolean,
  required: Boolean,
  error: String,
  hint: String
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.input-label {
  font-family: var(--font-sans);
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-primary);
}

.required {
  color: var(--color-error);
}

.input {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  font-family: var(--font-sans);
  font-size: var(--font-size-base);
  transition: border-color 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.input-error {
  border-color: var(--color-error);
}

.input-error-text {
  font-size: var(--font-size-sm);
  color: var(--color-error);
}

.input-hint {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}
</style>
```

### 3. Card 组件

```vue
<template>
  <div class="card" :class="{ 'card-hoverable': hoverable }">
    <div v-if="$slots.header" class="card-header">
      <slot name="header" />
    </div>
    <div class="card-body">
      <slot />
    </div>
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  hoverable: Boolean
})
</script>

<style scoped>
.card {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  padding: var(--spacing-xl);
}

.card-hoverable {
  cursor: pointer;
  transition: box-shadow 0.2s ease;
}

.card-hoverable:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
  margin-bottom: var(--spacing-md);
}

.card-footer {
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
  margin-top: var(--spacing-md);
}
</style>
```

### 4. Tag 组件

```vue
<template>
  <span class="tag" :class="`tag-${variant}`">
    <slot />
  </span>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'primary', 'success', 'error'].includes(v)
  }
})
</script>

<style scoped>
.tag {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-sm);
  font-family: var(--font-sans);
  font-size: var(--font-size-sm);
  border-radius: 2px;
}

.tag-default {
  background: var(--color-surface);
  color: var(--color-text-secondary);
}

.tag-primary {
  background: var(--color-primary);
  color: white;
}

.tag-success {
  background: var(--color-success);
  color: white;
}

.tag-error {
  background: var(--color-error);
  color: white;
}
</style>
```

### 5. Modal 组件

```vue
<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click="closeOnOverlay && close()">
        <div class="modal" :style="{ width }" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">{{ title }}</h3>
            <button class="modal-close" @click="close">×</button>
          </div>
          <div class="modal-body">
            <slot />
          </div>
          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  modelValue: Boolean,
  title: String,
  width: {
    type: String,
    default: '500px'
  },
  closeOnOverlay: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue'])

const close = () => {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--color-background);
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
}

.modal-title {
  font-family: var(--font-serif);
  font-size: var(--font-size-xl);
  font-weight: 600;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: var(--font-size-2xl);
  cursor: pointer;
  color: var(--color-text-muted);
}

.modal-body {
  padding: var(--spacing-lg);
}

.modal-footer {
  padding: var(--spacing-lg);
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
```

### 6. QuestionnaireSection 组件

问卷部分组件，用于显示一个问卷部分的题目。

```vue
<template>
  <div class="questionnaire-section">
    <div class="section-header">
      <h3 class="section-title">{{ title }}</h3>
      <span class="section-progress">{{ answered }}/{{ total }}</span>
    </div>
    
    <div class="questions-list">
      <div 
        v-for="question in questions" 
        :key="question.id"
        class="question-item"
      >
        <p class="question-text">{{ question.question_text }}</p>
        
        <div v-if="question.question_type === 'single'" class="options-single">
          <label 
            v-for="(text, key) in question.options" 
            :key="key"
            class="option-item"
            :class="{ selected: modelValue[question.question_code] === key }"
          >
            <input
              type="radio"
              :name="question.question_code"
              :value="key"
              :checked="modelValue[question.question_code] === key"
              @change="updateAnswer(question.question_code, key)"
            />
            <span class="option-text">{{ text }}</span>
          </label>
        </div>
        
        <div v-else class="options-multiple">
          <label 
            v-for="(text, key) in question.options" 
            :key="key"
            class="option-item"
            :class="{ selected: modelValue[question.question_code]?.includes(key) }"
          >
            <input
              type="checkbox"
              :value="key"
              :checked="modelValue[question.question_code]?.includes(key)"
              @change="toggleMultiple(question.question_code, key)"
            />
            <span class="option-text">{{ text }}</span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: String,
  questions: Array,
  modelValue: Object,
  answered: Number,
  total: Number
})

const emit = defineEmits(['update:modelValue'])

const updateAnswer = (code, value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [code]: value
  })
}

const toggleMultiple = (code, value) => {
  const current = props.modelValue[code] || []
  const updated = current.includes(value)
    ? current.filter(v => v !== value)
    : [...current, value]
  
  emit('update:modelValue', {
    ...props.modelValue,
    [code]: updated
  })
}
</script>

<style scoped>
.questionnaire-section {
  margin-bottom: var(--spacing-xl);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
}

.section-title {
  font-family: var(--font-serif);
  font-size: var(--font-size-xl);
  font-weight: 600;
  margin: 0;
}

.section-progress {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.question-item {
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background: var(--color-surface);
}

.question-text {
  font-size: var(--font-size-base);
  margin-bottom: var(--spacing-md);
  color: var(--color-text-primary);
}

.options-single,
.options-multiple {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.option-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: all 0.2s ease;
}

.option-item:hover {
  border-color: var(--color-primary);
}

.option-item.selected {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.option-item input {
  display: none;
}

.option-text {
  font-size: var(--font-size-base);
}
</style>
```

### 7. QuestionnaireProgress 组件

问卷进度组件，显示整体填写进度。

```vue
<template>
  <div class="progress-container">
    <div class="progress-bar">
      <div 
        class="progress-fill" 
        :style="{ width: `${percentage}%` }"
      ></div>
    </div>
    
    <div class="progress-info">
      <span class="progress-text">{{ answered }}/{{ total }} 题</span>
      <span class="progress-percentage">{{ percentage.toFixed(0) }}%</span>
    </div>
    
    <div v-if="showSections" class="sections-grid">
      <div 
        v-for="section in sections" 
        :key="section.name"
        class="section-card"
        :class="{ 
          completed: section.completed,
          active: section.name === currentSection 
        }"
        @click="$emit('select-section', section.name)"
      >
        <div class="section-icon">
          <span v-if="section.completed">✓</span>
          <span v-else>{{ section.answered }}</span>
        </div>
        <div class="section-info">
          <h4>{{ section.title }}</h4>
          <p>{{ section.answered }}/{{ section.total }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  answered: Number,
  total: Number,
  sections: Array,
  currentSection: String,
  showSections: {
    type: Boolean,
    default: true
  }
})

const percentage = computed(() => {
  return props.total > 0 ? (props.answered / props.total) * 100 : 0
})
</script>

<style scoped>
.progress-container {
  margin-bottom: var(--spacing-xl);
}

.progress-bar {
  height: 8px;
  background: var(--color-surface);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-primary);
  transition: width 0.3s ease;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-top: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.sections-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

.section-card {
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: all 0.2s ease;
}

.section-card:hover {
  border-color: var(--color-primary);
}

.section-card.completed {
  background: var(--color-success);
  border-color: var(--color-success);
  color: white;
}

.section-card.active {
  border-color: var(--color-primary);
  border-width: 2px;
}

.section-icon {
  font-size: var(--font-size-xl);
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
}

.section-info h4 {
  font-size: var(--font-size-sm);
  margin: 0;
}

.section-info p {
  font-size: var(--font-size-xs);
  margin: 0;
  color: var(--color-text-muted);
}

.section-card.completed .section-info p {
  color: rgba(255, 255, 255, 0.8);
}
</style>
```

### 8. MatchReasonCard 组件

匹配理由卡片组件，显示匹配推荐理由。

```vue
<template>
  <div class="match-reason-card">
    <h4 class="reason-title">匹配理由</h4>
    
    <div class="reason-list">
      <div 
        v-for="(reason, index) in reasons" 
        :key="index"
        class="reason-item"
      >
        <span class="reason-icon">●</span>
        <span class="reason-text">{{ reason }}</span>
      </div>
    </div>
    
    <div v-if="dimensionScores" class="dimension-scores">
      <div 
        v-for="(score, dimension) in dimensionScores" 
        :key="dimension"
        class="score-item"
      >
        <span class="dimension-name">{{ getDimensionLabel(dimension) }}</span>
        <div class="score-bar">
          <div 
            class="score-fill" 
            :style="{ width: `${score}%` }"
          ></div>
        </div>
        <span class="score-value">{{ score.toFixed(0) }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  reasons: Array,
  dimensionScores: Object
})

const dimensionLabels = {
  appearance: '外貌与生活方式',
  personality: '性格特征',
  values: '价值观',
  interests: '兴趣爱好',
  career: '学业规划',
  family: '家庭背景',
  expectation: '期望偏好'
}

const getDimensionLabel = (dimension) => {
  return dimensionLabels[dimension] || dimension
}
</script>

<style scoped>
.match-reason-card {
  background: var(--color-surface);
  padding: var(--spacing-lg);
  margin-top: var(--spacing-md);
}

.reason-title {
  font-size: var(--font-size-base);
  font-weight: 600;
  margin-bottom: var(--spacing-md);
}

.reason-list {
  margin-bottom: var(--spacing-lg);
}

.reason-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-size-sm);
}

.reason-icon {
  color: var(--color-primary);
}

.dimension-scores {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.score-item {
  display: grid;
  grid-template-columns: 100px 1fr 40px;
  align-items: center;
  gap: var(--spacing-sm);
}

.dimension-name {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.score-bar {
  height: 6px;
  background: var(--color-border);
  border-radius: 3px;
  overflow: hidden;
}

.score-fill {
  height: 100%;
  background: var(--color-primary);
  transition: width 0.3s ease;
}

.score-value {
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-align: right;
}
</style>
```

## 性能优化策略

### 1. 代码分割

```javascript
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: () => import('@/views/Landing.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue')
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/match',
    name: 'Match',
    component: () => import('@/views/Match.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/pairings',
    name: 'Pairings',
    component: () => import('@/views/Pairings.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
```

### 2. 图片懒加载

```vue
<template>
  <img
    v-lazy="imageUrl"
    :alt="alt"
    class="lazy-image"
  />
</template>

<script setup>
import { useIntersectionObserver } from '@vueuse/core'

const props = defineProps({
  src: String,
  alt: String
})

const imageUrl = ref('')
const imgRef = ref(null)

const { stop } = useIntersectionObserver(
  imgRef,
  ([{ isIntersecting }]) => {
    if (isIntersecting) {
      imageUrl.value = props.src
      stop()
    }
  }
)
</script>
```

### 3. 虚拟滚动（用于长列表）

```vue
<template>
  <div class="virtual-list" @scroll="handleScroll">
    <div class="virtual-list-content" :style="{ height: totalHeight + 'px' }">
      <div
        v-for="item in visibleItems"
        :key="item.id"
        class="virtual-list-item"
        :style="{ transform: `translateY(${item.offset}px)` }"
      >
        <slot :item="item.data" />
      </div>
    </div>
  </div>
</template>
```

### 4. 防抖和节流

```javascript
import { debounce, throttle } from 'lodash-es'

export const useDebounce = (fn, delay = 300) => {
  return debounce(fn, delay)
}

export const useThrottle = (fn, delay = 300) => {
  return throttle(fn, delay)
}
```

### 5. 缓存策略

```javascript
import { useStorage } from '@vueuse/core'

export const useCache = (key, defaultValue) => {
  return useStorage(key, defaultValue, localStorage)
}

export const useSessionCache = (key, defaultValue) => {
  return useStorage(key, defaultValue, sessionStorage)
}
```

## 响应式设计

### 断点系统

```css
@media (min-width: 640px) {
}

@media (min-width: 768px) {
}

@media (min-width: 1024px) {
}

@media (min-width: 1280px) {
}
```

### 移动端适配

```vue
<template>
  <div class="container">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <div class="p-4">...</div>
    </div>
  </div>
</template>
```

## 状态管理

### Pinia Store 示例

```javascript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || '')
  
  const isLoggedIn = computed(() => !!token.value && !!user.value)
  
  const login = async (email, password) => {
    const res = await api.auth.login({ email, password })
    token.value = res.data.token
    user.value = res.data.user
    localStorage.setItem('token', res.data.token)
  }
  
  const logout = () => {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
  }
  
  const fetchProfile = async () => {
    const res = await api.user.getProfile()
    user.value = res.data
  }
  
  return {
    user,
    token,
    isLoggedIn,
    login,
    logout,
    fetchProfile
  }
})
```

## 构建优化

### Vite 配置

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'pinia'],
          'utils': ['axios', 'lodash-es']
        }
      }
    },
    chunkSizeWarningLimit: 500
  }
})
```

## 部署

### 构建命令

```bash
npm run build
```

### Nginx 配置

```nginx
server {
    listen 80;
    server_name datedrop.csust.edu.cn;
    
    root /var/www/datedrop/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```
