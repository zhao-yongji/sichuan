import { getScreenOverview } from '@/api/modules/screen'

const useMock = import.meta.env.VITE_USE_MOCK === 'true'

function createMockData() {
  return {
    stats: {
      stock: 12860,
      breeding: 1860,
      inToday: 126,
      outToday: 98
    },
    structure: [
      { name: '能繁母畜', value: 1860 },
      { name: '育成畜', value: 3420 },
      { name: '育肥畜', value: 5680 },
      { name: '幼畜', value: 1900 }
    ],
    trend: {
      dates: ['09-12', '09-13', '09-14', '09-15', '09-16', '09-17', '09-18'],
      inValues: [88, 102, 96, 120, 110, 132, 126],
      outValues: [70, 84, 91, 78, 105, 88, 98]
    },
    farms: [
      { name: '天府一号牧场', value: 3200 },
      { name: '天府二号牧场', value: 2860 },
      { name: '天府三号牧场', value: 2410 },
      { name: '天府四号牧场', value: 2190 },
      { name: '天府五号牧场', value: 2200 }
    ],
    warnings: [
      { time: '09:12', text: '三号圈舍湿度偏高', level: '中' },
      { time: '10:26', text: '二号牧场出栏计划待确认', level: '低' },
      { time: '11:08', text: '饲料库存低于安全线', level: '高' },
      { time: '13:40', text: '一号牧场温控设备离线', level: '高' },
      { time: '14:18', text: '今日检疫记录待补录', level: '中' }
    ],
    env: [
      { name: '一号', temp: 24, humi: 62 },
      { name: '二号', temp: 26, humi: 58 },
      { name: '三号', temp: 29, humi: 76 },
      { name: '四号', temp: 23, humi: 55 },
      { name: '五号', temp: 25, humi: 60 }
    ]
  }
}

const state = {
  overview: createMockData()
}

const mutations = {
  SET_OVERVIEW(state, data) {
    state.overview = data
  }
}

const actions = {
  async fetchOverview({ commit }) {
    if (useMock) {
      commit('SET_OVERVIEW', createMockData())
      return
    }
    const res = await getScreenOverview()
    commit('SET_OVERVIEW', res.data || res)
  }
}

const getters = {
  overview: (state) => state.overview
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
