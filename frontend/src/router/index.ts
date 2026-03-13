import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: () => import('../pages/Dashboard.vue'),
    },
    {
      path: '/workout',
      name: 'workout',
      component: () => import('../pages/Workout.vue'),
    },
    {
      path: '/history',
      name: 'history',
      component: () => import('../pages/History.vue'),
    },
    {
      path: '/progress',
      name: 'progress',
      component: () => import('../pages/Progress.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../pages/Settings.vue'),
    },
  ],
})

export default router
