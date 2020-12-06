<template>
  <div class="page drag">
    <img src="/images/icon_close.png" class="close-btn" @click="handleClose" />
    <img src="/images/login_logo.png" class="logo" />
    <div class="main no-drag">
      <h2 class="title">客户端登录</h2>
      <div class="body m-t-24">
        <div class="radio-group m-b-16">
          <div
            :class="['radio', type === 'internet' && 'active']"
            @click="type = 'internet'"
          >
            互联网
          </div>
          <div
            :class="['radio', type === 'local' && 'active']"
            @click="type = 'local'"
          >
            局域网
          </div>
        </div>
        <a-form-model
          v-show="type === 'internet'"
          class="form"
          ref="internetForm"
          :model="internetForm"
          :rules="internetRules"
        >
          <a-form-model-item prop="username">
            <a-input
              v-model="internetForm.username"
              placeholder="请输入账号"
            ></a-input>
          </a-form-model-item>
          <a-form-model-item prop="password">
            <a-input
              v-model="internetForm.password"
              type="password"
              placeholder="请输入密码"
            ></a-input>
          </a-form-model-item>
          <a-form-model-item prop="loginCode">
            <a-input
              v-model="internetForm.loginCode"
              placeholder="请输入验证码"
            ></a-input>
          </a-form-model-item>
          <a-form-model-item>
            <a-button
              :loading="loading"
              type="primary"
              block
              @click="handleSubmit('internet')"
            >
              登录
            </a-button>
          </a-form-model-item>
        </a-form-model>
        <a-form-model
          v-show="type === 'local'"
          class="form"
          ref="localForm"
          :model="localForm"
          :rules="localRules"
        >
          <a-form-model-item prop="ip">
            <a-input
              v-model="localForm.ip"
              placeholder="请输入群晖IP"
            ></a-input>
          </a-form-model-item>
          <a-form-model-item prop="code">
            <a-input
              v-model="localForm.code"
              placeholder="请输入屏幕验证码"
            ></a-input>
          </a-form-model-item>
          <a-form-model-item>
            <a-button
              :loading="loading"
              type="primary"
              block
              @click="handleSubmit('local')"
            >
              登录
            </a-button>
          </a-form-model-item>
        </a-form-model>
      </div>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron';

export default {
  data() {
    const internetForm = this.$ls.get('internetForm');
    const localForm = this.$ls.get('localForm');
    return {
      type: 'internet',
      loading: false,
      internetForm: internetForm || {
        username: '',
        password: '',
        loginCode: '',
      },
      localForm: localForm || {
        ip: '',
        code: '',
      },
      internetRules: {
        username: [
          { required: true, message: '用户名不能为空', trigger: 'blur' },
        ],
        password: [
          { required: true, message: '密码不能为空', trigger: 'blur' },
        ],
        loginCode: [
          { required: true, message: '验证码不能为空', trigger: 'blur' },
        ],
      },
      localRules: {
        ip: [{ required: true, message: 'IP不能为空', trigger: 'blur' }],
        code: [{ required: true, message: '验证码不能为空', trigger: 'blur' }],
      },
    };
  },
  methods: {
    async handleSubmit(type) {
      this.loading = true;
      let res;
      try {
        switch (type) {
          case 'internet':
            await this.$refs.internetForm.validate();
            res = await this.$axios.post(
              `${process.env.VUE_APP_BASE_URL}/auth/clientLogin`,
              this.internetForm,
            );
            this.$ls.set('internetForm', this.internetForm);
            this.$lowdb.set('loginType', 'internet').write();
            this.$lowdb.set('token', res.token).write();
            this.$lowdb.set('screen', res.screen).write();
            break;
          case 'local':
            await this.$refs.localForm.validate();
            res = await this.$axios.post(
              `http://${this.localForm.ip}:3000/screen/login`,
              { code: this.localForm.code },
            );
            this.$ls.set('localForm', this.localForm);
            this.$lowdb.set('loginType', 'local').write();
            this.$lowdb
              .set('baseURL', `http://${this.localForm.ip}:3000`)
              .write();
            this.$lowdb.set('code', this.localForm.code).write();
            this.$lowdb.set('screen', res).write();
            break;
          default:
            break;
        }
        await this.$message.success('登录成功！', 1);
        await ipcRenderer.invoke('channel', { type: 'login' });
      } catch (error) {
        console.log('handleSubmit -> error', error);
      }
      this.loading = false;
    },
    handleClose() {
      ipcRenderer.invoke('channel', { type: 'quit' });
    },
  },
};
</script>

<style lang="less" scoped>
.page {
  width: 100vw;
  height: 100vh;
  background-image: url('/images/login_bg.png');
  background-size: cover;
  position: relative;
  .close-btn {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 12px;
    height: 12px;
    cursor: pointer;
  }
  .main {
    position: absolute;
    top: 52px;
    right: 64px;
    width: 332px;
    height: 424px;
    background-color: #fff;
    border-radius: 6px;
    padding: 40px 25px;
    .title {
      // width: 48px;
      height: 32px;
      font-size: 24px;
      font-family: PingFangTC-Medium, PingFangTC;
      font-weight: 500;
      color: rgba(51, 51, 51, 1);
      line-height: 32px;
    }
  }
  .radio-group {
    height: 40px;
    background: rgba(243, 243, 243, 1);
    border-radius: 2px;
    display: flex;
    flex-direction: row;
    align-items: stretch;
    .radio {
      flex: 1;
      line-height: 40px;
      text-align: center;
      font-size: 14px;
      font-family: PingFangTC-Regular, PingFangTC;
      font-weight: 400;
      color: rgba(51, 51, 51, 1);
      cursor: pointer;
      &.active {
        background: rgba(255, 255, 255, 1);
        box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.1);
        border-radius: 2px;
        border: 1px solid rgba(229, 229, 229, 1);
        color: #f60f0f;
      }
    }
  }
  .form {
    ::v-deep .ant-input {
      height: 40px;
      background: rgba(243, 243, 243, 1);
      border-radius: 2px;
      border: 1px solid rgba(229, 229, 229, 1);
    }
  }
  .logo {
    position: absolute;
    left: 126px;
    top: 212px;
    width: 192px;
    height: 52px;
  }
}
</style>
