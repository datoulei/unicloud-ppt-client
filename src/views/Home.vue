<template>
  <div class="home">
    <div class="header" flex="cross:center">
      <p flex-box="1" class="title">{{ screen.displayName }}</p>
      <img :src="logo" class="logo" />
    </div>
    <div class="body">
      <MainSchedulePanel :date="date" :mainSchedules="list" />
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import MainSchedulePanel from '@/components/MainSchedulePanel';
let timer;
// @ is an alias to /src
export default {
  name: 'Home',
  components: {
    MainSchedulePanel,
  },
  data() {
    return {
      rowPerPage: 0,
      pages: 0,
      pageIndex: 0,
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
    list() {
      const start = this.column * this.rowPerPage * this.pageIndex;
      const end = start + this.column * this.rowPerPage;
      return this.mainSchedules.slice(start, end);
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
  beforeDestroy() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  },
  methods: {
    ...mapActions('mainSchedule', ['getMainSchedules']),
    generatePages() {
      if (timer) {
        clearInterval(timer);
        timer = null;
        this.pageIndex = 0;
        this.pages = 0;
        this.rowPerPage = 0;
      }
      console.log('构造分页数据');
      const height = window.innerHeight - 184;
      const margin = 16;
      console.log('generatePages -> height', height);
      if (this.column === 1) {
        // 1列
        const itemHeight = 58;
        this.rowPerPage = Math.floor(height / (itemHeight + margin));
        this.pages = Math.ceil(this.mainSchedules.length / this.rowPerPage);
        console.log('column1 generatePages -> rowPerPage', this.rowPerPage);
        console.log('column1 generatePages -> pages', this.pages);
      } else if (this.column === 2) {
        // 2列
        const itemHeight = 106;
        this.rowPerPage = Math.floor(height / (itemHeight + margin));
        this.pages = Math.ceil(
          this.mainSchedules.length / (this.rowPerPage * 2),
        );
        console.log('column2 generatePages -> rowPerPage', this.rowPerPage);
        console.log('column2 generatePages -> pages', this.pages);
      } else if (this.column === 3) {
        // 3列
        const itemHeight = 106;
        this.rowPerPage = Math.floor(height / (itemHeight + margin));
        this.pages = Math.ceil(
          this.mainSchedules.length / (this.rowPerPage * 3),
        );
        console.log('column3 generatePages -> rowPerPage', this.rowPerPage);
        console.log('column3 generatePages -> pages', this.pages);
      }
      console.log('设置定时器');
      timer = setInterval(() => {
        console.log('触发翻页逻辑，当前页数:', this.pageIndex);
        if (this.pageIndex < this.pages - 1) {
          this.pageIndex += 1;
        } else {
          this.pageIndex = 0;
        }
      }, 10 * 1000);
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