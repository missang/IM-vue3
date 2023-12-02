import { defineStore } from 'pinia';
import { Local, Session } from '/@/utils/storage';

// import other from '/@/utils/other';

import { useLocalStorage,useStorage } from '@vueuse/core'
import { useMessage } from '/@/hooks/message';
import {
    sortPinyinFriendItem, handlePresence, createConversation,
    sortConversation,
    createInform
} from '/@/utils/handleSomeData';
import {uesStoreMessage} from './message';
import { useUserInfo } from './userInfo';
import { uesConversation } from './conversation';
import { baseChat, getFriendList,getGroupDetail } from '/@/api/chat';
import _ from 'lodash'

import { i18n } from '/@/i18n';
const { t } = i18n.global;
const userInfoStore = useUserInfo()
const MessageStore = uesStoreMessage()

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
        // 初始化基础消息
        async getBaseChat() {
            const conversationStore = uesConversation()
            return new Promise(async (resolve, reject) => {
                try {
                   const result =  await baseChat();
                   useLocalStorage(`IM_PC_${userInfoStore.userInfos.uid}_conversationList`, result.data.chatting)
                    await this.fetchAllFriendListFromServer()
                    await this.fetchGroupList(result.data.group)
                    conversationStore.init_conversation_state(userInfoStore.userInfos.uid)
                    resolve(true)
                } catch (error) {
                    reject(error)
                }
            })
        },

        //获取群组列表
        async fetchGroupList(params: any) {

            let groupListData: any = {}
            params.map((item:any)=>{
                groupListData[item.gid] = {groupid:item.gid,groupname:item.name,...item}
            })
            // 调用接口或者去stores拿数据
            const res = groupListData
            const goupListData = _.keyBy(groupListData, 'gid')
            this.setGroupList({ setType: 'init', data: goupListData })
            console.log('>>>>>触发了拉取群组列表更新',goupListData)
        },
        //获取指定群详情
        async getAssignGroupDetail(goupsId: number) {
            const result = await getGroupDetail(goupsId)
            // console.log('>>>>>>>群详情获取成功result', result);
            result.data && this.setGroupList({ setType: 'replenish', data: result.data.info })
        },
        //获取排序后好友列表
        sortedFriendList() {
            return sortPinyinFriendItem(this.contacts.friendList)
        },
        //获取他人用户属性
        async getOtherUserInfo(users: any) {
            /**
             * @param {String|Array} users - 用户id
             */

            return new Promise(async (resolve, reject) => {
                let usersInfosObj = {}
                const requestTask: any = []
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
        async fetchAllFriendListFromServer() {

            return new Promise(async (resolve, reject) => {
                let friendListData: any = {}
                const { data } = await getFriendList()
                for (const key in data) {
                    if (Object.prototype.hasOwnProperty.call(data, key)) {
                        const element = data[key];
                        for (const keys in element) {
                            const elements = element[keys];
                            friendListData[elements.uid] = elements
                        }
                    }
                }
                const friendListWithInfos = {}
                //合并两对象
                const mergedFriendList = _.merge(
                    friendListData,
                    friendListWithInfos
                )

                this.contacts.friendList = _.assign({}, mergedFriendList)
                try {
                    //获取好友列表 接口获取
                    // data.length > 0 &&
                    //     data.map((item:any) => (friendListData[item] = { uid: item }))
                    //     console.log(friendListData)
                    //获取好友列表对应的用户属性
                    //提交之后订阅好友状态
                    await this.subFriendsPresence(friendListData)
                    resolve(true)
                } catch (error) {
                    //异常一般为获取会话异常，直接提交好友列表
                    this.contacts.friendList = _.assign({}, friendListData)
                    //提交之后订阅好友状态
                    await this.subFriendsPresence(data)
                    reject(error)
                }
            })


        },

        /**
         * 
         * @param payload 新增联系人
         * @returns 
         */
        async onAddedNewFriend(params: any) {
            const { from: userId } = params
            let friendData: any = {}
            friendData[userId] = { uid: userId }
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
        async onDeleteFriend(params: any) {
            //取消订阅好友状态。
            const { from: userId } = params
            this.unsubFriendsPresence([userId])
            userId && delete this.contacts.friendList[userId]
        },

        /**
         * 
         * @param payload 获取黑名单列表
         * @returns 
         */
        async fetchBlackList() {
            // 接口获取
            const { data } = await { data: [] }
            data.length > 0 && (() => { this.contacts.friendBlackList = _.assign([], data) })
        },

        async subFriendsPresence(users: any) {
            const requestTask: any = []
            const usersArr = _.chunk([], 5) //分拆users 订阅好友状态一次不能超过100个
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

                const friendList = this.contacts.friendList
                tobeCommitRes.length > 0 &&
                    tobeCommitRes.forEach((item: any) => {
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
        async unsubFriendsPresence(user: any) {
            const option = {
                usernames: [...user]
            }
            // 调用接口或者订阅
            // EaseChatClient.unsubscribePresence(option).then((res) => {
            //     console.log('>>>>>>>成功取消订阅', res)
            // })
        },

        setGroupList(payload: any) {
            //init 为初始化获取 replenish 补充群列表（包括补充群详情）
            const { setType, data } = payload
            if (setType === 'init') {
                this.contacts.groupList = {}
                this.contacts.groupList = _.assign({}, data)
            }
            if (setType === 'replenish') {
                const { gid, name, disabled } = data
                if (this.contacts.groupList[gid]) {
                    this.contacts.groupList[gid].groupDetail = data
                } else {
                    this.contacts.groupList[gid] = {
                        groupid: gid,
                        groupname: name,
                        disabled: disabled,
                        groupDetail: data
                    }
                }
                console.log('>>>>>补充群详情', data)
            }
        },

        //示例优化方向--减少群组详情的调用，转为更新本地群组详情数据
        update_group_infos ( payload:any) {
            console.log('>>>>>>开始修改', payload)
            const { groupId, type, params } = payload
            //key(群id)，type（群详情对应要修改的字段）
            if (
                this.contacts.groupList[groupId] &&
                this.contacts.groupList[groupId].groupDetail
            ) {
                switch (type) {
                    //修改群名
                    case 'groupName':
                        {
                            console.log('>>>>>>进入群组名称修改')
                            this.contacts.groupList[groupId].groupDetail.name = params
                        }
                        break
                    case 'groupDescription':
                        {
                            this.contacts.groupList[groupId].groupDetail.description =
                                params
                        }
                        break
                    case 'addAffiliationsCount':
                        {
                            this.contacts.groupList[
                                groupId
                            ].groupDetail.affiliations_count =
                                this.contacts.groupList[groupId].groupDetail
                                    .affiliations_count + 1
                        }
                        break
                    case 'delAffiliationsCount':
                        {
                            this.contacts.groupList[
                                groupId
                            ].groupDetail.affiliations_count =
                                this.contacts.groupList[groupId].groupDetail
                                    .affiliations_count - 1
                        }
                        break
                    default:
                        break
                }
            }
        },
        //示例优化方向--更改本地群组列表群名(或其他状态)
        update_group_list ( payload:any){
            const { type, groupId, groupName } = payload
            if (type === 'updateGroupName') {
                console.log('>>>>>更新本地群组列表群名')
                this.contacts.groupList[groupId].groupname = groupName
            }
            if (type === 'deleteFromList') {
                console.log('>>>>>从本地群组列表中删除某个群')
                this.contacts.groupList[groupId] && delete this.contacts.groupList[groupId]
            }
        }

    },

    getters: {
        storeFriendList(state) {
            return state.contacts.friendList
        }

    }
});
