<script setup>
import { ref, computed, defineEmits } from 'vue'
import dateFormater from '/@/utils/dateFormater'
import { messageType } from '/@/constant'
import _ from 'lodash'
import { useRouter, useRoute } from 'vue-router'
import { formatPast } from '/@/utils/formatTime';
/* 头像相关 */
import informIcon from '/@/assets/avatar/inform.png'
/* route */
const route = useRoute()
/* router */
const router = useRouter()
/* store */
const { CHAT_TYPE } = messageType
/* store */
import { uesContacts } from '/@/stores/contacts';
import { uesConversation } from '/@/stores/conversation';
import { useUserInfo } from '/@/stores/userInfo';
const userInfoStore = useUserInfo()
const contactsStore = uesContacts()
const conversationStore = uesConversation()
//登录用户ID
const loginUserId = userInfoStore.userInfos.uid
//取系统通知数据
const informDetail = computed(() => {
    const informDetailArr = conversationStore.informDetail
    const lastInformDeatail = informDetailArr[0] || {}
    const untreated = _.sumBy(informDetailArr, 'untreated') || 0
    return { untreated, lastInformDeatail }
})
// console.log('>>>>>informDetail', informDetail.lastInformDeatail)
//好友列表
const friendList = computed(() => contactsStore.contacts.friendList)
//群组列表
const joinedGroupList = computed(() => contactsStore.contacts.groupList)

const baseUrl = import.meta.env.VITE_API_URL
//取会话数据
const conversationList = computed(() => {
    return conversationStore.conversationListData
})

//处理会话name
const handleConversationName = computed(() => {
    return (item) => {
        if (item.type === CHAT_TYPE.SINGLE) {
            const friend = friendList.value[item.id]
            return friend?.name || item.name
        }
        if (item.type === CHAT_TYPE.GROUP) {
            const group = joinedGroupList.value[item.id]
            if (group?.groupDetail) {
                return group.groupDetail.name
            } else if (group?.name) {
                return group.name
            }
        }
        return item.conversationKey
    }
})

const htmlDecode =  (text)=> {
    text = text || '';
    var map = {'&amp;': '&','&lt;': '<','&gt;': '>','&quot;': '"','&#039;': "'", '&nbsp;':' '};
    return text.replace(/&amp;|&lt;|&gt;|&quot;|&#039;|&nbsp;/g, function(m) {return map[m];});
};


const textContent = (content)=>{

    if (!content) {
        return '';
    }
    content = content.replace(/\[表情\d+\]/g, '['+'表情'+']').replace(/@\[(.+?)\]\((\d+)\)/g, '@$1');
    // 图片
    if (/\!\[.*?\]\(([^\)]+?)\)/.test(content)) {
        content = '['+'图片'+']';
    } else if (/^voice\[\d+\]\(([^\)]+?)\)$/.test(content)) {
        content = '['+'语音'+']';
    } else if (/^voice\(([^\)]+?)\)$/.test(content)) {
        content = '['+'语音'+']';
    } else if (/^file\[(.*?)[\t|\|](.*?)]\((.+?)\)$/.test(content)) {
        content = '['+'文件'+']';
    } else if (/\[.*?\]\(([^\)]+?)\)/.test(content)) {
        // 替换a连接
        content = content.replace(/\[(.*?)\]\(([^\)]+?)\)/g, '$1');
    }
    return htmlDecode(content);
}

// 处理最后一条消息
const lastMessage = computed(() => {
    return (item) => {
        item = item.items.length && item.items.slice(-1)[0];
				if (!item) {
					return {
						content: '',
						timestamp: 0
					};
				}
				let content = textContent(item['content']);
				return {
                    name:item.name+':',
					content: content,
					timestamp:formatPast(item['timestamp']*1000)
				};
    }
})
//处理lastmsg的from昵称
const handleLastMsgusername = computed(() => {
    const friendList = []
    const groupsInfos = []
    return (conversation) => {
        const {
            conversationKey: groupId,
            type,
            fromInfo
        } = conversation
        const { fromId } = fromInfo || {}
        if (type === CHAT_TYPE.GROUP) {
            const userInfoFromGroupusername =
                groupsInfos[groupId]?.groupMemberInfo?.[fromId]?.username
            const friendUserInfousername = friendList[fromId]?.username
            return `${
                userInfoFromGroupusername || friendUserInfousername || fromId
            }：`
        }
    }
})
//取网络状态
const networkStatus = computed(() => {
    return 200
})

