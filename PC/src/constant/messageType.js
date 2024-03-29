const SESSION_MESSAGE_TYPE = {
    img: '[图片]',
    file: '[文件]',
    audio: '[语音]',
    loc: '[位置]'
}

const CUSTOM_TYPE = {
    userCard: '个人名片'
}
const ALL_MESSAGE_TYPE = {
    TEXT: 'txt',
    IMAGE: 'img',
    AUDIO: 'audio',
    LOCAL: 'loc',
    VIDEO: 'video',
    FILE: 'file',
    CUSTOM: 'custom',
    CMD: 'cmd',
    INFORM: 'inform' //这个类型不在消息类型内，属于自己定义的一种系统通知类的消息。
}
const CHAT_TYPE = {
    SINGLE: 'friend',
    GROUP: 'group'
}

const MENTION_ALL = {
    TEXT: '所有人',
    VALUE: 'ALL'
}
const CHANGE_MESSAGE_BODAY_TYPE = {
    RECALL: 0,
    DELETE: 1,
    MODIFY: 2
}
export default {
    SESSION_MESSAGE_TYPE,
    CUSTOM_TYPE,
    ALL_MESSAGE_TYPE,
    CHAT_TYPE,
    MENTION_ALL,
    CHANGE_MESSAGE_BODAY_TYPE
}
