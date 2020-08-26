import Vue from "vue";

export default {
  namespaced: true,
  state: {
    mainSchedules: [],
    selected: null
  },
  mutations: {
    SET_MAIN_SCHEDULES(state, list) {
      state.mainSchedules = list.map(item => {
        item.date = Vue.moment(item.startDate).format('YYYY年MM月DD日')
        return item
      })
      return state
    },
    SORT_MAIN_SCHEDULES(state, { oldIndex, newIndex }) {
      let leftElement, rightElement;
      const tempList = [...state.mainSchedules]
      const oldElement = tempList[oldIndex];
      const isLast = newIndex === tempList.length - 1;
      const isFirst = newIndex === 0;
      if (isFirst) {
        // 拖到列表头
        rightElement = tempList[0];
        oldElement.order = rightElement.order / 2;
      } else if (isLast) {
        // 拖到列表尾
        leftElement = tempList[tempList.length - 1];
        oldElement.order = leftElement.order * 2;
      } else {
        // 拖到列表中间
        leftElement = tempList[newIndex];
        rightElement = tempList[newIndex + 1];
        oldElement.order = (leftElement.order + rightElement.order) / 2;
      }
      tempList.splice(oldIndex, 1)
      tempList.splice(newIndex, 0, oldElement);
      state.mainSchedules = tempList
      return state
    },
    SET_SELECTED(state, selected) {
      state.selected = selected
      return state
    }
  },
  actions: {
    async getMainSchedules({ rootState, commit }, params) {
      const screen = rootState.screen
      const result = await Vue.axios.get(`/screens/${screen.id}/schedules`, { params })
      const list = result
      commit('SET_MAIN_SCHEDULES', list)
      return result
    },
    async createMainSchedule({ rootState }, data) {
      const screen = rootState.screen
      await Vue.axios.post(`/screens/${screen.id}/schedules`, data)
    },
    async updateMainSchedule({ rootState }, data) {
      const screen = rootState.screen
      await Vue.axios.put(`/screens/${screen.id}/schedules/${data.id}`, data)
    },
    async deleteMainSchedule({ rootState }, id) {
      const screen = rootState.screen
      await Vue.axios.delete(`/screens/${screen.id}/schedules/${id}`)
    },
    selectMainSchedule({ commit }, mainSchedule) {
      commit('SET_SELECTED', mainSchedule)
    },
    sortMainSchedules({ commit }, sort) {
      commit('SORT_MAIN_SCHEDULES', sort)
    },
  },
}