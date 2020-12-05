<template>
  <div class="page">
    <div class="header" flex="cross:center">
      <div class="m-l-26" flex-box="1">
        <p class="title">{{ screen.name }}</p>
      </div>
      <img :src="logo" alt="" class="logo" />
    </div>
    <div class="date" flex="cross:center">
      <a-icon
        type="clock-circle"
        :style="{ fontSize: '16px', color: '#B8B8B8' }"
      ></a-icon>
      <span class="m-l-8">{{ screen.date }}</span>
    </div>
    <div class="body">
      <a-list
        :dataSource="subSchedules"
        :grid="{ gutter: 16, column }"
        :split="false"
      >
        <a-list-item slot="renderItem" slot-scope="item">
          <SubScheduleItem :item="item" />
        </a-list-item>
      </a-list>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import SubScheduleItem from '@/components/SubScheduleItem';
export default {
  data() {
    return {
      loading: true,
    };
  },
  components: { SubScheduleItem },
  computed: {
    ...mapState(['screen', 'column']),
    ...mapState('mainSchedule', { mainSchedule: 'selected' }),
    ...mapState('subSchedule', ['subSchedules']),
    logo() {
      const loginType = this.$lowdb.get('loginType').value();
      if (loginType === 'internet') {
        return this.screen.logo;
      } else if (this.screen.logo && this.screen.logo !== '/images/logo.png') {
        const baseURL = this.$lowdb.get('baseURL').value();
        return `${baseURL}/${this.screen.logo}`;
      }
      return '/images/logo.png';
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
  },
};
</script>

<style lang="less" scoped>
.header {
  height: 100px;
  padding: 0 24px;
  background: #f5f5f5;
  .logo {
    width: 74px;
    height: 74px;
  }
  .title {
    font-size: 24px;
    font-family: PingFangTC-Semibold, PingFangTC;
    font-weight: 600;
    color: rgba(51, 51, 51, 1);
    line-height: 32px;
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
  font-size: 18px;
  font-weight: 600;
  color: #333333;
}
.body {
  padding: 22px 25px;
}
</style>