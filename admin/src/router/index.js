import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import Mainbox from '../views/MainBox.vue';
import RoutesConfig from './config';
import { useGlobalStore } from '../store/global'; // 引入 Pinia Store
import NotFound from '../views/notFound/NotFound.vue';
import { useUserInfoStore } from '../store/userInfo.js';
import { it } from 'element-plus/es/locales.mjs';

const routes = [
    {
        path: "/Login",
        name: "Login",
        component: Login
    },
    {
        path: "/Mainbox",
        name: "Mainbox",
        component: Mainbox,
        children: [
            {
                path: "/:pathMatch(.*)*",// 匹配所有路径
                name: "NotFound",
                component: NotFound
            }
        ]
        
    }
];
const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    const globalStore = useGlobalStore(); // 获取 Pinia Store 实例
    // 判断是否登录
    if (to.name === "Login") {
        next()
    }
    else {
        // 如果用户没有登录 则跳转到登录页面
        const token = localStorage.getItem('token')
        if (token) {
            if (!globalStore.isGlobalRouter) {
                ConfigRouter(globalStore)
                next({
                    path: to.fullPath,
                })
            } else {
                next()
            }
        } else {
            next({
                path: '/login',
            })
        }
    }
});
const ConfigRouter = (globalStore) => {
    // 动态添加路由
    RoutesConfig.forEach(item => {
        checkPermission(item)&&router.addRoute('Mainbox', item)
    })
    // 添加完路由后，设置 isGlobalRouter 为 true
    globalStore.setGlobalRouter(true);
}
const checkPermission = (item) => {
    // role=1 老师/校方：全部权限
    // role=2 企业人员：除用户管理外的权限
    // role=0 毕业生：不能登录admin（已在登录时拦截）
    if (item.requiresAdmin) {
        const userInfo = useUserInfoStore();
        const role = userInfo.$state.role
        return role === 1;
    }
    return true
}

export default router;