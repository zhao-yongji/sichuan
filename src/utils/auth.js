import { TOKEN_KEY, USER_INFO_KEY } from '@/config'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || ''
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token || '')
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export function getUserInfo() {
  try {
    return JSON.parse(localStorage.getItem(USER_INFO_KEY) || 'null')
  } catch {
    return null
  }
}

export function setUserInfo(info) {
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(info || null))
}

export function removeUserInfo() {
  localStorage.removeItem(USER_INFO_KEY)
}
