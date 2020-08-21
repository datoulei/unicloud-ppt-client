import Vue from 'vue';
import { ipcRenderer } from 'electron';

const Plugin = {
  install: function (Vue) {
    Vue.ipcRenderer = ipcRenderer
    Object.defineProperties(Vue.prototype, {
      $ipcRenderer: {
        get() {
          return ipcRenderer
        }
      }
    })
  }
}

Vue.use(Plugin)