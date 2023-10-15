<template>
	<el-config-provider :size="getGlobalComponentSize" :locale="getGlobalI18n">
		<router-view />
	</el-config-provider>
</template>

<script setup lang="ts" name="app">
import { useI18n } from 'vue-i18n';
import { useTagsViewRoutes } from '/@/stores/tagsViewRoutes';
import { useThemeConfig } from '/@/stores/themeConfig';
import other from '/@/utils/other';
import { Local, Session } from '/@/utils/storage';
import { useChangeColor } from '/@/utils/theme';
import mittBus from '/@/utils/mitt';
import setIntroduction from '/@/utils/setIconfont';

// 定义变量内容
const { messages, locale } = useI18n();
const setingsRef = ref();
const route = useRoute();
const stores = useTagsViewRoutes();
const storesThemeConfig = useThemeConfig();
const { getLightColor, getDarkColor } = useChangeColor();
const { themeConfig } = storeToRefs(storesThemeConfig);

// 获取全局组件大小
const getGlobalComponentSize = computed(() => {
	return other.globalComponentSize();
});
// 获取全局 i18n
const getGlobalI18n = computed(() => {
	return messages.value[locale.value];
});
// 设置初始化，防止刷新时恢复默认
onBeforeMount(() => {
	// 设置批量第三方 icon 图标
	setIntroduction.cssCdn();
	// 设置批量第三方 js
	setIntroduction.jsCdn();
});


// 获取布局配置信息
const getThemeConfig = computed(() => {
	return themeConfig.value;
});
// 1、全局主题
const onColorPickerChange = () => {
	if (!getThemeConfig.value.primary) return ElMessage.warning('全局主题 primary 颜色值不能为空');
	// 颜色加深
	console.log(getThemeConfig.value.primary,document.documentElement.style)
	document.documentElement.style.setProperty('--el-color-primary-dark-2', `${getDarkColor(getThemeConfig.value.primary, 0.1)}`);
	document.documentElement.style.setProperty('--el-color-primary', getThemeConfig.value.primary);
	console.log(document.documentElement.style)
	// 颜色变浅
	for (let i = 1; i <= 9; i++) {
		document.documentElement.style.setProperty(`--el-color-primary-light-${i}`, `${getLightColor(getThemeConfig.value.primary, i / 10)}`);
	}
	setDispatchThemeConfig();
};

// 触发 store 布局配置更新
const setDispatchThemeConfig = () => {
	Local.remove('themeConfig');
	Local.set('themeConfig', getThemeConfig.value);
	Local.set('themeConfigStyle', document.documentElement.style.cssText);
};
// 页面加载时
onMounted(() => {
	nextTick(() => {
		
		setTimeout(() => {
			// 默认样式
			// 语言国际化
			if (Local.get('themeConfig')) locale.value = Local.get('themeConfig').globalI18n;
		}, 100);
		// 监听布局配'置弹窗点击打开
		mittBus.on('openSetingsDrawer', () => {
			setingsRef.value.openDrawer();
		});
		// 获取缓存中的布局配置
		if (Local.get('themeConfig')) {
			storesThemeConfig.setThemeConfig({ themeConfig: Local.get('themeConfig') });
			document.documentElement.style.cssText = Local.get('themeConfigStyle');
		}else{
			setTimeout(()=>{
			onColorPickerChange()

			},300)
		}
		// 获取缓存中的全屏配置
		if (Session.get('isTagsViewCurrenFull')) {
			stores.setCurrenFullscreen(Session.get('isTagsViewCurrenFull'));
		}
	});
});
// 页面销毁时，关闭监听布局配置/i18n监听
onUnmounted(() => {
	mittBus.off('openSetingsDrawer', () => {});
});
// 监听路由的变化，设置网站标题
watch(
	() => route.path,
	() => {
		other.useTitle();
	},
	{
		deep: true,
	}
);
</script>
