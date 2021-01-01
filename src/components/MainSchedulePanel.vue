<template>
  <div class="main-schedule-panel">
    <div class="panel-header">
      <div :class="['date', style]" flex="cross:center">
        <a-icon
          type="clock-circle"
          :style="{ fontSize: '16px', color: '#B8B8B8' }"
        ></a-icon>
        <span class="m-l-8">{{ date }}</span>
      </div>
    </div>
    <a-list
      class="m-t-16"
      :dataSource="mainSchedules"
      :grid="{ gutter, column }"
      :split="false"
    >
      <a-list-item slot="renderItem" slot-scope="item">
        <MainScheduleItem :item="item" />
      </a-list-item>
    </a-list>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import MainScheduleItem from './MainScheduleItem.vue';
export default {
  props: {
    mainSchedules: {
      type: Array,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
  },
  components: {
    MainScheduleItem,
  },
  computed: {
    ...mapState(['column']),
    ...mapGetters(['style']),
    gutter() {
      if (this.column === 1) {
        return 30;
      } else {
        return 16;
      }
    },
  },
};
</script>

<style lang="less" scoped>
.date {
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
    border-color: #2267e5;
  }
  &.light {
    border-color: #222222;
  }
}
</style>