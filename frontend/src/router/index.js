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
    path: '/questionnaire',
    name: 'Questionnaire',
    component: () => import('@/views/Questionnaire.vue'),
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

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
