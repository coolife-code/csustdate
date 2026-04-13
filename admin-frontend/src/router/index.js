import { createRouter, createWebHashHistory } from 'vue-router'
import UsersPage from '../views/UsersPage.vue'
import MatchesPage from '../views/MatchesPage.vue'
import EmailCenterPage from '../views/EmailCenterPage.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/users'
    },
    {
      path: '/users',
      component: UsersPage
    },
    {
      path: '/matches',
      component: MatchesPage
    },
    {
      path: '/emails',
      component: EmailCenterPage
    }
  ]
})

export default router
