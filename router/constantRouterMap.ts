import { RouteRecordRaw } from 'vue-router'
import layout from '@renderer/layout/index.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',

    component: () => import('@renderer/views/login/index.vue'),
  },
  {
    path: '/',
    component: layout,
    redirect: 'home',
    children: [
      {
        path: 'home',
        component: () => import('@renderer/views/index.vue'),
      },
      {
        path: 'appraise',
        component: () => import('@renderer/views/appraise/index.vue'),
      },
      {
        path: 'chat',
        name: 'Chat',
        component: () => import('@renderer/views/chat/index.vue'),
        meta: {
          keepAlive: true, // 指定该页面需要缓存
        },
      },
      {
        path: 'config',
        component: () => import('@renderer/views/config/index.vue'),
      },
      {
        path: 'onLine',
        component: () => import('@renderer/views/OnlineVisitors/index.vue'),
      },
      {
        path: 'MessageBoard',
        component: () => import('@renderer/views/MessageBoard/index.vue'),
      },
      {
        path: 'WorkOrder',
        component: () => import('@renderer/views/WorkOrder/index.vue'),
      },
    ],
  },

  {
    path: '/:pathMatch(.*)*',
    component: () => import('@renderer/views/404/404.vue'),
  },
]

export default routes
