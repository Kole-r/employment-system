<template>
    <el-container>
        <SideMenu/>
        <el-container direction="vertical">
            <TopHeader/>
            <el-main>
                <router-view />
            </el-main>
        </el-container>
    </el-container>
</template>

<script setup>
import TopHeader from '../components/mainbox/TopHeader.vue';
import SideMenu from '../components/mainbox/SideMenu.vue';
</script>
<style lang="scss" scoped>
.el-main {
    overflow: auto;
    padding: 24px;
    height: calc(100vh - 56px);
    background-color: #F7F8FA;
    min-height: calc(100vh - 56px);
}
</style>