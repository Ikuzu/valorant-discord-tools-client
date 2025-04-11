import { createRouter, createWebHashHistory } from 'vue-router'

import Layout from '@/components/layout/layout.vue'
import Login from '@/components/views/login.vue'
import Main from '@/components/views/home.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login,
  },
  {
    path: '/main',
    name: 'Main',
    component: Layout, // Layoutで包む
    children: [
      {
        path: '',
        component: Main, // MainViewはLayout内に表示される
      },
    ],
  },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
})
