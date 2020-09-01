<template>
  <div class="fab">
    <div
      :class="['fab-button', style, show && 'active']"
      @click="show = !show"
    />
    <div v-show="show" class="menus">
      <a-tooltip placement="left" title="返回">
        <div class="menu-item back" @click="handleAction('back')"></div>
      </a-tooltip>
      <a-tooltip placement="left" title="退出登录">
        <div class="menu-item logout" @click="handleAction('logout')"></div>
      </a-tooltip>
      <a-tooltip placement="left" title="刷新">
        <div class="menu-item refresh" @click="handleAction('refresh')"></div>
      </a-tooltip>
      <a-tooltip v-if="routerName === 'Home'" placement="left" title="切换列数">
        <div class="menu-item column" @click="handleAction('column')"></div>
      </a-tooltip>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
export default {
  data() {
    return {
      show: false,
    };
  },
  computed: {
    ...mapState(['screen']),
    style() {
      return this.screen.style;
    },
    routerName() {
      return this.$route.name;
    },
  },
  methods: {
    ...mapActions(['toggleColumn']),
    ...mapActions('mainSchedule', ['getMainSchedules']),
    ...mapActions('subSchedule', ['getSubSchedules']),
    handleAction(key) {
      switch (key) {
        case 'back':
          this.$router.replace({ name: 'Home' });
          break;
        case 'logout':
          this.logout();
          break;
        case 'refresh':
          if (this.$route.name === 'Home') {
            this.getMainSchedules();
          } else if (this.$route.name === 'MainSchedule') {
            this.getSubSchedules();
          }
          break;
        case 'column':
          this.toggleColumn();
          break;
        default:
          break;
      }
    },
    logout() {
      this.$confirm({
        title: '退出登录确认',
        content: '是否确认退出登录？',
        onOk: () => {
          this.$ls.remove('loginType');
          this.$ls.remove('token');
          this.$ls.remove('code');
          this.$ls.remove('screen');
          this.$lowdb.unset('isLogin').write();
          this.$message.success('退出登录成功！');
          this.$ipcRenderer.invoke('channel', { type: 'logout' });
        },
      });
    },
  },
};
</script>

<style lang="less" scoped>
.fab {
  position: fixed;
  right: 24px;
  bottom: 28px;
}
.fab-button {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, 0.2);
  border: 2px solid rgba(255, 255, 255, 1);
  cursor: pointer;
  background-size: 32px;
  background-repeat: no-repeat;
  background-position: center;
  background-image: url('/images/icon_fab_more.png');
  &.blue {
    background-color: #2267e5;
    &.active {
      background-image: url('/images/icon_fab_more_blue.png');
    }
  }
  &.red {
    background-color: #f60f0f;
    &.active {
      background-image: url('/images/icon_fab_more_red.png');
    }
  }
  &.light {
    background-color: #75767a;
    &.active {
      background-image: url('/images/icon_fab_more_light.png');
    }
  }
  &.active {
    background-color: #fff;
  }
}
.menus {
  position: absolute;
  bottom: 48px;
  .menu-item {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 1);
    border: 1px solid rgba(229, 229, 229, 1);
    margin-bottom: 8px;
    background-size: 32px;
    background-repeat: no-repeat;
    background-position: center;
    cursor: pointer;
    &.back {
      background-image: url('/images/icon_back.png');
    }
    &.logout {
      background-image: url('/images/icon_logout.png');
    }
    &.refresh {
      background-image: url('/images/icon_refresh.png');
    }
    &.column {
      background-image: url('/images/icon_column.png');
    }
  }
}
</style>
