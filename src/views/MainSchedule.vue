<template>
  <div class="page">
    <div class="header" flex="cross:center">
      <img src="/images/icon_calendar.png" alt="" class="icon" />
      <div class="m-l-16">
        <p class="title">{{ mainSchedule.name }}</p>
        <p class="time m-t-8">{{ duration }}</p>
      </div>
    </div>
    <div class="body">
      <a-list
        class="m-t-16"
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
    ...mapState(['column']),
    ...mapState('mainSchedule', { mainSchedule: 'selected' }),
    ...mapState('subSchedule', ['subSchedules']),
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
  .icon {
    width: 48px;
    height: 48px;
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
.body {
  padding: 24px;
}
</style>