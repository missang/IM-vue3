import { defineStore } from 'pinia';
import { ElMessage, ElMessageBox } from 'element-plus';
import _ from 'lodash'
import { uesContacts } from './contacts';
/**
 * 路由列表
 * @methods setRoutesList 设置路由数据
 * @methods setColumnsMenuHover 设置分栏布局菜单鼠标移入 boolean
 * @methods setColumnsNavHover 设置分栏布局最左侧导航鼠标移入 boolean
 */
export const useGroups = defineStore('goups', {
	state:(): GroupsInfos => ({
        groupsInfos: null
	}),
	actions: {
        
        set_groups_admins ( payload:any) {
            console.log('>>>>>开始赋值群组管理员', payload)
            const { groupId, admin } = payload
            if (!this.groupsInfos[groupId]) {
                this.groupsInfos[groupId] = {}
            }
            this.groupsInfos[groupId].admin = admin
        },

        //初始群信息需要多个请求
        async fetchMultiGoupsInfos (groupid :any){


            this.fetchGoupsAdmin(groupid)
            this.fetchAnnounment(groupid)
            //重新获取黑名单列表
            this.fetchGoupsBlackList(groupid)
            this.fetchGoupsMember(groupid)
            //普通群成员无权调用禁言列表
            this.fetchGoupsMuteList(groupid)
        },
        
        //群管理员
        async fetchGoupsAdmin ( groupId:any) {
            // const { data } = await EaseChatClient.getGroupAdmin({
            //     groupId: params
            // })
            // commit('SET_GORUPS_ADMINS', { groupId: params, admin: data })

            this.set_groups_admins(groupId)
            if (!this.groupsInfos[groupId]) {
                this.groupsInfos[groupId] = {}
            }
            this.groupsInfos[groupId].admin = true // 判断是否是管理员
        },
        //群组成员
        async fetchGoupsMember ( params:any){
            console.log('>>>>>>>开始拉取群组成员', params)
            //暂时定死就获取1000个
            const pageNum = 1,
                pageSize = 1000
            const options = {
                pageNum: pageNum,
                pageSize: pageSize,
                groupId: params
            }
            // const { data } = await EaseChatClient.listGroupMembers(options)
            this.fetchGroupMemberAttributes({
                groupId: params,
                members: []
            })

            const { groupId, members } = { groupId: params, members: [] }
            if (!this.groupsInfos[groupId]) {
                this.groupsInfos[groupId] = {}
            }
            this.groupsInfos[groupId].members = members
        },
        //获取群成员对应的群组属性
        async fetchGroupMemberAttributes (params:any) {
            const { groupId, members } = params
            const membersList = _.chunk(members, 10)
            let requestTrack:any = []
            membersList.forEach((list) => {
                const goupMemberList = _.flatten(_.map(list, _.values))
                console.log('goupMemberList', list, goupMemberList)
                // requestTrack.push(
                //     EaseChatClient.getGroupMembersAttributes({
                //         groupId: groupId,
                //         userIds: goupMemberList
                //     })
                // )
            })
            try {
                const res = await Promise.all(requestTrack)
                const groupUsersInfo = _.map(res, 'data')
                console.log('>>>>批量获取群组成员属性成功', groupUsersInfo)

                const { inGroupInfo } =  {
                    inGroupInfo: groupUsersInfo
                }
                let groupMemberInfo = {}
                inGroupInfo.length > 0 &&
                    inGroupInfo.map(
                        (item) =>
                            (groupMemberInfo = Object.assign(groupMemberInfo, item))
                    )
                if (!this.groupsInfos[groupId]) {
                    this.groupsInfos[groupId] = {}
                }
                this.groupsInfos[groupId].groupMemberInfo = _.assign(
                    this.groupsInfos[groupId].groupMemberInfo,
                    groupMemberInfo
                )
            } catch (error) {
                console.log('>>>>批量获取群组成员属性失败', error)
            }
        },
        //获取登录用户在某群的群组属性
        // fetchInTheGroupInfo: async ({ commit }, groupId) => {
        //     console.log('>>>>>>>开始拉取群组信息', groupId)
        //     try {
        //         const { data: inGroupInfo } =
        //             await EaseChatClient.getGroupMemberAttributes({
        //                 groupId: groupId,
        //                 userId: EaseChatClient.user
        //             })
        //         console.log('>>>>>>拉取群组信息成功', inGroupInfo)
        //         commit('SET_LOGINUSER_GROUP_INFO', {
        //             groupId: groupId,
        //             inGroupInfo: inGroupInfo
        //         })
        //     } catch (error) {
        //         console.log('>>>>>获取当前登录用户群组属性失败', error)
        //     }

        //     // commit('SET_GROUP_INFOS', {
        //     //     groupId: params,
        //     //     groupInfo: data,
        //     // })
        // },
        //设置登录用户在某群的群组属性
        async setInTheGroupInfo ( params:any) {
            console.log('>>>>>>>开始拉取群组信息', params)
            const { groupId, nickName } = params
            try {
                // await EaseChatClient.setGroupMemberAttributes({
                //     groupId: groupId,
                //     userId: EaseChatClient.user,
                //     memberAttributes: {
                //         nickName
                //     }
                // })
                // commit('SET_GROUP_MEMBERS_INFO', {
                //     groupId: groupId,
                //     inGroupInfo: [{ [EaseChatClient.user]: { nickName } }]
                // })
                this.set_group_members_info({
                    groupId: groupId,
                    inGroupInfo: [{ username: { nickName } }]
                })
            } catch (error) {
                console.log('>>>>>获取当前登录用户群组属性失败', error)
            }
        },

        //设置用户在群组中的群组属性
        set_group_members_info ( payload:any){
            const { groupId, inGroupInfo } = payload
            let groupMemberInfo = {}
            inGroupInfo.length > 0 &&
                inGroupInfo.map(
                    (item:any) =>
                        (groupMemberInfo = Object.assign(groupMemberInfo, item))
                )
            if (!this.groupsInfos[groupId]) {
                this.groupsInfos[groupId] = {}
            }
            this.groupsInfos[groupId].groupMemberInfo = _.assign(
                this.groupsInfos[groupId].groupMemberInfo,
                groupMemberInfo
            )
        },

        //获取群公告
        async fetchAnnounment (params:any) {
            const option = {
                groupId: params
            }
            // const { data } = await EaseChatClient.fetchGroupAnnouncement(option)
            const { data } = {data :{announcement:'000'}}
            const { groupId, announcement } = {
                groupId: params,
                announcement: data.announcement
            }
            if (this.groupsInfos[groupId]) {
                this.groupsInfos[groupId].announcement = announcement
            } else {
                this.groupsInfos[groupId] = {}
                this.groupsInfos[groupId].announcement = announcement
            }
        },
        //群黑名单
        async fetchGoupsBlackList (params:any) {
            const { data } = {data:[]}

            const { groupId, blacklist } = {
                groupId: params,
                blacklist: data
            }
            if (!this.groupsInfos[groupId]) {
                this.groupsInfos[groupId] = {}
            }
            this.groupsInfos[groupId].blacklist = blacklist
        },
        //群禁言列表
        async fetchGoupsMuteList ( params:any) {
            console.log('>>>>>>>成功触发拉取禁言列表', params)
            try {
                const { data } = {data:[]}

                const { groupId, mutelist } = {
                    groupId: params,
                    mutelist: data
                }
                if (!this.groupsInfos[groupId]) {
                    this.groupsInfos[groupId] = {}
                }
                this.groupsInfos[groupId].mutelist = mutelist
            } catch (error) {
                console.log('>>>>禁言接口获取失败', error)
            }
        },
        // 修改群名或者群详情
        async modifyGroupInfo ( params:any) {
            const contactsStore = uesContacts();
            const { groupid, modifyType, content } = params
            //0 是修改群名
            if (modifyType === 0) {
                const option = {
                    groupId: groupid,
                    groupName: content
                }
                // await EaseChatClient.modifyGroup(option)
                //更新本地缓存数据
                contactsStore.update_group_infos({
                    groupId: groupid,
                    type: 'groupName',
                    params: content
                })

                contactsStore.update_group_list({
                    type: 'updateGroupName',
                    groupId: groupid,
                    groupName: content
                })
            }
            //1 是修改群详情
            if (modifyType === 1) {
                const option = {
                    groupId: groupid,
                    description: content
                }
                // await EaseChatClient.modifyGroup(option)
                //更新本地缓存数据
                contactsStore.update_group_infos({
                    groupId: groupid,
                    type: 'groupDescription',
                    params: content
                })
            }
        },
        // 设置/修改群组公告
        async modifyGroupAnnouncement ( params:any){
            //SDK入参属性名是确定的此示例直接将属性名改为了SDK所识别的参数如果修改，具体请看文档。
            // await EaseChatClient.updateGroupAnnouncement(params)
            this.fetchAnnounment(params.groupId)
        },
        //邀请群成员
        async inviteUserJoinTheGroup (params:any){
            //SDK入参属性名是确定的此示例直接将属性名改为了SDK所识别的参数如果修改，具体请看文档。
            const { users, groupId } = params
            try {
                // await EaseChatClient.inviteUsersToGroup({ users, groupId })
                ElMessage({
                    message: '群组邀请成功送出~',
                    type: 'success'
                })
            } catch (error) {
                console.log('>>>>群组邀请失败', error)
                ElMessage({
                    message: '群组邀请失败，请稍后重试~',
                    type: 'error'
                })
            }
        },
        //移出群成员
        async removeTheGroupMember ( params:any){
            const contactsStore = uesContacts();
            //SDK入参属性名是确定的此示例直接将属性名改为了SDK所识别的参数如果修改，具体请看文档。
            const { username, groupId } = params
            try {
                // await EaseChatClient.removeGroupMember({ username, groupId })
                ElMessage({
                    message: `已将${username}移出群组!`,
                    type: 'success'
                })
                //通知更新群详情
                await contactsStore.getAssignGroupDetail(
                    groupId
                ) 
                //更新群成员
                this.fetchGoupsMember(groupId)
            } catch (error) {
                ElMessage({
                    message: '该群成员移出失败，请稍后重试！',
                    type: 'error'
                })
                console.log('<<>>>>>>>>移出失败', error)
            }
        },
        //添加用户到黑名单
        async addMemberToBlackList ( params:any) {
            const contactsStore = uesContacts();
            const { groupId, usernames } = params
            try {
                //SDK入参属性名是确定的此示例直接将属性名改为了SDK所识别的参数如果修改，具体请看文档。
                //   let option = {
                //     groupId: "groupId",
                //     usernames: ["user1", "user2"]
                // };
                // await EaseChatClient.blockGroupMembers({ groupId, usernames })
                ElMessage({
                    message: '黑名单添加成功~',
                    type: 'success'
                })
                //移出黑名单，还要调用拉取群组列表，原因为将群成员加入黑名单还会将其踢出群组。
                this.fetchGoupsMember(groupId)
                //重新获取黑名单列表
                this.fetchGoupsBlackList(groupId)
                //通知更新群详情
                await contactsStore.getAssignGroupDetail(
                    groupId
                ) 
            } catch (error) {
                console.log('>>>>>error', error)
                ElMessage({
                    message: '黑名单添加失败，请稍后重试~',
                    type: 'error'
                })
            }
        },
        //从黑名单中移出
        async removeTheMemberFromBlackList ( params:any) {
            const { groupId, usernames } = params
            try {
                // await EaseChatClient.unblockGroupMembers({ groupId, usernames })
                ElMessage({
                    message: '黑名单移除成功~',
                    type: 'success'
                })
                //重新获取黑名单列表
                this.fetchGoupsBlackList(groupId)
            } catch (error) {
                console.log('>>>>>>黑名单移除失败')
                ElMessage({
                    message: '黑名单移除失败，请稍后重试~',
                    type: 'error'
                })
            }
        },
        //添加用户到禁言列表
        async addMemberToMuteList (params:any) {
            console.log('>>>>>>调用了禁言操作', params)
            const { groupId, usernames } = params
            //todo 此处处理方式为并发请求多次，后续SDK将支持传入数组形式，实现禁言多人
            const requestTrack:any = []

            try {
                usernames.length > 0 &&
                    usernames.map((userId:number) => {
                        // requestTrack.push = EaseChatClient.muteGroupMember({
                        //     groupId,
                        //     username: userId,
                        //     muteDuration: 886400000
                        // })
                    })
                await Promise.all(requestTrack)
                ElMessage({
                    message: '禁言成功~',
                    type: 'success'
                })
                setTimeout(() => {
                    this.fetchGoupsMuteList(groupId)
                }, 800)
            } catch (error) {
                ElMessage({
                    message: '禁言失败，请稍后重试~',
                    type: 'error'
                })
            }

            // let option = {
            //   groupId: 'groupId',
            //   username: 'user',
            //   muteDuration: 886400000, // 禁言时长，单位为毫秒。
            // };
            // await EaseChatClient.muteGroupMember(option);
        },
        //从禁言列表中移出
        async removeTheMemberFromMuteList (params:any){
            const { groupId, usernames } = params
            //todo 此处处理方式为并发请求多次，后续SDK将支持传入数组形式，实现移出禁言多人
            const requestTrack:any = []
            try {
                usernames.length > 0 &&
                    usernames.map((userId:number) => {
                        // requestTrack.push = EaseChatClient.unmuteGroupMember({
                        //     groupId,
                        //     username: userId
                        // })
                    })
                await Promise.all(requestTrack)
                ElMessage({
                    message: '移除禁言成功~',
                    type: 'success'
                })
                setTimeout(() => {
                    this.fetchGoupsMuteList(groupId)
                }, 800)
            } catch (error) {
                ElMessage({
                    message: '移除禁言失败，请稍后重试~',
                    type: 'error'
                })
            }
            console.log('>>>>>>调用了移出禁言操作', params)
        },
        //退出群组
        async leaveIntheGroup ( params:any) {
            const contactsStore = uesContacts();
            if (!params.groupId) return
            const { groupId } = params
            return new Promise((resolve, reject) => {
                resolve(true)
                // EaseChatClient.leaveGroup({
                //     groupId: groupId
                // })
                //     .then((res) => {

                            // contactsStore.update_group_list({
                            //     type: 'deleteFromList',
                            //     groupId: groupId
                            // })
                //         resolve(res)
                //     })
                //     .catch((err) => {
                //         reject(err)
                //     })
            })
        },
        //解散群组
        destroyInTheGroup: async ( params:any) => {
            const contactsStore = uesContacts();
            if (!params.groupId) return
            const { groupId } = params
            return new Promise((resolve, reject) => {
                let option = {
                    groupId: groupId
                }
                resolve(true)
                // EaseChatClient.destroyGroup(option)
                //     .then((res) => {
                //         resolve(res)
                    // contactsStore.update_group_list({
                    //     type: 'deleteFromList',
                    //     groupId: groupId
                    // })
                //     })
                //     .catch((err) => {
                //         reject(err)
                //     })
            })
        }
	},
});
