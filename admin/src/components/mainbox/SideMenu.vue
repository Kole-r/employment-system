<template>
    <el-aside width="auto" class="side-aside">
        <div class="side-inner" :class="{ collapsed: collapseStore.isCollapsed }">
            <!-- Logo -->
            <div class="side-logo">
                <span class="logo-mark">E</span>
                <Transition name="label-fade">
                    <span v-if="!collapseStore.isCollapsed" class="logo-text">EMPLOY</span>
                </Transition>
            </div>

            <el-menu
                :collapse="collapseStore.isCollapsed"
                :collapse-transition="false"
                :router="true"
                :default-active="route.fullPath"
                class="side-menu"
            >
                <el-menu-item index="/home">
                    <el-icon><HomeFilled /></el-icon>
                    <template #title>首页</template>
                </el-menu-item>
                <el-menu-item index="/center">
                    <el-icon><UserFilled /></el-icon>
                    <template #title>个人中心</template>
                </el-menu-item>

                <el-sub-menu index="/user-management" v-admin>
                    <template #title>
                        <el-icon><Avatar /></el-icon>
                        <span>用户管理</span>
                    </template>
                    <el-menu-item index="/user-management/UserAdd">添加用户</el-menu-item>
                    <el-menu-item index="/user-management/UserList">用户列表</el-menu-item>
                </el-sub-menu>

                <el-sub-menu index="/news-management">
                    <template #title>
                        <el-icon><Management /></el-icon>
                        <span>新闻管理</span>
                    </template>
                    <el-menu-item index="/news-management/NewsAdd">添加新闻</el-menu-item>
                    <el-menu-item index="/news-management/NewsList">新闻列表</el-menu-item>
                </el-sub-menu>

                <el-sub-menu index="/job-management">
                    <template #title>
                        <el-icon><Briefcase /></el-icon>
                        <span>岗位管理</span>
                    </template>
                    <el-menu-item index="/job-management/JobAdd">发布岗位</el-menu-item>
                    <el-menu-item index="/job-management/JobList">岗位列表</el-menu-item>
                </el-sub-menu>
            </el-menu>

            <!-- 底部版本号 -->
            <div class="side-footer">
                <span class="footer-ver">v1.0</span>
            </div>
        </div>
    </el-aside>
</template>

<script setup>
import { HomeFilled, UserFilled, Avatar, Management, Briefcase } from '@element-plus/icons-vue'
import { useCollapseStore } from '../../store/collapse.js'
import { useRoute } from 'vue-router'
import { useUserInfoStore } from '../../store/userInfo.js'

const collapseStore = useCollapseStore()
const route = useRoute()
const userInfo = useUserInfoStore()

const vAdmin = {
    mounted(el) {
        // 只有 role=1（老师/校方）才能看到用户管理
        if (userInfo.$state.role !== 1) {
            el.parentNode && el.parentNode.removeChild(el)
        }
    }
}
</script>

<style scoped lang="scss">
/* ── Tokens ── */
$black: #F7F8FA;
$surface: #FFFFFF;
$border: #E4E7EB;
$g1: #98A2B3;
$g2: #667085;
$g3: #475467;
$g5: #1D2939;
$white: #344054;
$pure: #101828;
$accent: #2563EB;

.side-aside {
    min-height: 100vh;
    background: $black;
    border-right: 1px solid $border;
    overflow: hidden;
}

.side-inner {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 220px;
    transition: width 200ms ease-out;

    &.collapsed {
        width: 64px;
    }
}

/* ── Logo ── */
.side-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 24px 20px 32px;
    flex-shrink: 0;
}

.logo-mark {
    font-family: 'Space Mono', monospace;
    font-size: 20px;
    font-weight: 700;
    color: $black;
    background: $pure;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.logo-text {
    font-family: 'Space Mono', monospace;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.15em;
    color: $pure;
    white-space: nowrap;
}

/* ── Menu ── */
.side-menu {
    flex: 1;
    border-right: none;
    background: transparent;
    padding: 0 8px;

    /* Element Plus 变量覆盖 */
    --el-menu-bg-color: transparent;
    --el-menu-text-color: #667085;
    --el-menu-hover-text-color: #1D2939;
    --el-menu-hover-bg-color: #F2F4F7;
    --el-menu-active-color: #101828;
    --el-menu-item-height: 44px;
    --el-menu-sub-item-height: 40px;
    --el-menu-base-level-padding: 12px;
    --el-menu-level-padding: 12px;

    /* 一级菜单项 */
    :deep(.el-menu-item),
    :deep(.el-sub-menu__title) {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 14px;
        font-weight: 400;
        border-radius: 8px;
        margin-bottom: 2px;
        padding-left: 14px !important;
        transition: all 150ms ease-out;
        user-select: none;

        &:hover {
            background: #F2F4F7;
            color: $white;
        }
    }

    /* 激活项 */
    :deep(.el-menu-item.is-active) {
        background: #FFFFFF;
        color: $pure;
        font-weight: 500;
        position: relative;

        &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 8px;
            bottom: 8px;
            width: 3px;
            background: $accent;
            border-radius: 0 2px 2px 0;
        }
    }

    /* SubMenu 打开时标题高亮 */
    :deep(.el-sub-menu.is-opened > .el-sub-menu__title),
    :deep(.el-sub-menu.is-active > .el-sub-menu__title) {
        color: $white !important;
        background: #F2F4F7 !important;
    }

    /* 子菜单项 */
    :deep(.el-menu-item) {
        font-size: 13px;
        padding-left: 44px !important;
        color: $g3;

        &.is-active {
            color: $pure;
            background: #FFFFFF;
        }
    }

    /* 图标 */
    :deep(.el-icon) {
        font-size: 18px;
        margin-right: 8px;
        color: inherit;
    }

    /* SubMenu 箭头 */
    :deep(.el-sub-menu__icon-arrow) {
        color: $g2;
        font-size: 12px;
    }
}

/* ── Footer ── */
.side-footer {
    padding: 16px 20px 24px;
    flex-shrink: 0;
}

.footer-ver {
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.1em;
    color: $g1;
}

/* ── Transition ── */
.label-fade-enter-active,
.label-fade-leave-active {
    transition: opacity 150ms ease-out;
}

.label-fade-enter-from,
.label-fade-leave-to {
    opacity: 0;
}
</style>
