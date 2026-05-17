import { createRouter, createWebHistory } from 'vue-router'
import { useUserInfoStore } from '../store/userInfo'
import { useGlobalStore } from '../store/global'
import Login from '../views/Login.vue'
import MainBox from '../components/MainBox.vue'
import Home from '../views/Home.vue'

const routes = [
  { path: '/login', component: Login },
  {
    path: '/mainbox',
    component: MainBox,
    children: [
      { path: '/home', component: Home },
      { path: '/', redirect: '/home' }
    ]
  },
  { path: '/', redirect: '/home' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.path === '/login') {
    next()
    return
  }

  const userInfoStore = useUserInfoStore()
  if (!userInfoStore.token) {
    next('/login')
    return
  }

  const globalStore = useGlobalStore()
  if (!globalStore.isRouterAdded) {
    // 动态添加更多路由
    const dynamicRoutes = [
      { path: '/news', component: () => import('../views/NewsList.vue') },
      { path: '/news/:id', component: () => import('../views/NewsDetail.vue') },
      { path: '/jobs', component: () => import('../views/JobList.vue') },
      { path: '/jobs/:id', component: () => import('../views/JobDetail.vue') },
      { path: '/profile', component: () => import('../views/Profile.vue') },
      { path: '/favorites', component: () => import('../views/Favorites.vue') },
      { path: '/resume', component: () => import('../views/Resume.vue') },
    ]

    dynamicRoutes.forEach(route => {
      router.addRoute('mainbox', route)
    })
    // 也把 /home 和 / 添加到 mainbox
    router.addRoute('mainbox', { path: '/home', component: Home })
    router.addRoute('mainbox', { path: '/', redirect: '/home' })

    globalStore.setRouterAdded(true)
    next({ ...to, replace: true })
    return
  }

  next()
})

export default router
