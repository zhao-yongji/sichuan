const SIDEBAR_KEY = 'tianfu_sidebar_collapsed'

const state = {
  sidebarCollapsed: localStorage.getItem(SIDEBAR_KEY) === '1',
  device: 'desktop'
}

const mutations = {
  TOGGLE_SIDEBAR(state) {
    state.sidebarCollapsed = !state.sidebarCollapsed
    localStorage.setItem(SIDEBAR_KEY, state.sidebarCollapsed ? '1' : '0')
  },
  SET_DEVICE(state, device) {
    state.device = device
  }
}

const actions = {
  toggleSidebar({ commit }) {
    commit('TOGGLE_SIDEBAR')
  },
  setDevice({ commit }, device) {
    commit('SET_DEVICE', device)
  }
}

const getters = {
  sidebarCollapsed: (state) => state.sidebarCollapsed,
  device: (state) => state.device
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
