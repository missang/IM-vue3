import { computed } from 'vue'
import { uesContacts } from '/@/stores/contacts';
import { useGroups } from '/@/stores/goups';
import { useUserInfo } from '/@/stores/userInfo';

const useGetUserMapInfo = () => {
    const contactsStore = uesContacts()
    const userInfoStore = useUserInfo()
    const groupsStore = useGroups()
    const getTheGroupNickNameById = (groupId:any, targetId:any) => {
        const userInfoFromGroupNickname = computed(() => {
            return groupsStore.groupsInfos[groupId]?.groupMemberInfo?.[
                targetId
            ]?.nickName
        })
        const friendUserInfoNickname = computed(() => {
            return contactsStore.contacts.friendList?.[targetId]?.nickname
        })
        return (
            userInfoFromGroupNickname.value ||
            friendUserInfoNickname.value ||
            targetId
        )
    }
    const getLoginNickNameById = () => {
        const loginUserInfoNickname = computed(() => {
            return (
                userInfoStore.userInfos.nickname ||
                userInfoStore.userInfos.nickname.uid
            )
        })
        return loginUserInfoNickname.value
    }
    return {
        getTheGroupNickNameById,
        getLoginNickNameById
    }
}
export default useGetUserMapInfo
