<script setup>
import { ref, watch, toRaw, nextTick, computed, onMounted } from 'vue'
import _ from 'lodash'
import { useRoute, onBeforeRouteLeave } from 'vue-router'
import { messageType, warningText } from '/@/constant'
import { ElMessage } from 'element-plus'
import { Close } from '@element-plus/icons-vue'
// import waterMark from '/@/utils/waterMark'
/* 组件 */
import MessageList from './components/messageList/index.vue'
import InputBox from './components/inputBox/index.vue'
import UserStatus from '/@/components/UserStatus/index.vue'
import GroupsDetails from '/@/views/Chat/components/AboutGroups/GroupsDetails/index.vue'
/* store */
import { uesContacts } from '/@/stores/contacts';
import {uesStoreMessage} from '/@/stores/message';
import { useGroups } from '/@/stores/goups';
const contactsStore = uesContacts()
const MessageStore = uesStoreMessage();
const groupsStore = useGroups()
/* route */
const route = useRoute()
const { CHAT_TYPE } = messageType
const { IM_PC_HINT, SWINDLER_GO_DIE, WARM_TIP } = warningText
const nowPickInfo = ref({})
const friendList = computed(() => contactsStore.storeFriendList)
const groupList = computed(() => contactsStore.contacts.groupList)
/* header 操作 */
const drawer = ref(false) //抽屉显隐
const handleDrawer = () => {
    drawer.value = !drawer.value
}
//删除好友
const delTheFriend = () => {
    if (nowPickInfo.value?.id) {
        const targetId = nowPickInfo.value.id
        // EaseChatClient.deleteContact(targetId)
        ElMessage({ type: 'success', center: true, message: '好友已删除~' })
    }
}
//加入好友到黑名单
// const addFriendToBlackList = () => {

