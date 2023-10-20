/* 好友列表按照拼音排序 */
import _ from 'lodash'
import { pinyin } from 'pinyin-pro'
export default function (friendItemData) {
    const resultObj = {}
    const containerObj = {}
    console.log(friendItemData)
    for (const key in friendItemData) {
        if (Object.hasOwnProperty.call(friendItemData, key)) {
            const v = friendItemData[key]

            const pinyinKey = v.initials
            // const pinyinKey = v.username
            //     ? pinyin(v.username, { toneType: 'none' })[0]
            //     : pinyin(v.uid, { toneType: 'none' })[0]
            console.log(pinyinKey)
            console.log(containerObj[pinyinKey])
            if (containerObj[pinyinKey]) {
                containerObj[pinyinKey].push(v)
            } else {
                containerObj[pinyinKey] = []
                containerObj[pinyinKey].push(v)
            }
        }
    }
    const resultObjKeys = _.sortBy(_.keys(containerObj))

    resultObjKeys.forEach((a) => {
        resultObj[a] = containerObj[a]
    })
    return resultObj
}
