<script setup>
import { computed } from 'vue'
import _ from 'lodash'

import { useRouter } from 'vue-router'
const router = useRouter()
/* 搜索框组件 */
import SearchInput from '/@/components/SearchInput/index.vue'
/* 欢迎页 */
import Welcome from '/@/components/Welcome/index.vue'
/* 会话列表组件 */
import ConversationList from './components/ConversationList.vue'
import { uesConversation } from '/@/stores/conversation';
const conversationStore = uesConversation()


const conversationList = computed(() => {
    return _.values(conversationStore.conversationListData)
})

//路由跳转-系统通知
const toInformDetails = () => {
    router.push('/chat/conversation/informdetails')
}

//路由跳转-对应好友会话
const toChatMessage = (id, chatType) => {
    console.log('>>>>>>>id', id)
    router.push({
        path: '/chat/conversation/message', query: {
            id,
            chatType
        }
    })
}

</script>
<template>
  <el-container style="height: 100% ">
    <el-aside class="chat_converation_box">
      <!-- 搜索组件 -->
      <SearchInput :searchType="'conversation'" :searchData="conversationList" @toChatMessage="toChatMessage" />
      <div class="chat_conversation_list">
        <ConversationList @toInformDetails="toInformDetails" @toChatMessage="toChatMessage" />
      </div>
    </el-aside>
    <el-main class="chat_converation_main_box">
      <router-view></router-view>
      <Welcome />
    </el-main>
  </el-container>
</template>

<style lang="scss" scoped>
.chat_converation_box {
  position: relative;
  background: #cfdbf171;
  overflow: hidden;
  min-width: 324px;

  .chat_conversation_list {
    height: calc(100% - 60px);
  }
}

.chat_converation_main_box {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 0;
}
</style>