// }
/* warningTips */
// const isShowWarningTips = computed(() => store.state.isShowWarningTips)
const randomTips = computed(() => {
    return _.toString(_.sampleSize(SWINDLER_GO_DIE, 1))
})
/* warterMark */
onMounted(() => {
    const chatContainer = document.querySelector('.chat_message_main')
    // chatContainer && waterMark({ container: chatContainer })
})
// const closeWarningTips = () => store.commit('CLOSE_WARNING_TIPS')
/* userInfo */
//获取路由ID对应的信息
const getIdInfo = async ({ id, chatType }) => {
    console.log(id, chatType,8989)
    //类型为单聊
    if (chatType === CHAT_TYPE.SINGLE) {
        if (friendList.value[id]) {
            nowPickInfo.value.userInfo = friendList.value[id]
        } else {
            return
        }
    }
    // //类型为群组
    if (chatType === CHAT_TYPE.GROUP) {
        // TODO:
        // const goupid =
        //     groupList.value[id]?.groupid && groupList.value[id]?.groupid
        // goupid && (await groupsStore.fetchMultiGoupsInfos(goupid))
        console.log(groupList.value[id],6666)
        if (groupList.value[id]?.groupDetail) {
            return (nowPickInfo.value.groupDetail =
                groupList.value[id].groupDetail)
        } else {
            //如果不存在用户属性则请求获取该群群详情。
            await contactsStore.getAssignGroupDetail(id)
            return (nowPickInfo.value.groupDetail =
                groupList.value[id].groupDetail)
        }
    }
}
//监听路由改变获取对应的getIdInfo
const stopWatchRoute = watch(
    () => route.query,
    (routeVal) => {
        console.log('>>>>>>>>监听到路由参数变化', routeVal)
        if (routeVal) {
            nowPickInfo.value = { ...routeVal }
           getIdInfo(routeVal)
        }
    },
    {
        immediate: true
    }
)
//获取群组详情
const groupDetail = computed(
    () =>
        (groupList.value[nowPickInfo.value.id] &&
            groupList.value[nowPickInfo.value.id]) ||
        {}
)
//离开该路由销毁route监听
onBeforeRouteLeave(() => {
    stopWatchRoute()
})
/* 消息相关 */
const loadingHistoryMsg = ref(false) //是否正在加载中
const isMoreHistoryMsg = ref(true) //加载文案展示为加载更多还是已无更多。
const notScrollBottom = ref(false) //是否滚动置底
//获取历史记录
const fechHistoryMessage = (loadType) => {
    if (!nowPickInfo.value) return []
    return async () => {
        loadingHistoryMsg.value = true
        notScrollBottom.value = true
        if (loadType == 'fistLoad') {

            const { messages } = await MessageStore.getHistoryMessage({
                ...nowPickInfo.value,
                // cursor: -1
            })
            if (messages && messages.length > 0) {
                //返回数组有数据显示加载更多
                isMoreHistoryMsg.value = true
            } else {
                //否则已无更多。
                isMoreHistoryMsg.value = false
            }
            setTimeout(() => {
                scrollMessageList('bottom')
            }, 500)
        } else {
            const fistMessageId =
                messageData.value[0] && messageData.value[0].id
            const { messages } = await MessageStore.getHistoryMessage({
                ...nowPickInfo.value,
                cursor: fistMessageId
            })
            if (messages.length > 0) {
                //返回数组有数据显示加载更多
                isMoreHistoryMsg.value = true
            } else {
                //否则已无更多。
                isMoreHistoryMsg.value = false
            }
            scrollMessageList('normal')
        }
        loadingHistoryMsg.value = false
        notScrollBottom.value = false
    }
}
//获取其id对应的消息内容
const messageData = computed(() => {
    //如果Message.messageList中不存在的话调用拉取漫游取一下历史消息
        return (
            (nowPickInfo.value.id &&
                MessageStore.messageList[nowPickInfo.value.id]) ||
            fechHistoryMessage('fistLoad')()
        )
})
const messageContainer = ref(null)
//控制消息滚动
const scrollMessageList = (direction) => {
    console.log('>>>>>scrollMessageList', direction)
    //direction滚动方向 bottom向下滚动 normal向上滚动
    nextTick(() => {
        const messageNodeList = document.querySelectorAll('.messageList_box')
        const fistMsgElement = messageNodeList[0]
        const lastMsgElement = messageNodeList[messageNodeList.length - 1]
        //直接滚动置底
        if (direction === 'bottom') {
            console.log('>>>滚动置底')
            lastMsgElement && lastMsgElement.scrollIntoView(false)
        }
        //保持当前的消息位于当前可视窗口
        if (direction === 'normal') {
            fistMsgElement.scrollIntoView(true)
        }
    })
}
// const scroll = ({ scrollTop }) => {
//   console.log('scrollscrollscroll', scrollTop)
// }
watch(
    () => messageData,
    (newMsg, oldMsg) => {
        nextTick(() => {
            console.log('>>>>>监听到消息变化', notScrollBottom.value,oldMsg)
            //判断拉取漫游导致的消息变化不需要执行滚动置底
            if (notScrollBottom.value) {
                return
            } else {
                setTimeout(() => {
                    scrollMessageList('bottom')
                }, 300)
            }
        })
    },
    {
        deep: true,
        immediate: true
    }
)
//监听到nowPickInfo改变 让消息直接置底
watch(
    () => route.query,
    () => {
        if (Object.keys(nowPickInfo.value).length > 0) {
            nextTick(() => {
                scrollMessageList('bottom')
            })
        }
    }
)

