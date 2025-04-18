import { createRouter, createWebHashHistory } from 'vue-router'

import Layout from '@/components/layout/layout.vue'
import Login from '@/components/views/login.vue'
import Home from '@/components/views/home.vue'
import Setting from '@/components/views/setting.vue'

const routes = [
  {
    path: '/',
    name: 'Main',
    component: Layout,
    children: [
      {
        path: '',
        name: 'Login',
        component: Login,
      },
      {
        path: 'home',
        component: Home,
      },
      {
        path: 'setting',
        component: Setting,
      },
    ],
  },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
})
