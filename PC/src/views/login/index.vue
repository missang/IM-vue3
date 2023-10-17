<template>
	<div class="select-none">
		<div class="mini_qr">
			<img src="/@/assets/qrcode.png" />
			<p>{{ t('scan.wechatApp') }}</p>
		</div>
		<div class="login-container">
		<div class="tenant">
			<tenant />
		</div>
			<div class="login-box">
				<div class="login-form">
					<el-tabs v-model="tabsActiveName" >
						<el-tab-pane :label="$t('label.one1')" name="account">
							<Password @signInSuccess="signInSuccess" />
						</el-tab-pane>
						<!-- <el-tab-pane :label="$t('label.two2')" name="mobile">
							<Mobile @signInSuccess="signInSuccess" />
						</el-tab-pane>
						<el-tab-pane :label="$t('label.three3')" name="social">
							<Social @signInSuccess="signInSuccess" />
						</el-tab-pane> -->
						<el-tab-pane :label="$t('label.register')" name="register">
							<Register @afterSuccess="tabsActiveName = 'account'" />
						</el-tab-pane>
					</el-tabs>
					
				</div>
			</div>
		</div>
		<div  class="login-right">
			<div>

				<div class="login-title">{{ getThemeConfig.globalTitle }}</div><img src="/@/assets/login_bg.png" />


				<div class="toServer">{{$t('toServer')}}</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts" name="loginIndex">
import { useThemeConfig } from '/@/stores/themeConfig';
import illustration from '/@/assets/login/login_bg.svg';
import bg from '/@/assets/login/bg.png';
import miniQr from '/@/assets/login/mini_qr.png';
import { useI18n } from 'vue-i18n';
import { formatAxis } from '/@/utils/formatTime';
import { useMessage } from '/@/hooks/message';
import { initBackEndControlRoutes } from '/@/router/backEnd';
import { NextLoading } from '/@/utils/loading';

// 引入组件
const Password = defineAsyncComponent(() => import('./component/password.vue'));
const Mobile = defineAsyncComponent(() => import('./component/mobile.vue'));
const Social = defineAsyncComponent(() => import('./component/social.vue'));
const Register = defineAsyncComponent(() => import('./component/register.vue'));
const Tenant = defineAsyncComponent(() => import('./component/tenant.vue'));

// 定义变量内容
const storesThemeConfig = useThemeConfig();
const { themeConfig } = storeToRefs(storesThemeConfig);
console.log(themeConfig.value,999)
const { t } = useI18n();
const route = useRoute();
const router = useRouter();

// 是否开启注册
const registerEnable = ref(import.meta.env.VITE_REGISTER_ENABLE === 'true');

// 默认选择账号密码登录方式
const tabsActiveName = ref('account');

// 获取布局配置信息
const getThemeConfig = computed(() => {
	return themeConfig.value;
});

// 登录成功后的跳转处理事件
const signInSuccess = async () => {
	
		// 初始化登录成功时间问候语
		let currentTimeInfo = formatAxis(new Date());
		if (route.query?.redirect&& route.query?.redirect !=='/') {
			router.push({
				path: <string>route.query?.redirect,
				query: Object.keys(<string>route.query?.params).length > 0 ? JSON.parse(<string>route.query?.params) : '',
			});
		} else {
			router.push('/chat');
		}
		// 登录成功提示
		const signInText = t('signInText');
		useMessage().success(`${currentTimeInfo}，${signInText}`);
		// 添加 loading，防止第一次进入界面时出现短暂空白
		// NextLoading.start();
		// NextLoading.done();
};

// 页面加载时
onMounted(() => {
	// NextLoading.done();
});
</script>
