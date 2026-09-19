import { get, post, del } from '@/api/request'

/**
 * 登录（OAuth2 密码模式）
 * 参数以 query 形式传递，需要特定的 Basic Authorization 头
 */
export function loginApi(params) {
  const Authorization = 'Basic c2N0ZWxjcDE6Y2NhMmQzYWU3YzU0YmY4ZTM4NTM='
  return post('/user/auth/oauth2/token', null, {
    params,
    headers: { Authorization }
  })
}

/** 退出登录 */
export function logoutApi() {
  return del('/user/auth/token/logout')
}

/** 获取用户信息 */
export function getUserInfoApi() {
  return post('/api/user/info', { appCode: 'xxx-manage-service' })
}

/** 获取图形验证码 */
export function getCodeImgApi() {
  return get('/api/captcha/generate')
}
