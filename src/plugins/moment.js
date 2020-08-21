import Vue from "vue";
import moment from "moment"

const Plugin = {
  install: function (Vue) {
    Vue.moment = moment
    Object.defineProperties(Vue.prototype, {
      $moment: {
        get() {
          return moment
        }
      }
    })
  }
}

Vue.use(Plugin)