//消息重新编辑
const inputBox = ref(null)
const reEditMessage = (msg) => (inputBox.value.textContent = msg)
//消息引用
const messageQuote = (msg) => inputBox.value.handleQuoteMessage(msg)
</script>
<template>
    <el-container class="app_container">
        <el-header class="chat_message_header">

            <template v-if="nowPickInfo.chatType === CHAT_TYPE.SINGLE">
                <div v-if="nowPickInfo.userInfo" class="chat_user_box">
                    <span class="chat_user_name">
                        {{
                            nowPickInfo.userInfo.username || nowPickInfo.id
                        }}</span
                    >
                    <UserStatus :userStatus="nowPickInfo.userInfo.userStatus" />
                </div>
                <div v-else>
                    {{ nowPickInfo.id
                    }}<span style="font-size: 10px">(非好友)</span>
                </div>
            </template>
            <template v-if="nowPickInfo.chatType === CHAT_TYPE.GROUP">
                <div v-if="nowPickInfo.groupDetail" class="chat_user_box">
                    <span class="chat_user_name">
                        {{ groupDetail.groupname || '' }}
                        {{ `(${groupDetail?.groupDetail?.count || ''})` }}
                    </span>
                </div>
                <div v-else class="chat_user_box">
                    <span class="chat_user_name">
                        {{ groupDetail.groupname || nowPickInfo.id }}{{ groupDetail?.groupDetail?.count }}
                    </span>
                </div>
            </template>
            <!-- 群组展示抽屉 -->
            <span
                class="more"
                v-if="
                    nowPickInfo.groupDetail &&
                    nowPickInfo.chatType === CHAT_TYPE.GROUP
                "
                @click="handleDrawer"
            >
                <svg
                    width="18"
                    height="4"
                    viewBox="0 0 18 4"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <circle cx="2" cy="2" r="2" fill="#333333" />
                    <circle cx="9" cy="2" r="2" fill="#333333" />
                    <circle cx="16" cy="2" r="2" fill="#333333" />
                </svg>
            </span>
            <!-- 单人展示删除拉黑 -->
            <span class="more" v-if="nowPickInfo.chatType === CHAT_TYPE.SINGLE">
                <el-dropdown placement="bottom-end" trigger="click">
                    <svg
                        width="18"
                        height="4"
                        viewBox="0 0 18 4"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <circle cx="2" cy="2" r="2" fill="#333333" />
                        <circle cx="9" cy="2" r="2" fill="#333333" />
                        <circle cx="16" cy="2" r="2" fill="#333333" />
                    </svg>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item @click="delTheFriend">
                                删除好友
                            </el-dropdown-item>
                            <!-- <el-dropdown-item @click="addFriendToBlackList">
                加入黑名单
              </el-dropdown-item> -->
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </span>
        </el-header>
        <!-- <div v-if="isShowWarningTips" class="IM_PC_safe_tips">
            <p>{{ IM_PC_HINT }}</p>
            <p>【防骗提示】{{ randomTips }}</p>
            <p
                v-show="
                    nowPickInfo.chatType === CHAT_TYPE.GROUP &&
                    nowPickInfo?.groupDetail?.custom !== 'default'
                "
            >
                {{ WARM_TIP }}
            </p>
            <span class="IM_PC_close_tips" @click="closeWarningTips">
                <el-icon>
                    <Close />
                </el-icon>
            </span>
        </div> -->
        <el-main class="chat_message_main">
            <el-scrollbar class="main_container" ref="messageContainer">
                <div class="innerRef">
                    <div v-show="isMoreHistoryMsg" class="chat_message_tips">
                        <div
                            v-show="
                                messageData?.length &&
                                messageData[0].type !== 'inform'
                            "
                            class="load_more_msg"
                        >
                            <el-link
                                v-show="!loadingHistoryMsg"
                                :disabled="!isMoreHistoryMsg"
                                :underline="false"
                                @click="fechHistoryMessage()()"
                            >
                                加载更多
                            </el-link>
                            <el-link v-show="loadingHistoryMsg" disabled
                                >消息加载中...</el-link
                            >
                        </div>
                    </div>
                    <MessageList
                        :nowPickInfo="nowPickInfo"
                        :messageData="messageData"
                        @scrollMessageList="scrollMessageList"
                        @reEditMessage="reEditMessage"
                        @messageQuote="messageQuote"
                    />
                </div>
            </el-scrollbar>
        </el-main>
        <el-footer class="chat_message_inputbar">
            <InputBox ref="inputBox" :nowPickInfo="nowPickInfo" />
        </el-footer>
        <el-drawer
            v-if="nowPickInfo.chatType === CHAT_TYPE.GROUP"
            v-model="drawer"
            :show-close="false"
            :close-on-click-modal="true"
            direction="rtl"
            :modal="true"
            size="280px"
        >
            <GroupsDetails
                :nowGroupId="nowPickInfo.id"
                :groupDetail="groupDetail"
                @handleDrawer="handleDrawer"
            />
        </el-drawer>
    </el-container>
</template>

<style lang="scss" scoped>
@import './index.scss';
</style>
