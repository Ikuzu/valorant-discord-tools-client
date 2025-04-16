import { createRouter, createWebHashHistory } from 'vue-router'

import Layout from '@/components/layout/layout.vue'
import Login from '@/components/views/login.vue'
import Home from '@/components/views/home.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Layout, // Layoutで包む
    children: [
      {
        path: '',
        name: 'Login',
        component: Login,
      },
      {
        path: 'home',
        component: Home, // MainViewはLayout内に表示される
      },
    ],
  },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
})
