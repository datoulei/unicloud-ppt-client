<template>
  <div class="home">
    <div class="header" flex="cross:center">
      <p flex-box="1" class="title">{{ screen.name }}</p>
      <img src="/images/header_logo.png" class="logo" />
    </div>
    <div class="body">
      <template v-for="date in sortDates">
        <MainSchedulePanel
          :key="date"
          :date="date"
          :mainSchedules="group[date]"
        />
      </template>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import MainSchedulePanel from '@/components/MainSchedulePanel';
// @ is an alias to /src
export default {
  name: 'Home',
  components: {
    MainSchedulePanel,
  },
  computed: {
    ...mapState(['screen']),
    ...mapState('mainSchedule', ['mainSchedules']),
    group() {
      return this.$lodash.groupBy(this.mainSchedules, 'date');
    },
    sortDates() {
      return this.$lodash.sortBy(this.$lodash.keys(this.group));
    },
  },
  mounted() {
    this.getMainSchedules();
  },
  methods: {
    ...mapActions('mainSchedule', ['getMainSchedules']),
  },
};
</script>

<style lang="less" scoped>
.header {
  height: 100px;
  padding: 0 24px;
  background: #f5f5f5;
  .title {
    font-size: 24px;
    font-family: PingFangTC-Semibold, PingFangTC;
    font-weight: 600;
    color: rgba(51, 51, 51, 1);
    line-height: 32px;
  }
  .logo {
    width: 147px;
    height: 40px;
  }
}
.body {
  padding: 24px;
}
</style>