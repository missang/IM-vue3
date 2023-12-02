
import request from '/@/utils/request';

import axios from 'axios';



/**
 * 获取基本信息（当前聊天列表:群组，单聊，基本设置信息:logo,appname,语言等）
 */
export function baseChat() {
	return request({
		url: '/h5/pop/get',
		method: 'get',
	});
}
/**
 * 获取通讯录列表
 */
export function getFriendList() {
	return request({
		url: '/h5/friend/getlist',
		method: 'get',
	});
}

/**
 * @param
 * 获取群或者个人的历史消息
 */

export function getHistoryMessage(query?: Object) {
	return request({
		url: '/h5/message/get',
		method: 'get',
		params: query,
	});
}

/**
 * 查询当前用户信息
 * @param uid 用户id
 */

export function getFriendInfo(uid: number) {
	return request({
		url: '/h5/user/detail',
		method: 'get',
		params:{
			uid
		}
	});
}
/**
 * 申请添加为好友
 * @param data 
 */
export function getApplyFriend(data: ApplyFriend) {
	return request({
		url: '/h5/friend/apply',
		method: 'post',
		data:data
	});
}
/**
 * 查询当前用户信息（添加好友之前查询）
 * @param data 
 */
export function getApplyFriendInfo(username: string) {
	return request({
		url: '/h5/user/getbyname',
		method: 'get',
		params:{
			username
		}
	});
}
/**
 * 获取群详情信息
 * @param groupId
 */
export function getGroupDetail(gid:any,count = 1) {
	return request({
		url: '/h5/group/detail',
		method: 'get',
		params:{
			gid:gid,
			count:count
		}
	});
}

export function getInitialize() {
	return axios.get(import.meta.env.VITE_API_URL + '/h5/pop/get');
}
