/* 用作根据消息类型处理对象中的key */

import { messageType } from '/@/constant'
import { useUserInfo } from '/@/stores/userInfo';
const userInfoStore = useUserInfo()
const { CHAT_TYPE } = messageType
export default function (msgBody) {
    const loginUserId = userInfoStore.userInfos.uid
    const listKey =
    msgBody.chatType === CHAT_TYPE.SINGLE
        ? msgBody.to === loginUserId
            ? msgBody.from
            : msgBody.to
        : msgBody.to

    return listKey
}
