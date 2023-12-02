<template>
	<div id="tenant">
		
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
</template>

<script setup lang="ts" name="language">

import {  Local } from '/@/utils/storage';
import { useThemeConfig } from '/@/stores/themeConfig';
import { useI18n } from 'vue-i18n';
import other from '/@/utils/other';
const storesThemeConfig = useThemeConfig();
const { themeConfig } = storeToRefs(storesThemeConfig);

// 定义变量内容
const { locale, t } = useI18n();

	interface State {
		[key: string]: boolean | string;
		isScreenfull: boolean;
		disabledI18n: string;
		disabledSize: string;
	}
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

// 页面加载时
onMounted(() => {
	if (Local.get('themeConfig')) {
		initI18nOrSize('globalComponentSize', 'disabledSize');
		initI18nOrSize('globalI18n', 'disabledI18n');
	}
});
</script>
<style scoped>
.language-ico{
	width:50px;
}
</style>
