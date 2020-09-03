import Vue from "vue";
import 'normalize.css';
import 'flex.css';
import "./plugins/db";
import "./plugins/lowdb";
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