const emit = defineEmits(['toInformDetails', 'toChatMessage'])
//普通会话
const checkedConverItemIndex = ref(null)
const toChatMessage = (item, itemKey, index) => {
    console.log(item)
    checkedConverItemIndex.value = index
    if (item && item.unreadMessageNum > 0)
        store.commit('CLEAR_UNREAD_NUM', item.id)
    if (item.isMention) store.commit('CLEAR_AT_STATUS', item.id)
    //跳转至对应的消息界面

    emit('toChatMessage', item.id, item.type)
}
//删除某条会话
const deleteConversation = (itemKey) => {
    console.log('选中的会话key', itemKey, route.query)
    // store.commit('DELETE_ONE_CONVERSATION', itemKey)
    //如果删除的itemKey与当前的message会话页的id一致则跳转至会话默认页。
    if (route?.query?.id && route.query.id === itemKey) {
        router.push('/chat/conversation')
    }
}
//加载到底拉取新数据
// const load = () => {
//   console.log('>>>>>加载到底');
// };
</script>
<template>
    <el-scrollbar class="session_list" style="overflow: auto" tag="ul">
        <li class="offline_hint" v-if="!networkStatus">
            <span class="plaint_icon">!</span> 网络不给力，请检查网络设置。
        </li>
        <!-- 系统通知会话 -->
        <li
            v-if="
                JSON.stringify(informDetail.lastInformDeatail) !== '{}' &&
                informDetail.untreated >= 1
            "
            class="session_list_item"
            @click="$emit('toInformDetails')"
        >
            <div class="item_body item_left">
                <!-- 通知头像 -->
                <div class="session_other_avatar">
                    头像
                    <el-avatar :size="34" :src="informIcon" />
                </div>
            </div>
            <div class="item_body item_main">
                <div class="name">系统通知</div>
                <div class="last_msg_body">
                    {{ informDetail.lastInformDeatail.from }}:{{
                        informDetail.lastInformDeatail.desc
                    }}
                </div>
            </div>
            <div class="item_body item_right">
                <span class="time">{{
                    formatPast(
                        'MM/DD/HH:mm',
                        informDetail.lastInformDeatail.time
                    )
                }}</span>
                <span class="unReadNum_box" v-if="informDetail.untreated >= 1">
                    <sup
                        class="unReadNum_count"
                        v-text="
                            informDetail.untreated >= 99
                                ? '99+'
                                : informDetail.untreated
                        "
                    ></sup>
                </span>
            </div>
        </li>
        <!-- 普通会话 -->
        <template v-if="Object.keys(conversationList).length > 0">
            <li
                v-for="(item, itemKey, index) in conversationList"
                :key="itemKey"
                @click="toChatMessage(item, itemKey, index)"
                :style="{
                    background:
                        checkedConverItemIndex === index ? '#E5E5E5' : ''
                }"
            >
                <el-popover
                    popper-class="conversation_popover"
                    placement="right-end"
                    trigger="contextmenu"
                    :show-arrow="false"
                    :offset="-10"
                >
                    <template #reference>
                        <div class="session_list_item">
                            <div class="item_body item_left">
                                <div class="session_other_avatar">
                                    <el-avatar
                                    v-if="item.type == 'friend'"
                                        :size="34"
                                        :src="
                                            friendList[item.id] &&
                                            friendList[item.id]
                                                .avatar
                                                ? friendList[
                                                      item.id
                                                  ].avatar
                                                : item?item.avatar:''
                                        "
                                    >
                                    </el-avatar>

                                    <el-avatar
                                    v-else
                                        :size="34"
                                        :src="
                                            joinedGroupList[item.id] &&
                                            joinedGroupList[item.id]
                                                .avatar
                                                ? baseUrl+joinedGroupList[item.id].avatar
                                                : item?baseUrl+item.avatar:''
                                        "
                                    >
                                    </el-avatar>
                                </div>
                            </div>
                            <div class="item_body item_main">
                                <div class="name">
                                    {{ handleConversationName(item) }}
                                </div>
                                <div class="last_msg_body">
                                    <span
                                        class="last_msg_body_mention"
                                        v-if="item.isMention"
                                        >[有人@我]</span
                                    >
                                    <span
                                        v-show="
                                            item.type ===
                                            CHAT_TYPE.GROUP
                                        "
                                        >{{ lastMessage(item).name }}</span
                                    >
                                    {{ lastMessage(item).content}}
                                </div>
                            </div>
                            <div class="item_body item_right">
                                <span class="time">
                                    {{ lastMessage(item).timestamp|| ''}}
                                </span>
                                <span
                                    class="unReadNum_box"
                                    v-if="item.unreadMessageNum >= 1"
                                >
                                    <sup
                                        class="unReadNum_count"
                                        v-text="
                                            item.unreadMessageNum >= 99
                                                ? '99+'
                                                : item.unreadMessageNum
                                        "
                                    ></sup>
                                </span>
                            </div>
                        </div>
                    </template>
                    <template #default>
                        <div
                            class="session_list_delete"
                            @click="deleteConversation(itemKey)"
                        >
                            删除会话
                        </div>
                    </template>
                </el-popover>
            </li>
        </template>
        <template v-else>
            <el-empty description="暂无最近会话" />
        </template>
    </el-scrollbar>
