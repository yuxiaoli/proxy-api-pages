import { createRouter, createWebHashHistory } from 'vue-router'
import Transformer from '@/views/Transformer.vue'
import CacheUpdate from '@/views/CacheUpdate.vue'
import Services from '@/views/Services.vue'
import Settings from '@/views/Settings.vue'

const router = createRouter({
  history: createWebHashHistory('/proxy-api-pages/'),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Transformer
    },
    {
      path: '/cache',
      name: 'cache',
      component: CacheUpdate
    },
    {
      path: '/services',
      name: 'services',
      component: Services
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings
    }
  ]
})

export default router
