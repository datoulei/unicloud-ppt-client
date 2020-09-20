<template>
  <div class="home">
    <div class="header" flex="cross:center">
      <p flex-box="1" class="title">{{ screen.display_name }}</p>
      <img :src="logo" class="logo" />
    </div>
    <div class="body">
      <MainSchedulePanel :date="date" :mainSchedules="mainSchedules" />
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
  data() {
    return {
      pages: [],
      page: 1,
    };
  },
  computed: {
    ...mapState(['screen', 'column']),
    ...mapState('mainSchedule', ['mainSchedules']),
    date() {
      return this.$moment(this.screen.date).format('YYYY年MM月DD日');
    },
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
  },
  watch: {
    column: {
      handler: 'generatePages',
      immediate: true,
    },
  },
  mounted() {
    this.getMainSchedules();
  },
  methods: {
    ...mapActions('mainSchedule', ['getMainSchedules']),
    generatePages() {
      const height = window.innerHeight - 184;
      if (this.column === 1) {
        // 1列
        const itemHeight = 58;
      } else if (this.column === 2) {
        // 2列
        const itemHeight = 106;
      } else if (this.column === 3) {
        // 3列
        const itemHeight = 106;
      }
    },
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