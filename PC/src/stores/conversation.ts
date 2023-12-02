import { defineStore } from 'pinia';
import { Session } from '/@/utils/storage';

import _ from 'lodash'
import { useLocalStorage } from '@vueuse/core'
import {
    createConversation,
    sortConversation,
    createInform
} from '/@/utils/handleSomeData'
import {uesStoreMessage} from './message';
import {uesContacts} from './contacts';
import { useGroups } from './goups';
import { informType, messageType } from '/@/constant'
const { INFORM_FROM } = informType
const { CHAT_TYPE } = messageType
const MessageStore = uesStoreMessage()
/**
 * @function Conversation
 * @returns {Conversation}
 */
export const uesConversation = defineStore('conversation', {
    state: (): Conversation => ({
        informDetail: [],
        conversationListData: {}
    }),
    actions: {

        //初始化会话列表的数据（根据登陆的id取其对应的会话数据）
		
        init_conversation_state (userId:number){
			
            this.informDetail = useLocalStorage(
                `IM_PC_${userId}_INFORM`,
                []
            )
            this.conversationListData = {};
            this.conversationListData = useLocalStorage(
                `IM_PC_${userId}_conversationList`,
                {
				}
            )
            console.log(this.conversationListData,6666)
        },

        //清空系统通知
        clear_inform_list (){
            this.informDetail = []
        },

        //更新系统通知
		
        update_inform_list (informBody:any) {
            const toBeUpdateInform = _.assign([], this.informDetail)
            // let _index = toBeUpdateInform.findIndex(
            //   (v) => v.from === informBody.from
            // );
            // if (_index === -1) {
            //   toBeUpdateInform.unshift(informBody);
            // } else {
            //   toBeUpdateInform.splice(_index, 1);
            //   toBeUpdateInform.unshift(informBody);
            // }
            toBeUpdateInform.unshift(informBody)
            this.informDetail = toBeUpdateInform
        },
        //更新已有会话
        update_conversation_list ( payload:any){
            console.log('>>>>>>>开始更新会话', payload)
            const sortedData = sortConversation(
                _.assign(_.cloneDeep(this.conversationListData), payload)
            )
            this.conversationListData = sortedData
        },
        //删除某条会话
        delete_one_conversation(key:any) {
            console.log('>>>>>>>执行删除会话操作', key)
            const toUpdateConversation:any = _.assign(
                {},
                this.conversationListData
            )
            if (toUpdateConversation[key]) {
                delete toUpdateConversation[key]
            }
            console.log('删除后toUpdateConversation', toUpdateConversation)
            this.conversationListData = _.assign({}, toUpdateConversation)
        },
        //清除会话未读状态
        clear_unread_num ( key:number) {
            this.conversationListData[key].unreadMessageNum = 0
        },
		//清除会话@状态
        clear_at_status (index:number) {
            console.log('>>>>>>>执行清除会话@状态', index)
            this.conversationListData[index].isMention = false
        },
        //清除信息卡片未读
        clear_untreated_status( index:number) {
            console.log('>>>>>执行清除卡片未读', index)
            this.informDetail[index].untreated = 0
        },

        //清除会话未读状态
        clear_unread_status ( index:number) {
            console.log('>>>>>>>执行清除会话未读状态', index)
            this.conversationListData[index].unreadMessageNum = 0
        },
        //更新会话未读状态
        update_unread_status(index:number)  {
            console.log('>>>>>>>执行更新会话未读状态', index)
			this.conversationListData[index].unreadMessageNum++
        },
        //更新会话@状态
        //更改卡片消息的按钮状态
        update_inform_btnstatus ( index:number, btnStatus :any) {
            console.log('>>>>触发了按钮更新状态', index, btnStatus)
            this.informDetail[index].operationStatus = btnStatus
        },

		createNewInform ( params:any) {
            const contactsStore = uesContacts()
            const groupsStore = useGroups()
            const { fromType, informContent } = params
            console.log('>>>>>>>>>createNewInform', fromType, informContent)
            const result = createInform(fromType, informContent)
			this.update_inform_list(result)

            //部分事件需要调用接口更新本地信息或者增加消息内系统通知
            if (fromType === INFORM_FROM.FRIEND) {
                const informMsg = {
                    from: informContent.from,
                    to: informContent.to,
                    chatType: CHAT_TYPE.SINGLE,
					msg:''
                }
                switch (informContent.type) {
                    case 'unsubscribed':
                        {
                            informMsg.msg = '你俩的友尽了，可重新发起好友申请'
							MessageStore.createInformMessage(informMsg)
                        }
                        break
                    case 'subscribed':
                        {
                            informMsg.msg = '你们已成为你的好友,开始聊天吧'
							MessageStore.createInformMessage(informMsg)
                        }
                        break
                    default:
                        break
                }
            }
            if (fromType === INFORM_FROM.GROUP) {
                const informMsg = {
                    from: informContent.from,
                    to: informContent.id,
                    chatType: CHAT_TYPE.GROUP,
					msg:''
                }
                switch (informContent.operation) {
                    case 'memberPresence': //入群通知
                        {
							contactsStore.update_group_infos({
                                groupId: informContent.id,
                                type: 'addAffiliationsCount'
                            })
							groupsStore.fetchGoupsMember(informContent.id)
                            informMsg.msg = `${informContent.from}加入了群组`
							MessageStore.createInformMessage(informMsg)
                        }
                        break
                    case 'memberAbsence':
                        {
                            //退群通知
                            
							contactsStore.update_group_infos({
                                groupId: informContent.id,
                                type: 'addAffiliationsCount'
                            })
							groupsStore.fetchGoupsMember(informContent.id)
                            informMsg.msg = `${informContent.from}退出了群组`
							MessageStore.createInformMessage(informMsg)
                        }
                        break
                    case 'updateAnnouncement':
                        {
                            //更新群公告
							groupsStore.fetchAnnounment(informContent.id)
                            informMsg.msg = `${informContent.from}更新了群组公告，去看看更新的什么吧~`
                            MessageStore.createInformMessage(informMsg)
                        }
                        break
                    case 'setAdmin':
                        {
							groupsStore.fetchGoupsAdmin(informContent.id)
                            informMsg.msg = `${informContent.from}设定${informContent.to}为管理员~`
                            MessageStore.createInformMessage(informMsg)
                        }
                        break
                    case 'removeAdmin':
                        {
							groupsStore.fetchGoupsAdmin(informContent.id)
                            informMsg.msg = `${informContent.from}移除了${informContent.to}的管理员身份~`
                            MessageStore.createInformMessage(informMsg)
                        }
                        break
                    case 'muteMember':
                        {
                            informMsg.msg = `${informContent.from}禁言了${
                                informContent.to ? informContent.to : '你'
                            }~`
                            MessageStore.createInformMessage(informMsg)
                        }
                        break
                    case 'unmuteMember':
                        {
                            informMsg.msg = `${informContent.from}取消了${
                                informContent.to ? informContent.to : '你'
                            }的禁言~`
                            MessageStore.createInformMessage(informMsg)
                        }
                        break
                    case 'removeMember':
                        {
                            informMsg.msg = `${informContent.from}将你移出了群组${informContent.id}~`
                            MessageStore.createInformMessage(informMsg)
                            //执行删除会话
							this.delete_one_conversation(informContent.id)
                            //从群组列表中移除
							contactsStore.update_group_list({
                                type: 'deleteFromList',
                                groupId: informContent.id
                            })
                        }
                        break
                    case 'destroy':
                        {
                            informMsg.msg = `${informContent.from}解散了该群~`
                            MessageStore.createInformMessage(informMsg)
                            setTimeout(() => {
								contactsStore.fetchGroupList({
                                    pageNum: 1,
                                    pageSize: 500
                                })
                            }, 300)
                        }
                        break
                    case 'updateInfo':
                        {
                            informMsg.msg = `${informContent.from}更新了群组详情~`
                            MessageStore.createInformMessage(informMsg)
							contactsStore.getAssignGroupDetail(informContent.id)
                        }
                        break
                    case 'acceptRequest':
                        {
                            console.log('>>>>>>>收到了群组同意加入事件')
                            setTimeout(() => {
								contactsStore.fetchGroupList({
                                    pageNum: 1,
                                    pageSize: 500
                                })
                            }, 300)
                        }
                        break
                    case 'memberAttributesUpdate':
                        {
                            console.log('>>>>>>>收到了群组成员属性更新事件')
                            informMsg.msg = `${informContent.from}修改群内昵称为【${informContent?.attributes?.nickName}】`
                            MessageStore.createInformMessage(informMsg)
							groupsStore.set_group_members_info({
                                groupId: informContent.id,
                                inGroupInfo: [
                                    {
                                        [informContent.from]: {
                                            nickName:
                                                informContent?.attributes
                                                    ?.nickName
                                        }
                                    }
                                ]
                            })
                        }
                        break
                    default:
                        break
                }
            }
            //memberPresence 群成员加入群组需要进行群组人数+1操作。
            // commit('UPDATE_GROUP_INFOS',{})
        },

        //收集会话依赖数据
        gatherConversation ( key:number) {
            const corresMessage = _.cloneDeep(MessageStore.messageList[key])
            const res = createConversation(corresMessage)
			this.update_conversation_list(res)
        }
    }
});
