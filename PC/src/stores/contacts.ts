import { defineStore } from 'pinia';
import { Session } from '/@/utils/storage';

// import other from '/@/utils/other';
import { useMessage } from '/@/hooks/message';
import { sortPinyinFriendItem, handlePresence } from '/@/utils/handleSomeData'
import _ from 'lodash'

import { i18n } from '/@/i18n';
const { t } = i18n.global;

/**
 * @function contacts
 * @returns {Contacts}
 */
export const uesContacts = defineStore('contacts', {
	state: (): Contacts => ({
		contacts: {
            friendList: {},
            groupList: {},
            friendBlackList: []
		},
	}),

	actions: {
        //获取群组列表
        async fetchGroupList( params:any) {
            // 调用接口或者去stores拿数据
            const res = await {data:{}}
            const goupListData = _.keyBy(res.data, 'groupid')
            // commit('SET_GROUP_LIST', { setType: 'init', data: goupListData })
            this.setGroupList({setType: 'init', data: goupListData})
            console.log('>>>>>触发了拉取群组列表更新')
        },
        //获取指定群详情
        async getAssignGroupDetail  ( goupsId:number) {
            const options = {
                groupId: goupsId // 群组id
            }
            const result = await {data:[]}
            // console.log('>>>>>>>群详情获取成功result', result);
            result.data && this.setGroupList({setType: 'replenish', data: result.data[0]})
        },
        //获取排序后好友列表
        sortedFriendList(){
            return sortPinyinFriendItem(this.contacts.friendList)
        },
        //获取他人用户属性
       async getOtherUserInfo (users:any) {
            /**
             * @param {String|Array} users - 用户id
             */

            return new Promise(async (resolve, reject) => {
                let usersInfosObj = {}
                const requestTask:any = []
                const usersArr = _.chunk([...users], 99) //分拆users 用户属性获取一次不能超过100个
                try {
                    usersArr.length > 0 &&
                        usersArr.map((userItem) =>
                            requestTask.push(
                                // EaseChatClient.fetchUserInfoById(userItem)
                            )
                        )
                    const result = await Promise.all(requestTask)
                    const usersInfos = _.map(result, 'data')
                    usersInfos.length > 0 &&
                        usersInfos.map(
                            (item) =>
                                (usersInfosObj = Object.assign(
                                    usersInfosObj,
                                    item
                                ))
                        )
                    resolve(usersInfosObj)
                } catch (error) {
                    reject(error)
                }
            })
        },
        /**
         * 
         * @param payload 接口获取联系人列表
         * @returns 
         */
        async fetchAllFriendListFromServer(payload:any) {

            const friendListData:any = {}
            const { data } ={data:[]}
            try {
                //获取好友列表 接口获取
                data.length > 0 &&
                    data.map((item) => (friendListData[item] = { hxId: item }))
                //获取好友列表对应的用户属性
                const friendListWithInfos = await this.getOtherUserInfo(data)
                //合并两对象
                const mergedFriendList = _.merge(
                    friendListData,
                    friendListWithInfos
                )

                this.contacts.friendList = _.assign({}, mergedFriendList)
                //提交之后订阅好友状态
                await this.subFriendsPresence(data)
            } catch (error) {
                //异常一般为获取会话异常，直接提交好友列表
                this.contacts.friendList = _.assign({}, friendListData)
                //提交之后订阅好友状态
                await this.subFriendsPresence(data)
            }

        },

        /**
         * 
         * @param payload 新增联系人
         * @returns 
         */
        async onAddedNewFriend( params:any){
            const { from: userId } = params
            let friendData:any = {}
            friendData[userId] = { hxId: userId }
            try {
                const newfriendInfos = await this.getOtherUserInfo([userId])
                console.log('newfriendInfos', newfriendInfos)
                _.merge(friendData, newfriendInfos)
                this.contacts.friendList = _.assign(this.contacts.friendList, friendData)
            } catch (error) {
                console.log('>>>>新增好友数据处理失败', error)
            }
            //订阅新增联系人
            this.subFriendsPresence([userId])
        },

        /**
         * 
         * @param payload 删除本地联系人
         * @returns 
         */
        async onDeleteFriend (params:any){
            //取消订阅好友状态。
            const { from: userId } = params
            this.unsubFriendsPresence([userId])
            userId && delete  this.contacts.friendList[userId]
        },
        
        /**
         * 
         * @param payload 获取黑名单列表
         * @returns 
         */
        async fetchBlackList () {
            // 接口获取
            const { data } = await {data:[]}
            data.length > 0 && (()=>{this.contacts.friendBlackList = _.assign([], data) })
        },

        async subFriendsPresence (users:any){
            const requestTask:any = []
            const usersArr = _.chunk([...users], 5) //分拆users 订阅好友状态一次不能超过100个
            try {
                usersArr.length > 0 &&
                    usersArr.map((userItem) =>
                        requestTask.push(
                            // EaseChatClient.subscribePresence({
                            //     usernames: userItem,
                            //     expiry: 30 * 24 * 3600
                            // })
                        )
                    )
                const resultData = await Promise.all(requestTask)
                const usersPresenceList = _.flattenDeep(
                    _.map(resultData, 'result')
                ) //返回值是个二维数组，flattenDeep处理为一维数组
                const tobeCommitRes =
                    usersPresenceList.length > 0 &&
                    usersPresenceList.filter((p) => p.uid !== '') || []
                console.log('resultData', resultData)

            const friendList = this.contacts.friendList
            tobeCommitRes.length > 0 &&
            tobeCommitRes.forEach((item:any) => {
                    const commonStatus = handlePresence(item)
                    if (friendList[commonStatus.uid]) {
                        friendList[commonStatus.uid].userStatus = commonStatus
                    }
                })
            } catch (error) {
                console.log('>>>>>>订阅失败', error)
            }
        },
        //取消订阅
        async unsubFriendsPresence (user:any) {
            const option = {
                usernames: [...user]
            }
            // 调用接口或者订阅
            // EaseChatClient.unsubscribePresence(option).then((res) => {
            //     console.log('>>>>>>>成功取消订阅', res)
            // })
        },

        setGroupList (payload:any)  {
            //init 为初始化获取 replenish 补充群列表（包括补充群详情）
            const { setType, data } = payload
            if (setType === 'init') {
                this.contacts.groupList = _.assign({}, data)
            }
            if (setType === 'replenish') {
                const { id, name, disabled } = data
                if (this.contacts.groupList[id]) {
                    this.contacts.groupList[id].groupDetail = data
                } else {
                    this.contacts.groupList[id] = {
                        groupid: id,
                        groupname: name,
                        disabled: disabled,
                        groupDetail: data
                    }
                }
                console.log('>>>>>补充群详情', data)
            }
        },

	},
});
