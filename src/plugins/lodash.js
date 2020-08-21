import Vue from 'vue';
import _lodash from 'lodash';

const Plugin = {
  install: function (Vue) {
    Vue.lodash = _lodash
    window.lodash = _lodash
    Object.defineProperties(Vue.prototype, {
      $lodash: {
        get() {
          return _lodash
        }
      }
    })
  }
}

Vue.use(Plugin)