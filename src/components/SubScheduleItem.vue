<template>
  <div :class="['sub-schedule-item', 'pointer', style]" @click="handlePlay">
    <div :class="['header', style]" flex="cross:center">
      <span class="time" flex-box="1">{{ duration }}</span>
      <img
        v-show="showDownloadButton"
        src="/images/icon_download_white.png"
        class="download"
        @click.stop="handleCache"
      />
    </div>
    <div class="body" flex>
      <img v-show="avatar" :src="avatar" alt="" class="avatar" />
      <div class="content m-l-12" flex-box="1">
        <p class="name text-hidden">
          {{ item.name }}
        </p>
        <p class="guest text-hidden m-t-10">{{ item.guestName }}</p>
        <p class="work text-hidden">{{ item.work }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
export default {
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      cacheFile: null,
      cacheTimestamp: null,
      hideLoading: null,
    };
  },
  created() {
    this.loadCache();
  },
  watch: {
    'item.ppt'() {
      this.loadCache();
    },
  },
  computed: {
    ...mapState(['loginType', 'baseURL']),
    ...mapGetters(['style']),
    duration() {
      return `${this.item.startTime}-${this.item.endTime}`;
    },
    avatar() {
      if (
        this.loginType === 'internet' ||
        this.item.avatar === '/images/default_avatar.png'
      ) {
        return this.item.avatar;
      } else if (this.item.avatar) {
        return `${this.baseURL}/${this.item.avatar}`;
      }
      return null;
    },
    showDownloadButton() {
      try {
        return this.cacheTimestamp !== this.item.timestamp;
      } catch (error) {
        return true;
      }
    },
  },
  mounted() {
    // 开启监听
    this.$ipcRenderer.on(`cache:${this.item.id}`, this.handleFinishCache);
  },
  beforeDestroy() {
    this.$ipcRenderer.off(`cache:${this.item.id}`, this.handleFinishCache);
  },
  methods: {
    async handlePlay() {
      if (this.cacheTimestamp === this.item.timestamp) {
        console.log('打开缓存');
        await this.$ipcRenderer.invoke('channel', {
          type: 'openCacheFile',
          data: {
            url: this.cacheFile,
            minutes: this.item.minutes,
            position: this.item.position,
          },
        });
      } else if (this.item.ppt) {
        let url = this.item.ppt;
        if (this.loginType === 'local') {
          url = `${this.baseURL}/${url}`;
        }
        this.$ipcRenderer.invoke('channel', {
          type: 'preview',
          data: {
            url,
            minutes: this.item.minutes,
            position: this.item.position,
          },
        });
      }
    },
    async handleCache() {
      if (this.item.ppt) {
        let url = this.item.ppt;
        if (this.loginType === 'local') {
          url = `${this.baseURL}/${url}`;
        }
        this.hideLoading = this.$message.loading('正在缓存，请稍后...', 0);
        this.$ipcRenderer.invoke('channel', {
          type: 'cacheFile',
          data: { url, itemId: this.item.id },
        });
      }
    },
    async handleFinishCache(e, { result, savePath }) {
      if (this.hideLoading) {
        this.hideLoading();
        this.hideLoading = null;
      }
      if (result) {
        // 缓存当前文件时间
        const timestampKey = `cache-timestamp:${this.loginType}:${this.item.id}`;
        const cacheKey = `cache:${this.loginType}:${this.item.id}`;
        this.$lowdb.set(timestampKey, this.item.timestamp).write();
        this.$lowdb.set(cacheKey, savePath).write();
        this.cacheTimestamp = this.item.timestamp;
        this.$message.success('缓存成功！');
      } else {
        this.$message.error('缓存失败！');
      }
      await this.$lowdb.read();
      this.loadCache();
    },
    async loadCache() {
      const key = `cache:${this.loginType}:${this.item.id}`;
      this.cacheFile = this.$lowdb.get(key).value();
      const timestampKey = `cache-timestamp:${this.loginType}:${this.item.id}`;
      this.cacheTimestamp = this.$lowdb.get(timestampKey).value();
    },
  },
};
</script>

<style lang="less" scoped>
.sub-schedule-item {
  border-radius: 4px;
  overflow: hidden;
  min-height: 172px;
  max-height: 172px;
  &:hover {
    transform: scale(1.014128728);
    transform-origin: center;
    transition: all 0.1s ease-in-out;
  }
}
.header {
  height: 48px;
  padding: 8px 16px;
  color: #fff;
  font-size: 24px;
  font-family: OpenSans-SemiBold, OpenSans;
  font-weight: 600;
  line-height: 32px;
  &.light {
    background-color: #838383;
  }
  &.red {
    background-color: #f60f0f;
  }
  &.blue {
    background-color: #2267e5;
  }
  .download {
    width: 32px;
    height: 32px;
    cursor: pointer;
  }
}
.body {
  padding: 12px;
  background-color: #e5e5e5;
  .avatar {
    width: 90px;
    min-width: 90px;
    height: 100px;
    border-radius: 4px;
  }
  .content {
    width: 260px;
  }
  .guest {
    height: 31px;
    font-size: 16px;
    font-family: PingFangTC-Semibold, PingFangTC;
    font-weight: 600;
    color: #333333;
    line-height: 22px;
  }
  .name {
    height: 24px;
    font-size: 20px;
    font-family: PingFangTC-Regular, PingFangTC;
    font-weight: 400;
    color: #333333;
    line-height: 24px;
  }
  .work {
    height: 14px;
    font-size: 12px;
    font-family: PingFangTC-Regular, PingFangTC;
    font-weight: 400;
    color: #333333;
    line-height: 14px;
  }
}
</style>