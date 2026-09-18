const state = {
  scale: 1
}

const mutations = {
  SET_SCALE(state, scale) {
    state.scale = scale
  }
}

const actions = {
  setScale({ commit }, scale) {
    commit('SET_SCALE', scale)
  }
}

const getters = {
  scale: (state) => state.scale
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
