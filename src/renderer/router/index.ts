import { createRouter, createWebHashHistory } from 'vue-router'

import Layout from '@/components/layout/layout.vue'
import Login from '@/components/views/login.vue'
import Home from '@/components/views/home.vue'

const routes = [
  { path: '/', redirect: '/home' },
  {
    path: '/l',
    name: 'Login',
    component: Login,
  },
  {
    path: '/home',
    name: 'Home',
    component: Layout, // Layoutで包む
    children: [
      {
        path: '',
        component: Home, // MainViewはLayout内に表示される
      },
    ],
  },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
})
