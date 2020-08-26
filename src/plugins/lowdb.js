import Vue from "vue";
import lowdb from '../lowdb'

const Plugin = {
  install: function (Vue) {
    Vue.lowdb = lowdb;
    Object.defineProperties(Vue.prototype, {
      $lowdb: {
        get() {
          return lowdb
        }
      }
    })
  }
}

Vue.use(Plugin)