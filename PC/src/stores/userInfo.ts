import { defineStore } from 'pinia';
import { Session } from '/@/utils/storage';
import { getUserInfo, login,logout, loginByMobile, loginBySocial, refreshTokenApi } from '/@/api/login/index';
// import other from '/@/utils/other';
import { useMessage } from '/@/hooks/message';

import { i18n } from '/@/i18n';
const { t } = i18n.global;

/**
 * @function useUserInfo
 * @returns {UserInfosStore}
 */
export const useUserInfo = defineStore('userInfo', {
	state: (): UserInfosState => ({
		userInfos: {
			userName: '',
			photo: '',
			time: 0,
			uid:0,
			roles: [],
			authBtnList: [],
		},
		loginUserOnlineStatus:""
	}),

	actions: {
		/**
		 * 登录方法
		 * @function login
		 * @async
		 * @param {Object} data - 登录数据
		 * @returns {Promise<Object>}
		 */
		async login(data:any) {
			// data.grant_type = 'password';
			// data.scope = 'server';

			return new Promise((resolve, reject) => {
				login(data)
					.then((res) => {
						// 存储token 信息
						Session.set('token', res.data.token);
						Session.set('sso', res.data.sso);
						resolve(res);
					})
					.catch((err) => {
						useMessage().error(err?.msg || t('error.500'));
						reject(err);
					});
			});
		},
		
		async logout(data:any) {
			return new Promise((resolve, reject) => {
				logout({
					logout_uid:this.userInfos.uid
				})
					.then((res) => {
						Session.clear()
						window.location.reload();
						resolve(res);
					})
					.catch((err) => {
						useMessage().error(err?.msg || t('error.500'));
						reject(err);
					});
			});
		},

		/**
		 * 手机登录方法
		 * @function loginByMobile
		 * @async
		 * @param {Object} data - 登录数据
		 * @returns {Promise<Object>}
		 */
		async loginByMobile(data) {
			return new Promise((resolve, reject) => {
				loginByMobile(data.mobile, data.code)
					.then((res) => {
						// 存储token 信息
						Session.set('token', res.access_token);
						Session.set('refresh_token', res.refresh_token);
						resolve(res);
					})
					.catch((err) => {
						useMessage().error(err?.msg || t('error.500'));
						reject(err);
					});
			});
		},

		/**
		 * 社交账号登录方法
		 * @function loginBySocial
		 * @async
		 * @param {string} state - 状态
		 * @param {string} code - 代码
		 * @returns {Promise<Object>}
		 */
		async loginBySocial(state, code) {
			return new Promise((resolve, reject) => {
				loginBySocial(state, code)
					.then((res) => {
						// 存储token 信息
						Session.set('token', res.access_token);
						Session.set('refresh_token', res.refresh_token);
						resolve(res);
					})
					.catch((err) => {
						useMessage().error(err?.msg || t('error.500'));
						reject(err);
					});
			});
		},

		/**
		 * 刷新token方法
		 * @function refreshToken
		 * @async
		 * @returns {Promise<any>}
		 */
		async refreshToken() {
			return new Promise((resolve, reject) => {
				const refreshToken = Session.get('refresh_token');
				refreshTokenApi(refreshToken)
					.then((res) => {
						// 存储token 信息
						Session.set('token', res.access_token);
						Session.set('refresh_token', res.refresh_token);
						resolve(res);
					})
					.catch((err) => {
						useMessage().error(err.msg);
						reject(err);
					});
			});
		},

		/**
		 * 获取用户信息方法
		 * @function setUserInfos
		 * @async
		 */
		async setUserInfos() {
			
			return new Promise((resolve, reject) => {
				
				getUserInfo().then((res:any) => {
					const userInfo: any = {
						avatar: res.data.avatar,
						invite_code:res.data.invite_code,
						kf_id:res.data.kf_id,
						nickname:res.data.nickname,
						prompt_tone:res.data.prompt_tone,
						third_url:res.data.third_url,
						username:res.data.username,
						uid:res.data.uid,
						unread_friend_apply_count:res.data.unread_friend_apply_count
					};
					this.userInfos = userInfo;
					resolve(res);
				})
				.catch((err) => {
					useMessage().error(err.msg);
					reject(err);
				});
			});

		},
        //修改登陆用户的用户属性
        async updateMyUserInfo ( params:any) {
			// 调用接口
            const { data } = await {data:{}}
            console.log('>>>>>>修改成功', data)
			this.userInfos = Object.assign(this.userInfos, data)
        },

        //处理在线状态订阅变更（包含他人的用户状态）
        handlePresenceChanges ( status:any){
			this.loginUserOnlineStatus = status ? status : 'Unset'
            // if (userId === this.userInfos.uid) {
			// 	this.loginUserOnlineStatus = statusType ? statusType : 'Unset'
            // } else {
            //     console.log('>>>>>>不是自己的状态')
            // }
        },
	},
});
