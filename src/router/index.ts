import { createRouter, createWebHistory } from 'vue-router'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: 'index'
    },
    {
      path: '/index',
      name: 'index',
      component: () => import('@/views/IndexPage.vue')
    }
  ]
})

export default router
