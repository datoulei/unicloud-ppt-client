import Vue from 'vue'
import VueRouter from 'vue-router'
import BaseLayout from "@/layout/BaseLayout";
import Home from '../views/Home.vue'
import MainSchedule from '../views/MainSchedule.vue'
import Login from '../views/Login.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    component: BaseLayout,
    redirect: '/home',
    children: [
      {
        path: '/home',
        name: 'Home',
        component: Home
      },
      {
        path: '/schedule/:id',
        name: 'MainSchedule',
        component: MainSchedule
      },
    ]
  },
  {
    path: "/login",
    name: "Login",
    component: Login
  },
]

const router = new VueRouter({
  base: process.env.BASE_URL,
  routes
});

router.beforeEach((to, from, next) => {
  console.log('开始路由跳转钩子')
  let isLogin = false;
  const loginType = Vue.ls.get('loginType');
  const token = Vue.ls.get('token');
  const code = Vue.ls.get('code');
  switch (loginType) {
    case 'internet':
      isLogin = !!token;
      break;
    case 'local':
      isLogin = !!code;
      break;
    default:
      break;
  }
  if (!isLogin) {
    console.log('用户未登录，跳转登录页面')
    // 未登录
    if (to.path !== '/login') {
      next('/login');
    } else {
      next();
    }
  } else {
    console.log('用户已登录，跳转首页')
    // 已登录
    if (to.path === '/login') {
      next('/')
    } else {
      next();
    }
  }
})

export default router
