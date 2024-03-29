/* 会话列表总装车间 */
import _ from 'lodash'
// import store from '@/store'
import { uesConversation } from '/@/stores/conversation';
import { messageType } from '/@/constant'

import { uesContacts } from '/@/stores/contacts';
import { useUserInfo } from '/@/stores/userInfo';


import defaultGroupAvatarUrl from '/@/assets/avatar/jiaqun2x.png'
import defaultSingleAvatarUrl from '/@/assets/avatar/theme2x.png'
import { setMessageKey } from '/@/utils/handleSomeData'
const { SESSION_MESSAGE_TYPE, CHAT_TYPE, ALL_MESSAGE_TYPE, CUSTOM_TYPE } =
    messageType

//处理最后一条消息预览
const handleLastMsgContent = (msgBody) => {
    const { type, msg } = msgBody
    let resultContent = ''
    //如果消息类型，在预设非展示文本类型中，就返回预设值
    if (SESSION_MESSAGE_TYPE[type]) {
        resultContent = SESSION_MESSAGE_TYPE[type]
    } else if (type === ALL_MESSAGE_TYPE.CUSTOM) {
        //如果为自定义类型消息就匹配自定义消息对应的lastmsg文本
        if (msgBody.customEvent) {
            ;(CUSTOM_TYPE[msgBody.customEvent] &&
                (resultContent = CUSTOM_TYPE[msgBody.customEvent])) ||
                ''
        }
    } else if (msgBody.isRecall) {
        //如果是撤回消息，则展示撤回消息类型文本
        resultContent = '撤回了一条消息'
    } else {
        resultContent = msg
    }
    return resultContent
}
//判断该消息是否包含提及（@登录用户）
const checkLastMsgisHasMention = (toDoUpdateMsg, toDoUpdateConversation) => {
    const { ext, type, from } = toDoUpdateMsg
    const EM_AT_LIST = 'em_at_list'
    //当前要更新会话状态如果已为提及则不做处理仍返回true
    if (toDoUpdateConversation && toDoUpdateConversation?.isMention) return true
    //如果要更新的消息消息包含扩展提及则返回true
    if (type === ALL_MESSAGE_TYPE.TEXT) {
        if (!ext || !ext[EM_AT_LIST]) return false
        // if (
        //     ext[EM_AT_LIST].includes(EaseChatClient.user) ||
        //     (from !== EaseChatClient.user && ext[EM_AT_LIST] === 'ALL')
        // ) {
        //     return true
        // } else {
        //     return false
        // }
    }
}

