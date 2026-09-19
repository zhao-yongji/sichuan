import { loginApi, getUserInfoApi, logoutApi } from '@/api/modules/user'
import { getToken, setToken, removeToken, getUserInfo, setUserInfo, removeUserInfo } from '@/utils/auth'

const useMock = import.meta.env.VITE_USE_MOCK === 'true'

const state = {
  token: getToken(),
  userInfo: getUserInfo()
}

const mutations = {
  SET_TOKEN(state, token) {
    state.token = token
    setToken(token)
  },
  SET_USER_INFO(state, info) {
    state.userInfo = info
    setUserInfo(info)
  },
  CLEAR_USER(state) {
    state.token = ''
    state.userInfo = null
    removeToken()
    removeUserInfo()
  }
}

const actions = {
  async login({ commit, dispatch }, form) {
    if (useMock) {
      commit('SET_TOKEN', 'mock-token')
      commit('SET_USER_INFO', {
        name: form.username || '管理员',
        role: 'admin'
      })
      return
    }

    // OAuth2 密码模式：响应体直接返回 access_token
    const res = await loginApi(form)
    commit('SET_TOKEN', res.access_token)
    await dispatch('getInfo')
  },

  async getInfo({ commit, state }) {
    if (useMock) {
      const info = state.userInfo || { name: '管理员', role: 'admin' }
      commit('SET_USER_INFO', info)
      return info
    }
    const res = await getUserInfoApi()
    const info = res.data || res
    commit('SET_USER_INFO', info)
    return info
  },

  async logout({ commit }) {
    try {
      if (!useMock) {
        await logoutApi()
      }
    } finally {
      commit('CLEAR_USER')
    }
  },

  resetToken({ commit }) {
    commit('CLEAR_USER')
  }
}

const getters = {
  token: (state) => state.token,
  userInfo: (state) => state.userInfo,
  userName: (state) => state.userInfo?.name || ''
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
