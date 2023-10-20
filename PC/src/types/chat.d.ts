/**
 * 群组模块
 */
interface GroupsInfos {
    groupsInfos: any
}


/**
 * 联系人模块
 */

interface ApplyFriend {
        friend_uid: number, 
        postscript?: string
}


/**
 * 聊天Store模块
 */
interface FriendList {
    [axis: string]: {
		userStatus:string
	},
}
interface groupList {
    [axis: string]: {
		groupname: string,
		disabled: boolean,
		groupid:number,
		groupDetail:Object
	},
}
declare interface Contacts<T = any> {
	contacts: {
		friendList: {
			[axis: string]: FriendList
		},
		groupList: groupList,
		friendBlackList: Array,
		conversationListData:Array
	};
}