//计算未读数
const handleCalcUnReadNum = (msgBody, toDoUpdateConversation) => {
    // 确定当前未读数，如果会话不存在，未读数初始为0
    let currentUnreadNum = toDoUpdateConversation
        ? toDoUpdateConversation.unreadMessageNum
        : 0
    // 如果消息来自当前用户，或者是被召回的消息，或者消息处于读取状态，未读数不变
    // if (
    //     msgBody.from === EaseChatClient.user ||
    //     msgBody.isRecall ||
    //     msgBody.read
    // ) {
    //     return currentUnreadNum
    // }

    //如果会话不存在，则返回未读数为1
    if (!toDoUpdateConversation) {
        return 1
    }

    //如果消息包含修改信息，未读数不变
    if (msgBody.modifiedInfo) {
        return currentUnreadNum
    }

    // 其他情况，未读数+1
    return currentUnreadNum + 1
}
export default function (corresMessage) {
    const contactsStore = uesContacts()
    const conversationStore = uesConversation()
    const userInfoStore = useUserInfo()
    /*
     * 1、取到messageList更新后的最后一套消息
     * 2、取会话列表数据进行与当前的messageList进行比对查看messaList中的Key是否已经存在于已有的Conversation中。
     * 3、结合上一步，没有则在追加一个新会话，有则只更新lastmessage.
     */
    const updatedConversation = {}
    const lastMsgBody = corresMessage[corresMessage.length - 1]
    //根据传入的消息进入会话列表进行查询
    const findIncludesConversation = (msgBody) => {
        const localConversationList =[]
        const listKey = setMessageKey(msgBody)
        //不存在则创建
        if (!localConversationList[listKey]) {
            const newCoversation = buildConversationItem('create', msgBody)
            updatedConversation[listKey] = newCoversation
        }
        //存在则更新
        else if (localConversationList && localConversationList[listKey]) {
            const theData = _.cloneDeep(
                conversationStore.conversationListData[listKey]
            )
            const updatedCoversation = buildConversationItem(
                'update',
                msgBody,
                theData
            )

            updatedConversation[listKey] = updatedCoversation
        }
    }
    //构建会话方法
    const buildConversationItem = (operateType, msgBody, theData) => {
        //type create构建 update更新
        /**
  * 
  * type: "" 会话类型
  * conversationInfo: { 会话信息详情
      *  name: ,
      * avatarUrl:
    }, 
    fromInfo: {},消息来源id
    unreadMessageNum: 0, 未读数
    latestMessage: { 
      msg:"",
      type: "",
      ext: { },
    }, //最近一条消息消息体
    latestMessageId: "", 最近消息的消息mid
    latestSendTime:"", 最近一条消息的发送时间,
   */
        const loginUserId = userInfoStore.userInfos.uid
        const listKey = setMessageKey(msgBody)
        const { chatType, from, ext, id, time, to, type } = msgBody
        //操作类型为新建
        if (operateType === 'create') {
            const state = {
                type: chatType,
                conversationKey: listKey,
                conversationInfo: {
                    name: '',
                    avatarUrl:
                        chatType === CHAT_TYPE.SINGLE
                            ? defaultSingleAvatarUrl
                            : defaultGroupAvatarUrl
                },
                fromInfo: {
                    fromId: from,
                    fromName: ''
                },
                targetId: to,
                unreadMessageNum: handleCalcUnReadNum(msgBody),
                // unreadMessageNum:
                //     from === loginUserId ||
                //     msgBody.read ||
                //     msgBody.isRecall ||
                //     msgBody?.modifiedInfo
                //         ? 0
                //         : 1,
                isMention: checkLastMsgisHasMention(msgBody),
                latestMessage: {
                    msg: handleLastMsgContent(msgBody),
                    // SESSION_MESSAGE_TYPE[type] ||
                    // (msgBody.isRecall && '撤回了一条消息') ||
                    // msg,
                    type: type,
                    ext: { ...ext }
                },
                latestMessageId: id,
                latestSendTime: time || Date.now()
            }
            if (chatType === CHAT_TYPE.GROUP) {
                const groupInfo = contactsStore.contacts.groupList[to]
                groupInfo?.groupname &&
                    (state.conversationInfo.name = groupInfo.groupname)
            } else if (chatType === CHAT_TYPE.SINGLE) {
                //to字段 暂时选择展示为ID
                state.conversationInfo.name = to === loginUserId ? from : to
            }
            return state
        }
        //操作类型为更新
        if (operateType === 'update') {
            const updatedState = {
                fromInfo: {
                    fromId: from,
                    fromName: ''
                },
                latestMessage: {
                    msg: handleLastMsgContent(msgBody),
                    // SESSION_MESSAGE_TYPE[type] ||
                    // (msgBody.isRecall && '撤回了一条消息') ||
                    // msg,
                    type: type,
                    ext: { ...ext }
                },
                targetId: to,
                latestMessageId: id,
                latestSendTime: time || Date.now(),
                isMention: checkLastMsgisHasMention(msgBody, theData),
                unreadMessageNum:
                    /* 这里的逻辑为如果from为自己，更新的消息已读，更新的消息为撤回，不计入unreadMessageNum的累加 */
                    handleCalcUnReadNum(msgBody, _.cloneDeep(theData))
                // unreadMessageNum:
                //     /* 这里的逻辑为如果from为自己，更新的消息已读，更新的消息为撤回，不计入unreadMessageNum的累加 */
                //     from === loginUserId || msgBody.read || msgBody.isRecall
                //         ? 0
                //         : theData.unreadMessageNum + 1
            }
            return _.assign(theData, updatedState)
        }
    }
    findIncludesConversation(lastMsgBody)
    return updatedConversation
}
