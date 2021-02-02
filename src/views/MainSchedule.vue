<template>
  <div class="page">
    <div class="header" flex="cross:center">
      <p class="title">{{ screen.displayName }}</p>
      <span flex-box="1"> </span>
      <img v-show="logo" :src="logo" alt="" class="logo" />
    </div>
    <div :class="['date', style]" flex="cross:center">
      <a-icon
        type="clock-circle"
        :style="{ fontSize: '16px', color: '#B8B8B8' }"
      ></a-icon>
      <span class="m-l-8">{{
        $moment(screen.date).format('YYYY年MM月DD日')
      }}</span>
    </div>
    <div class="body">
      <a-list
        :dataSource="subSchedules"
        :grid="{ gutter: 16, column }"
        :split="false"
      >
        <a-list-item slot="renderItem" slot-scope="item">
          <SubScheduleItem
            :item="item"
            @open-cache="handleOpenCache"
            @preview="handlePreview"
          />
        </a-list-item>
      </a-list>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';
import SubScheduleItem from '@/components/SubScheduleItem';
export default {
  data() {
    return {
      loading: true,
      lock: false,
    };
  },
  components: { SubScheduleItem },
  computed: {
    ...mapState(['screen', 'column']),
    ...mapState('mainSchedule', { mainSchedule: 'selected' }),
    ...mapState('subSchedule', ['subSchedules']),
    ...mapGetters(['style']),
    logo() {
      const loginType = this.$lowdb.get('loginType').value();
      if (loginType === 'internet') {
        return this.screen.logo;
      } else if (this.screen.logo && this.screen.logo !== '/images/logo.png') {
        const baseURL = this.$lowdb.get('baseURL').value();
        return `${baseURL}/${this.screen.logo}`;
      }
      return null;
    },
    duration() {
      const startTime = this.$moment(this.mainSchedule.startDate).format(
        'HH:mm',
      );
      const endTime = this.$moment(this.mainSchedule.endDate).format('HH:mm');
      return `${startTime}-${endTime}`;
    },
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    ...mapActions('subSchedule', ['getSubSchedules']),
    async fetchData() {
      this.loading = true;
      try {
        await this.getSubSchedules();
      } catch (error) {}
      this.loading = false;
    },
    handleOpenCache(data) {
      if (this.lock) return;
      this.$ipcRenderer.invoke('channel', {
        type: 'openCacheFile',
        data,
      });
      this.lock = true;
      setTimeout(() => {
        this.lock = false;
      }, 10 * 1000);
    },
    handlePreview(data) {
      if (this.lock) return;
      this.$ipcRenderer.invoke('channel', {
        type: 'preview',
        data,
      });
      this.lock = true;
      setTimeout(() => {
        this.lock = false;
      }, 10 * 1000);
    },
  },
};
</script>

<style lang="less" scoped>
.header {
  height: 122px;
  padding: 0 24px;
  background: #f5f5f5;
  .logo {
    width: 160px;
    min-width: 160px;
    max-width: 160px;
    height: 80px;
    margin-right: 28px;
  }
  .title {
    font-size: 24px;
    font-family: PingFangTC-Semibold, PingFangTC;
    font-weight: 600;
    color: rgba(51, 51, 51, 1);
    line-height: 32px;
    max-width: 1000px;
    line-clamp: 3;
    max-height: 96px;
    white-space: pre-wrap;
    overflow: hidden;
    -webkit-line-clamp: 3;
  }

  .time {
    font-size: 16px;
    font-family: PingFangTC-Regular, PingFangTC;
    font-weight: 400;
    color: rgba(153, 153, 153, 1);
    line-height: 22px;
  }
}
.date {
  margin-top: 26px;
  margin-left: 26px;
  width: 220px;
  height: 44px;
  background: rgba(255, 255, 255, 1);
  box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.1);
  border-left: 3px solid transparent;
  padding-left: 13px;
  font-size: 18px;
  color: #333;
  font-family: PingFangTC-Semibold, PingFangTC;
  font-weight: 600;
  border-radius: 2px;
  overflow: hidden;
  &.red {
    border-color: #f60f0f;
  }
  &.blue {
    border-color: #2a5fff;
  }
  &.light {
    border-color: #838383;
  }
}
.body {
  padding: 22px 25px;
}
</style>