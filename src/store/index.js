import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    loginType: Vue.ls.get('loginType'),
    screen: Vue.ls.get('screen'),
  },
  mutations: {
  },
  actions: {
  },
  modules: {
  }
})
