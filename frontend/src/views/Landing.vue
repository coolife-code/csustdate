<template>
  <div class="min-h-screen bg-white">
    <header class="border-b border-border">
      <div class="max-w-6xl mx-auto px-md py-md flex justify-between items-center">
        <h1 class="text-2xl font-serif font-semibold">CSUST DateDrop</h1>
        <nav class="flex gap-lg">
          <router-link to="/login" class="text-text-secondary hover:text-primary transition">登录</router-link>
          <router-link to="/register" class="px-lg py-sm bg-primary text-white hover:bg-secondary transition">注册</router-link>
        </nav>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-md py-4xl">
      <div class="text-center mb-4xl">
        <h2 class="text-5xl font-serif font-bold mb-lg">让每一次相遇都值得期待</h2>
        <p class="text-xl text-text-secondary mb-2xl">CSUST DateDrop - 长沙理工大学学生配对网站</p>
        <router-link 
          to="/register" 
          class="inline-block px-2xl py-lg bg-primary text-white text-lg font-semibold hover:bg-secondary transition"
        >
          开始配对
        </router-link>
      </div>

      <div class="border-t border-border pt-4xl mb-4xl">
        <h3 class="text-3xl font-serif text-center mb-2xl">每周二，我们为你精心挑选一位志同道合的伙伴</h3>
      </div>

      <div class="border-t border-border pt-4xl">
        <h3 class="text-3xl font-serif text-center mb-2xl">简单三步，遇见TA</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-2xl mt-2xl">
          <div class="text-center">
            <div class="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-md text-2xl font-bold">1</div>
            <h4 class="text-xl font-semibold mb-sm">注册账号</h4>
            <p class="text-text-secondary">使用教育邮箱完成注册</p>
          </div>
          <div class="text-center">
            <div class="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-md text-2xl font-bold">2</div>
            <h4 class="text-xl font-semibold mb-sm">填写问卷</h4>
            <p class="text-text-secondary">完善个人资料和偏好</p>
          </div>
          <div class="text-center">
            <div class="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-md text-2xl font-bold">3</div>
            <h4 class="text-xl font-semibold mb-sm">等待匹配</h4>
            <p class="text-text-secondary">每周二收到匹配通知</p>
          </div>
        </div>
      </div>
    </main>

    <footer class="border-t border-border py-xl text-center text-text-muted">
      <p>&copy; 2024 CSUST DateDrop. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup>
</script>