</template>

<style lang="scss" scoped>
.session_list {
    position: relative;
    height: 100%;
    padding: 0;
    margin: 0;
}

.offline_hint {
    width: 100%;
    height: 30px;
    text-align: center;
    line-height: 30px;
    color: #f35f81;
    background: #fce7e8;
    font-size: 7px;

    .plaint_icon {
        display: inline-block;
        width: 15px;
        height: 15px;
        color: #e5e5e5;
        text-align: center;
        line-height: 15px;
        font-size: 7px;
        font-weight: bold;
        background: #e6686e;
        border-radius: 50%;
    }
}

.session_list .session_list_item {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    height: 66px;
    background: #f0f0f0;
    color: var(--el-color-primary);
    border-bottom: 1px solid var(--el-border-color);
    cursor: pointer;

    &:hover {
        background: #e5e5e5;
    }

    .item_body {
        display: flex;
        height: 100%;
    }

    .item_left {
        flex-direction: row;
        align-items: center;
        justify-content: center;
        margin-left: 14px;
        margin-right: 10px;
    }

    .item_main {
        width: 225px;
        max-width: 225px;
        height: 34px;
        flex-direction: column;
        justify-content: space-between;
        align-items: flex-start;

        .name {
            min-width: 56px;
            max-width: 180px;
            height: 17px;
            font-weight: 400;
            font-size: 14px;
            /* identical to box height */
            color: #333333;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .last_msg_body {
            max-width: 185px;
            height: 17px;
            font-weight: 400;
            font-size: 12px;
            line-height: 17px;
            letter-spacing: 0.3px;
            color: #a3a3a3;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .last_msg_body_mention {
            font-size: 12px;
            line-height: 17px;
            font-weight: bold;
            color: red;
        }
    }

    .item_right {
        width: 25%;
        height: 34px;
        flex-direction: column;
        align-items: flex-end;
        margin-right: 10px;

        .time {
            font-size: 10px;
            font-weight: 400;
            font-size: 10px;
            line-height: 14px;
            letter-spacing: 0.25px;
            color: #a3a3a3;
        }

        .unReadNum_box {
            margin-top: 10px;
            vertical-align: middle;

            .unReadNum_count {
                display: inline-block;
                min-width: 20px;
                height: 20px;
                padding: 0 6px;
                color: #fff;
                font-weight: normal;
                font-size: 12px;
                line-height: 20px;
                white-space: nowrap;
                text-align: center;
                background: #f5222d;
                border-radius: 10px;
                box-sizing: border-box;
            }
        }
    }
}

.session_list_item_active {
    background: #d2d2d2;
}

.session_list .session_list_item + .list_item {
    margin-top: 10px;
}

.session_list_delete {
    cursor: pointer;
    transition: all 0.5s;

    &:hover {
        background: #e1e1e1;
    }
}
</style>
