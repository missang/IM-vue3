import { defineStore } from 'pinia';
import { Session } from '/@/utils/storage';

/**
 * TagsView 路由列表
 * @methods setTagsViewRoutes 设置 TagsView 路由列表
 * @methods setCurrenFullscreen 设置开启/关闭全屏时的 boolean 状态
 */
export const uesCommon = defineStore('common', {
	state: (): CommonStore => ({
		networkStatus: true
	}),
	actions: {
		async setNetworkStatus(data: boolean) {
			this.networkStatus = data;
		},
	}
});
