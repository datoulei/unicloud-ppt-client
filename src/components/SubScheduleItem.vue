<template>
  <div :class="['sub-schedule-item', 'pointer', style]" @click="handlePlay">
    <template v-if="style === 'blue'">
      <div :class="['header', style]" flex="cross:center">
        <span class="time" flex-box="1">{{ duration }}</span>
        <img
          v-if="!item.ppt"
          src="/images/icon_refresh_blue.png"
          class="refresh"
          @click.stop="handleEmpty"
        />
        <img
          v-else-if="showDownloadButton"
          src="/images/icon_download_blue.png"
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
    </template>
    <template v-else-if="style === 'red'">
      <div class="body">
        <div class="icon-wrapper">
          <img
            v-if="!item.ppt"
            src="/images/icon_refresh_red.png"
            class="refresh"
            @click.stop="handleEmpty"
          />
          <img
            v-else-if="showDownloadButton"
            src="/images/icon_download_red.png"
            class="download"
            @click.stop="handleCache"
          />
        </div>
        <p class="name text-hidden">
          {{ item.name }}
        </p>
        <div flex>
          <img
            :src="avatar || '/images/default_avatar.png'"
            alt=""
            class="avatar"
          />
          <div class="content">
            <p class="time">{{ duration }}</p>
            <p class="guest text-hidden">{{ item.guestName }}</p>
            <p class="work text-hidden">{{ item.work }}</p>
          </div>
        </div>
      </div>
    </template>
    <template v-else-if="style === 'light'">
      <div class="body">
        <img
          :src="avatar || '/images/default_avatar.png'"
          alt=""
          class="avatar"
        />
        <div class="icon-wrapper">
          <img
            v-if="!item.ppt"
            src="/images/icon_refresh_light.png"
            class="refresh"
            @click.stop="handleEmpty"
          />
          <img
            v-else-if="showDownloadButton"
            src="/images/icon_download_light.png"
            class="download"
            @click.stop="handleCache"
          />
        </div>
        <div class="content">
          <p class="guest text-hidden">{{ item.guestName }}</p>
          <p class="work text-hidden">{{ item.work }}</p>
        </div>
        <div class="content1" flex>
          <span class="time">{{ duration }}</span>
          <span class="name text-hidden" flex-box="1">
            {{ item.name }}
          </span>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import fs from 'fs-extra';
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
    // ...mapGetters(['style']),
    style() {
      return 'red';
    },
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
        return !this.cacheFile || this.cacheTimestamp !== this.item.timestamp;
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
      if (!this.item.ppt) {
        return;
      }
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
      const cacheFile = this.$lowdb.get(key).value();
      const isExist = fs.existsSync(cacheFile);
      console.log('文件：%s， 是否存在：%s', cacheFile, isExist);
      if (isExist) {
        this.cacheFile = cacheFile;
        const timestampKey = `cache-timestamp:${this.loginType}:${this.item.id}`;
        this.cacheTimestamp = this.$lowdb.get(timestampKey).value();
      }
    },
    handleEmpty() {},
  },
};
</script>

<style lang="less" scoped>
.sub-schedule-item {
  border-radius: 5px;
  // overflow: hidden;
  min-height: 172px;
  max-height: 172px;
  &:hover {
    transform: scale(1.014128728);
    transform-origin: center;
    transition: all 0.1s ease-in-out;
  }
  .download {
    width: 40px;
    height: 31px;
    cursor: pointer;
  }
  .refresh {
    width: 28px;
    height: 28px;
    cursor: default;
  }
  &.blue {
    border-radius: 5px;
    overflow: hidden;
    box-shadow: 0px 6px 14px 0px rgba(0, 0, 0, 0.2);
    &:hover {
      box-shadow: 0px 5px 6px 0px rgba(100, 100, 100, 0.5);
    }
    .header {
      height: 48px;
      padding: 8px 16px;
      color: #fff;
      font-size: 24px;
      font-family: OpenSans-SemiBold, OpenSans;
      font-weight: 600;
      line-height: 32px;
      background-color: #2a5fff;
    }
    .body {
      padding: 12px;
      background-color: #ffffff;
      height: 172px - 48px;
      .avatar {
        width: 94px;
        min-width: 94px;
        height: 94px;
        border-radius: 4px;
        background-color: #f5f5f5;
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
  }
  &.red {
    .body {
      min-height: 160px;
      max-height: 160px;
      border-left: 17px solid #f60f0f;
      padding-left: 11px;
      padding-top: 4px;
      background: #ffffff;
      box-shadow: 0px 4px 15px 0px rgba(0, 0, 0, 0.2);
      position: relative;
      .icon-wrapper {
        position: absolute;
        top: 19px;
        right: 10px;
      }
      .name {
        height: 44px;
        font-size: 20px;
        font-family: ArialMT;
        color: #333333;
        line-height: 32px;
      }
      .avatar {
        width: 94px;
        height: 94px;
        border-radius: 4px;
      }
      .content {
        margin-left: 14px;
        .time {
          height: 44px;
          font-size: 20px;
          font-family: ArialMT;
          color: #333333;
          line-height: 32px;
        }
        .guest {
          height: 31px;
          font-size: 24px;
          font-family: Arial-BoldMT, Arial;
          font-weight: normal;
          color: #333333;
          line-height: 28px;
          margin-top: 4px;
        }
        .work {
          height: 14px;
          font-size: 12px;
          font-family: ArialMT;
          color: #999999;
          line-height: 14px;
          margin-top: 5px;
        }
      }
    }
  }
  &.light {
    min-height: 165px;
    max-height: 165px;
    padding-top: 23px;
    .body {
      height: 142px;
      background: #ffffff;
      box-shadow: 0px 4px 15px 0px rgba(0, 0, 0, 0.2);
      position: relative;
      border-radius: 5px;
      .avatar {
        position: absolute;
        left: 24px;
        top: -23px;
        width: 94px;
        height: 94px;
        border-radius: 4px;
      }
      .icon-wrapper {
        position: absolute;
        top: 19px;
        right: 11px;
      }
      .content {
        padding-left: 146px;
        padding-top: 13px;
        .guest {
          font-size: 24px;
          font-family: Arial-BoldMT, Arial;
          font-weight: normal;
          color: #333333;
          line-height: 32px;
        }
        .work {
          margin-top: 8px;
          height: 20px;
          font-size: 16px;
          font-family: Arial-BoldMT, Arial;
          font-weight: normal;
          color: #333333;
        }
      }
      .content1 {
        margin-top: 20px;
        padding-left: 3px;
        height: 44px;
        font-size: 20px;
        font-family: Arial-BoldMT, Arial;
        font-weight: normal;
        color: #333333;
        line-height: 32px;
        .time {
          width: 144px;
          text-align: center;
        }
      }
    }
  }
}
</style>