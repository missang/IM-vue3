import http from '@/service/http'
import * as T from './types'

/** 获取数据列表 */
const IndexApi: T.IndexApi = {
  login(params) {
    return http.post('/index', params)
  },
}

export default IndexApi
