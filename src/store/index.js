import { createStore } from 'vuex'
import user from './modules/user'
import app from './modules/app'
import screen from './modules/screen'

const store = createStore({
  modules: {
    user,
    app,
    screen
  }
})

export default store
