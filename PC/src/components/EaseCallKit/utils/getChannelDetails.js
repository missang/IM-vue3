export default function (MEIMConn, payload) {
    const { username, channelName } = payload
    const myHeaders = new Headers()
    myHeaders.append('authorization', `Bearer ${MEIMConn.context.accessToken}`)
    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    }
    return new Promise(function (resolve, reject) {
        fetch(`${MEIMConn.apiUrl}/channel/mapper?userAccount=${username}&channelName=${channelName}&appkey=${window.encodeURIComponent(MEIMConn.appKey)}`, requestOptions)
            .then(response => response.text())
            .then(result => {
                console.log('result', JSON.parse(result))
                resolve(JSON.parse(result))
            })
            .catch(error => {
                reject(error)
                console.log('error', error)
            })
    })

}