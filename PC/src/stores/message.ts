import { defineStore } from 'pinia';
import { Session } from '/@/utils/storage';


// import { ref, toRaw } from 'vue';
import { getHistoryMessage } from '/@/api/chat';
import usePlayRing from '/@/hooks/usePlayRing'
import { informType, messageType } from '/@/constant'
import { setMessageKey, createMessage } from '/@/utils/handleSomeData'
import { uesConversation } from './conversation';
const { ALL_MESSAGE_TYPE, CHANGE_MESSAGE_BODAY_TYPE } = messageType
import _ from 'lodash'

/**
 * @function MessageList
 * @returns {MessageList}
 */
export const uesStoreMessage = defineStore('message', {
    state: (): MessageList => ({
        messageList: []
    }),
    actions: {

        //添加新消息
        createNewMessage(params: any) {
            const conversationStore = uesConversation()
            const { isOpenPlayRing, playRing } = usePlayRing()
            const key = setMessageKey(params)
            this.update_message_list(params)
            //目前根据全局配置进行新消息声音提示，后续计划根据会话级别可进行设置是否声音提示，比如设定免打扰。
            if (isOpenPlayRing.value) playRing()
            conversationStore.gatherConversation(key)
        },

        update_history_message(payload: any) {
            const { listKey, historyMessage } = payload
            const toUpdateMsgList = _.assign({}, this.messageList)
            if (!toUpdateMsgList[listKey]) {
                toUpdateMsgList[listKey] = []
                _.unionBy(
                    toUpdateMsgList[listKey].push(...historyMessage),
                    (m: any) => m.id
                )
            } else {
                _.unionBy(
                    toUpdateMsgList[listKey].unshift(...historyMessage),
                    (m: any) => m.id
                )
            }
            this.messageList = toUpdateMsgList
            console.log(this.messageList,payload,888)
        },
        //获取历史消息
        async getHistoryMessage(params: any) {
            const conversationStore = uesConversation()
            const { id, chatType, cursor } = params
            return new Promise(async (resolve, reject) => {
                const options = {
                    id: id,
                    pageSize: 10,
                    limit:20,
                    cursor: cursor,
                    type: chatType,
                    searchDirection: 'up'
                }
              const res =  await getHistoryMessage(options)
              console.log(res,999,this.messageList,id)
                let message:any = []
                this.update_history_message({
                    listKey: id,
                    historyMessage: _.reverse(res.data)
                })
                if (!this.messageList[id]) {
                    //提示会话列表更新
                    conversationStore.gatherConversation(id)
                }
                resolve({ message, cursor })
                // EaseChatClient.getHistoryMessages(options)
                //     .then((res) => {
                //         const { cursor, messages } = res
                //         messages.length > 0 &&
                //             messages.forEach((item) => {
                //                 item.read = true
                //             })
                //         resolve({ messages, cursor })
                //         commit('UPDATE_HISTORY_MESSAGE', {
                //             listKey: id,
                //             historyMessage: _.reverse(messages)
                //         })
                //         if (!state.messageList[id]) {
                //             //提示会话列表更新
                // conversationStore.gatherConversation(id)
                //         }
                //     })
                //     .catch((error) => {
                //         reject(error)
                //     })
            })
        },
        //发送展示类型消息
        async sendShowTypeMessage(params: any) {
            const conversationStore = uesConversation()
            return new Promise((resolve, reject) => {
                //主要作用为创建消息Options中附件会有上传失败的回调函数。
                //传入errorCallback，让附件类型消息在上传失败时调用reject抛出error
                const errorCallback = (error: string) => {
                    reject(error)
                }
                const options = createMessage.createOptions(
                    params,
                    errorCallback
                )
                console.log(options, 98888)
                const msg = {
                    ...options,
                    "from": 25036,
                    "time": new Date().getTime()
                }
                const msgBody = createMessage.createMsgBody(msg)
                this.update_message_list(msgBody)
                conversationStore.gatherConversation(msgBody.to)
                resolve('OK')
                // const msg = EaseChatSDK.message.create(options)
                // EaseChatClient.send(msg)
                //     .then((res) => {
                //         const { serverMsgId } = res
                //         console.log('>>>>发送成功', res)
                //         msg.id = serverMsgId
                //         msg.from = EaseChatClient.user
                //         const msgBody = createMessage.createMsgBody(msg)
                //         commit('UPDATE_MESSAGE_LIST', msgBody)
                //         // 提示会话列表更新
                // conversationStore.gatherConversation(msgBody.to)
                //         resolve('OK')
                //     })
                //     .catch((error) => {
                //         reject(error)
                //     })
            })
        },
        // 更新消息数据列表
        update_message_list(msgBody: any) {
            const toUpdateMsgList = _.assign({}, this.messageList)
            const listKey = setMessageKey(msgBody)
            if (!toUpdateMsgList[listKey]) {
                toUpdateMsgList[listKey] = []
                _.unionBy(toUpdateMsgList[listKey].push(msgBody), (m: any) => m.id)
            } else {
                _.unionBy(toUpdateMsgList[listKey].push(msgBody), (m: any) => m.id)
            }
            this.messageList = toUpdateMsgList
        },

        //修改本地原消息【撤回、删除、编辑】

        change_message_boday(payload: any) {
            const { type, key, mid } = payload
            switch (type) {
                case CHANGE_MESSAGE_BODAY_TYPE.RECALL:
                    {
                        if (this.messageList[key]) {
                            const res = _.find(
                                this.messageList[key],
                                (o) => o.id === mid
                            )
                            res.isRecall = true
                        }
                    }

                    break
                case CHANGE_MESSAGE_BODAY_TYPE.DELETE:
                    {
                        if (this.messageList[key]) {
                            const sourceData = this.messageList[key]
                            const index = _.findIndex(
                                this.messageList[key],
                                (o: any) => o.id === mid
                            )
                            sourceData.splice(index, 1)
                            this.messageList[key] = _.assign([], sourceData)
                        }
                    }
                    break
                case CHANGE_MESSAGE_BODAY_TYPE.MODIFY:
                    {
                        if (this.messageList[key]) {
                            const res = _.find(
                                this.messageList[key],
                                (o) => o.id === mid
                            )
                            _.assign(res, payload?.message)
                        }
                    }
                    break
                default:
                    break
            }
        },
        //添加通知类消息
        createInformMessage(params: any) {
            const conversationStore = uesConversation()
            /** 
               const params = {
                    from: '',
                    to: '',
                    chatType: '',
                    msg:''
                }
            */
            const msgBody = _.cloneDeep(params)
            msgBody.type = ALL_MESSAGE_TYPE.INFORM
            const key = setMessageKey(params)
            console.log('>>>>>>添加系统消息', params)
            // commit('UPDATE_MESSAGE_LIST', msgBody)
            this.update_message_list(msgBody)
            conversationStore.gatherConversation(key)
        },
        //删除消息
        removeMessage(params: any) {
            const conversationStore = uesConversation()
            const { id: mid, from: targetId, chatType } = params
            const key = setMessageKey(params)
            // return new Promise((resolve, reject) => {
            //     EaseChatClient.removeHistoryMessages({
            //         targetId: targetId,
            //         chatType: chatType,
            //         messageIds: [mid]
            //     })
            //         .then((res) => {
            //             this.change_message_boday({
            //                 type: CHANGE_MESSAGE_BODAY_TYPE.DELETE,
            //                 key: key,
            //                 mid
            //             })
            //             conversationStore.gatherConversation(key)
            //             resolve('OK')
            //         })
            //         .catch((error) => {
            //             reject(error)
            //         })
            // })
        },
        //撤回消息
        async recallMessage(params: any) {
            const conversationStore = uesConversation()
            const { mid, to, chatType } = params
            // return new Promise((resolve, reject) => {
            //     EaseChatClient.recallMessage({ mid, to, chatType })
            //         .then(() => {
            //             this.change_message_boday({
            //                 type: CHANGE_MESSAGE_BODAY_TYPE.RECALL,
            //                 key: to,
            //                 mid
            //             })
            //             conversationStore.gatherConversation(to)
            //             resolve('OK')
            //         })
            //         .catch((error) => {
            //             reject(error)
            //         })
            // })
        },
        //修改（编辑）消息
        async modifyMessage(params: any) {
            const conversationStore = uesConversation()
            const { id: mid, to, chatType, msg } = params
            return new Promise((resolve, reject) => {
                // const textMessage = EaseChatSDK.message.create({
                //     type: 'txt',
                //     msg: msg,
                //     to: to,
                //     chatType: chatType
                // })
                // console.log('textMessage', textMessage)
                // EaseChatClient.modifyMessage({
                //     messageId: mid,
                //     modifiedMessage: textMessage
                // })
                //     .then((res) => {
                //         console.log(res.message, 'modifiedMessage')
                //         const { message } = res || {}
                //         this.change_message_boday({
                //             type: CHANGE_MESSAGE_BODAY_TYPE.MODIFY,
                //             key: to,
                //             mid,
                //             message
                //         })
                //         conversationStore.gatherConversation(to)
                //         resolve(res)
                //     })
                //     .catch((e) => {
                //         console.log(e)
                //         reject(e)
                //     })
            })
        }

    }
});
