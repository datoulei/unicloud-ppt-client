import Vue from 'vue'
import Mock from "mockjs";

const Plugin = {
  install: function (Vue) {
    Vue.mock = Mock
    Object.defineProperties(Vue.prototype, {
      $mock: {
        get() {
          return Mock
        }
      }
    })
  }
}

Vue.use(Plugin)