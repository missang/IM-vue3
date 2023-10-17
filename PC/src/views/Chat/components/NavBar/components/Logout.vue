<script setup lang="ts">
import {  Session,Local } from '/@/utils/storage';
import { useUserInfo } from '/@/stores/userInfo';
import NProgress from 'nprogress';
const dialogVisible = ref(false)
const isClearStorage = ref(true)

const logoutTheUser = async () => {
    NProgress.start();
    if (isClearStorage.value) {
        dialogVisible.value = false
        Local.clear()
    } else {
        dialogVisible.value = false
    }
    await useUserInfo().logout()
			NProgress.done();
}

defineExpose({
    dialogVisible
})
</script>
<template>
    <el-dialog custom-class="login_diglog" v-model="dialogVisible" title="退出登录" width="480px" :destroy-on-close="true">
        <span class="logout_title">确认退出当前登录账号？</span>
        <br />
        <span class="logout_clear">
            <el-checkbox v-model="isClearStorage" label="清除账号缓存" size="small" />
        </span>
        <template #footer>
            <span class="dialog-footer">
                <el-button style="width:113.6px;" @click="dialogVisible = false">取消</el-button>
                <el-button style="width:113.6px;" type="primary" @click="logoutTheUser">确认退出</el-button>
            </span>
        </template>
    </el-dialog>
</template>



<style lang="scss" scoped>
.logout_title {
    font-family: 'PingFang SC';
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 22px;
    /* or 157% */

    text-align: justify;

    color: #3A3A3A;
}

.logout_clear {
    font-size: 7px;
    font-weight: bold;
}
</style>