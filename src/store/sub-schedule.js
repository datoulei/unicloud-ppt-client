import Vue from "vue";

export default {
  namespaced: true,
  state: {
    subSchedules: [],
    selected: null
  },
  mutations: {
    SET_SUB_SCHEDULES(state, list) {
      state.subSchedules = list
      return state
    },
    SORT_SUB_SCHEDULES(state, { oldIndex, newIndex }) {
      let leftElement, rightElement;
      const tempList = [...state.subSchedules]
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
      state.subSchedules = tempList
      return state
    },
    SET_SELECTED(state, selected) {
      state.selected = selected
      return state
    }
  },
  actions: {
    async getSubSchedules({ rootState, commit }, params) {
      const mainSchedule = rootState.mainSchedule.selected
      // 互联网模式
      const result = await Vue.axios.get(`/schedules/${mainSchedule.id}/children`, { params })
      const list = result
      commit('SET_SUB_SCHEDULES', list)
      return result
    },
    async createSubSchedule({ rootState }, data) {
      const mainSchedule = rootState.mainSchedule.selected
      await Vue.axios.post(`/schedules/${mainSchedule.id}/children`, data)
    },
    async updateSubSchedule({ rootState }, data) {
      const mainSchedule = rootState.mainSchedule.selected
      await Vue.axios.put(`/schedules/${mainSchedule.id}/children/${data.id}`, data)
    },
    async deleteSubSchedule({ rootState }, id) {
      const mainSchedule = rootState.mainSchedule.selected
      await Vue.axios.delete(`/schedules/${mainSchedule.id}/children/${id}`)
    },
    selectSubSchedule({ commit }, subSchedule) {
      commit('SET_SELECTED', subSchedule)
    },
    sortSubSchedules({ commit }, sort) {
      commit('SORT_SUB_SCHEDULES', sort)
    },
  },
}