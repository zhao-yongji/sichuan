import request, { get, post } from '@/api/request'

export function loginApi(data) {
  return post('/user/login', data)
}

export function getUserInfoApi() {
  return get('/user/info')
}

export function logoutApi() {
  return post('/user/logout')
}

/** 通用请求示例，按模块继续拆分即可 */
export function fetchDemoList(params) {
  return request({
    url: '/demo/list',
    method: 'get',
    params
  })
}
