<script setup lang="ts">
import usePlayRing  from '/@/hooks/usePlayRing'
import {  Local } from '/@/utils/storage';
import { useThemeConfig } from '/@/stores/themeConfig';
import { useI18n } from 'vue-i18n';
import other from '/@/utils/other';
const storesThemeConfig = useThemeConfig();
const { themeConfig } = storeToRefs(storesThemeConfig);

// 定义变量内容
const { locale, t } = useI18n();
const dialogVisible = ref(false)
const { isOpenPlayRing } = usePlayRing()

// const { isOpenedEMLog, donwLoadEMLog } = useSetEMLogConfig()

const state = reactive<State>({
		isScreenfull: false,
		disabledI18n: themeConfig.value.globalI18n || 'zh-cn',
		disabledSize: 'large',
	});

// 语言切换
const onLanguageChange = (lang: string) => {
	Local.remove('themeConfig');
	themeConfig.value.globalI18n = lang;
	Local.set('themeConfig', themeConfig.value);
	locale.value = lang;
	other.useTitle();
	initI18nOrSize('globalI18n', 'disabledI18n');
};

// 初始化组件大小/i18n
const initI18nOrSize = (value: string, attr: string) => {
	state[attr] = Local.get('themeConfig')[value];
};
defineExpose({
    dialogVisible
})
</script>

<template>
    <el-dialog
        custom-class="personal_setting_card"
        v-model="dialogVisible"
        width="366px"
        title="个人设置"
        :show-close="true"
        :destroy-on-close="true"
    >
    
        <div class="setting_main">
            <div class="setting_main_item">
                <el-tooltip
                    class="item"
                    effect="dark"
                    content="开启后可在收到消息时，播放消息提示音。"
                    placement="top"
                >
                    <span>新消息提示音</span>
                </el-tooltip>

                <el-switch
                    v-model="isOpenPlayRing"
                    active-text="开启"
                    inactive-text="关闭"
                />
            </div>
            <div class="setting_main_item">
                <span>语言切换</span>
                
                <el-dropdown :show-timeout="70" :hide-timeout="50" trigger="click" @command="onLanguageChange">
                    <div class="layout-navbars-breadcrumb-user-icon">
                        <!-- <i class="iconfont" :class="state.disabledI18n === 'en' ? 'icon-fuhao-yingwen' : 'icon-fuhao-zhongwen'" :title="$t('user.title1')"></i> -->
                        <img class="language-ico" :src="`/@/assets/language/${state.disabledI18n}.png`" />
                    </div>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item command="zh-ch" :disabled="state.disabledI18n === 'zh-ch'">简体中文</el-dropdown-item>
                            <el-dropdown-item command="en" :disabled="state.disabledI18n === 'en'">English</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>
            <!-- <div class="setting_main_item">
                <el-tooltip
                    class="item"
                    effect="dark"
                    content="开启SDK日志后，会在控制台输出SDK日志,并可下载SDK缓存日志。"
                    placement="top"
                >
                    <span>开启SDK日志</span></el-tooltip
                >
                <el-switch
                    v-model="isOpenedEMLog"
                    active-text="开启"
                    inactive-text="关闭"
                />
            </div>
            <div class="setting_main_item" v-if="isOpenedEMLog">
                <el-button
                    class="download_log"
                    type="primary"
                    plain
                    @click="donwLoadEMLog"
                    >下载SDK缓存日志</el-button
                >
            </div> -->
            <!-- <div>
                <span>新消息系统推送</span>
                <el-switch v-model="" active-text="开启" inactive-text="关闭" />
            </div> -->
        </div>
    </el-dialog>
</template>

<style lang="scss" scoped>
.setting_main {
    width: 100%;
    height: 100%;

    .setting_main_item {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
    }
}
.language-ico{
    width:50px;
}
</style>
