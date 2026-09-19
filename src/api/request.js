import axios from 'axios'
import { getToken } from '@/utils/auth'
import { REQUEST_TIMEOUT } from '@/config'

const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: REQUEST_TIMEOUT
})

service.interceptors.request.use(
  (config) => {
    const token = getToken()
    // 不覆盖调用方显式设置的 Authorization（如登录接口的 Basic 头）
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

service.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code !== undefined && res.code !== 200) {
      if (res.code === 401) {
        redirectToLogin()
      }
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return res
  },
  (error) => {
    // 兼容 OAuth2 / 网关错误体，提取可读信息
    const msg =
      error.response?.data?.meta?.message ||
      error.response?.data?.error_description ||
      error.response?.data?.message ||
      '网络异常，请稍后重试'
    // 424：账号被禁用/锁定等认证异常，与 401 同样清理凭证回登录页
    if (error.response?.status === 401 || error.response?.status === 424) {
      redirectToLogin()
    }
    return Promise.reject(new Error(msg))
  }
)

async function redirectToLogin() {
  const { default: store } = await import('@/store')
  const { default: router } = await import('@/router')
  await store.dispatch('user/resetToken')
  if (router.currentRoute.value.path !== '/login') {
    router.replace(`/login?redirect=${encodeURIComponent(router.currentRoute.value.fullPath)}`)
  }
}

export function get(url, params, config = {}) {
  return service({ url, method: 'get', params, ...config })
}

export function post(url, data, config = {}) {
  return service({ url, method: 'post', data, ...config })
}

export function put(url, data, config = {}) {
  return service({ url, method: 'put', data, ...config })
}

export function del(url, params, config = {}) {
  return service({ url, method: 'delete', params, ...config })
}

export default service
