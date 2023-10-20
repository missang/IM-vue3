<script setup lang="ts">
import { uesContacts } from '/@/stores/contacts'
const contactsStore = uesContacts()

import { ElNotification } from 'element-plus'
import { getApplyFriend, getApplyFriendInfo, getFriendInfo } from '/@/api/chat/index';
import { useUserInfo } from '/@/stores/userInfo';
const userInfoStore = useUserInfo()
import { useRouter } from 'vue-router'
const router = useRouter()
/* 默认头像 */
import defaultAvatar from '/@/assets/images/avatar/theme2x.png'
const props = defineProps({
    dialogVisible: {
        type: Boolean,
        default: false
    }
})
const loading = ref(false); // 定义接口是否还没返回
const { dialogVisible } = toRefs(props)
const emit = defineEmits(['closeDialogVisible'])
const applyAddFriendsForm = reactive({
    username: '',
    applyFriendMessage: '',
    uid: 0,
    avatar: '',
    nickname: ''
})
const friendList = computed(() => contactsStore.contacts.friendList)
console.log('>>>>>好友列表', friendList.value)
const applyAddFriends = async () => {
    if (!applyAddFriendsForm.username) return ElNotification({
        title: '好友操作',
        message: '好友ID不可为空！',
        type: 'warning',
    })
    if (Object.keys(friendList.value).includes(addFriends_info.value.uid.toString())) return ElNotification({
        title: '好友操作',
        message: '该ID已成为您的好友！',
        type: 'warning',
    })
    if (addFriends_info.value.uid === userInfoStore.userInfos.uid) return ElNotification({
        title: '好友操作',
        message: '不可添加自己为好友！',
        type: 'warning',
    })

    if (loading.value) return
    loading.value = true
    try {
        await getApplyFriend({
            friend_uid: addFriends_info.value.uid, postscript: applyAddFriendsForm.applyFriendMessage
        })
        loading.value = false
        ElNotification({
            title: '好友操作',
            message: '好友申请已发送！',
            type: 'success',
        })
    } catch (error) {
        console.log('>>>>>添加失败', error)
        loading.value = false
    } finally {
        resetFriends_info()
        resetTheModalStatus()
        loading.value = false
    }

}
const nextStep = ref(0) //下一步

let addFriends_info = ref({
    username: '',
    applyFriendMessage: '',
    uid: 0,
    avatar: '',
    nickname: ''
});

const search = async () => {
    if (loading.value) return
    loading.value = true

    if (!applyAddFriendsForm.username) {
        ElNotification({
            title: '好友操作',
            message: '好友ID不可为空！',
            type: 'error',
        })
        setTimeout(()=>{
        loading.value = false

        },1000)
        return 
    } 
    try {
        const result = await getApplyFriendInfo(applyAddFriendsForm.username)
        addFriends_info.value = result.data
        const friendInfo = await getFriendInfo(result.data.uid)
        if (friendInfo.data.is_friend) {
            addFriends_info.value = { ...result.data, ...friendInfo.data }
            router.push({ path: '/chat/contacts/contactInfo', query: { uid: friendInfo.data.uid, chatType: 'singleChat' } })
        }
        loading.value = false
    } catch (error: any) {
        ElNotification({
            title: '',
            message: error.msg,
            type: 'error',
        })
        loading.value = false
    }
}
//监听关闭初始化form内容
watch(dialogVisible, (newVal) => {
    if (!newVal) {
        console.log('>>>>>监听到关闭', newVal)
        resetFriends_info()
        resetTheModalStatus()
    }

})
const resetTheModalStatus = () => {
    applyAddFriendsForm.username = ''
    applyAddFriendsForm.applyFriendMessage = ''
    emit('closeDialogVisible')
}

const resetFriends_info = () => {
    addFriends_info.value = {
        username: '',
        applyFriendMessage: '',
        uid: 0,
        avatar: '',
        nickname: ''
    }

    emit('closeDialogVisible')
}
</script>
<template>
    <div class="app_container">
        <template v-if="nextStep == 0">

            <el-form label-position="top" label-width="100px">
                <el-form-item label="" style="margin-bottom: 20px">
                    <el-input class="addFriends_input" style="width:calc(100% - 80px)" @keyup.enter.native="search()"
                        v-model.trim="applyAddFriendsForm.username" placeholder="请输入对方ID" />
                    <el-button style="width:70px;height:40px;margin-left:10px;" type="primary" @click="search"
                        :loading="loading">搜索</el-button>
                </el-form-item>
            </el-form>
            <div class="addFriends_info flex-box-x flex-y-center" v-if="addFriends_info.uid">
                <el-avatar class="addFriends_info_avatar" style="margin-right: 11px" :size="33.03"
                    :src="addFriends_info.avatar || defaultAvatar">
                </el-avatar>
                <div class="addFriends_info_userName">{{ addFriends_info.nickname }}</div>
                <div class="col-xs-x"></div>
                <el-button type="primary" link class="addBtn" @click="nextStep = 1">添加
                </el-button>
            </div>
        </template>
        <template v-else>

            <div class="addFriends_info flex-xy-center" v-if="addFriends_info.uid"
                style="text-align:center;margin-bottom:20px;">
                <div>

                    <el-avatar class="addFriends_info_avatar" :size="80" :src="addFriends_info.avatar || defaultAvatar">
                    </el-avatar>
                    <div class="addFriends_info_userName" style="margin-top:10px;font-weight:bold;font-size:20px">
                        {{ addFriends_info.nickname }}</div>
                </div>
            </div>
            <el-form label-position="top" label-width="100px">
                <el-form-item label="申请信息" style="margin-bottom: 28px">
                    <el-input class="addFriends_input" v-model="applyAddFriendsForm.applyFriendMessage" maxlength="150"
                        show-word-limit />
                </el-form-item>


                <el-row class="create_groups_btn" justify="space-around" align="middle">
                    <el-col class="lastStep" :span="12" style="text-align:left">
                        <el-button @click="nextStep = 0">上一步</el-button>
                    </el-col>
                    <el-col class="lastStep" :span="12" style="text-align:right">
                        <el-button type="primary" :loading="loading" @click="applyAddFriends">加为好友</el-button>
                    </el-col>
                </el-row>
                <!-- <el-form-item>
                    <div class="apply_goups_btn_box">
                        <el-button type="primary" color="#0091FF" class="apply_goups_btn" @click="applyAddFriends">
                        </el-button>
                    </div>
                </el-form-item> -->
            </el-form>
        </template>
    </div>
</template>



<style lang="scss" scoped>
.addFriends_input {
    height: 40px;
}

:deep(.addFriends_input>.el-input__wrapper) {
    border-radius: 5px;
}

.apply_goups_btn_box {
    width: 100%;
    height: 50px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;

    .apply_goups_btn {
        width: 212px;
        height: 40px;
    }
}

.addFriends_info {
    margin-top: 30px;

    .addFriends_info_avatar {}

    .addFriends_info_userName {}

    .addBtn {}
}
</style>