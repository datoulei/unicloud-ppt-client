import Vue from "vue";
import 'normalize.css';
import 'flex.css';
import "./plugins/db";
import "./plugins/axios";
import "./plugins/antd";
import "./plugins/ls";
import "./plugins/moment";
import "./plugins/ipcRenderer";
import "./plugins/lodash";
import "./plugins/mock";
import "./plugins/clipboard";
import './common.less'
import App from "./App.vue";
import router from "./router";
import store from "./store";

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");

// Vue.ls.remove('loginType')
// Vue.ls.remove('token')
// Vue.ls.remove('code')

if (process.argv.includes('main-window')) {
  console.log('检查登录状态')
  const loginType = Vue.ls.get('loginType')
  const token = Vue.ls.get('token')
  const code = Vue.ls.get('code')
  if ((loginType === 'internet' && !!token) || (loginType === 'local' && !!code)) {
    console.log('已登录，唤醒主进程')
    Vue.ipcRenderer.invoke('channel', { type: 'init', data: { isLogin: true } });
  } else {
    console.log('未登录，打开登录进程')
    Vue.ipcRenderer.invoke('channel', { type: 'init', data: { isLogin: false } });
  }
}

