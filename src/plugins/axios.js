"use strict";

import Vue from "vue";
import axios from "axios";
import _ from 'lodash';
import { message } from 'ant-design-vue'

// Full config:  https://github.com/axios/axios#request-config
// axios.defaults.baseURL = process.env.baseURL || process.env.apiUrl || '';
// axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

let config = {
  baseURL: process.env.VUE_APP_BASE_URL || process.env.apiUrl || ""
  // timeout: 60 * 1000, // Timeout
  // withCredentials: true, // Check cross-site Access-Control
};

const _axios = axios.create(config);

_axios.interceptors.request.use(
  function (config) {
    const loginType = Vue.ls.get('loginType')
    const token = Vue.ls.get('token')
    if (loginType === 'internet') {
      Object.assign(config.headers, {
        'Authorization': `Bearer ${token}`
      })
    }
    // Do something before request is sent
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

// Add a response interceptor
_axios.interceptors.response.use(
  function (response) {
    // Do something with response data
    return response.data;
  },
  function (error) {
    if (error.response) {
      const msg = _.get(error, 'response.data.message')
      console.log("message", msg)
      message.error(msg)
    } else {
      message.error('网络异常，请检查')
    }
    // Do something with response error
    return Promise.reject(error);
  }
);

Plugin.install = function (Vue) {
  Vue.axios = _axios;
  window.axios = _axios;
  Object.defineProperties(Vue.prototype, {
    axios: {
      get() {
        return _axios;
      }
    },
    $axios: {
      get() {
        return _axios;
      }
    }
  });
};

Vue.use(Plugin);

export default Plugin;
