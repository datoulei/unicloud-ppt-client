<template>
  <div
    :class="['main-schedule-item', `column-${column}`]"
    @click="handleDetail"
  >
    <div :class="['header', style]">
      <span class="time">{{ item.startTime }}</span>
    </div>
    <div ref="container" class="body">
      <span ref="text" :class="['name', scroll && 'animate']">
        {{ item.name }}
      </span>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex';
export default {
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      scroll: false,
    };
  },
  computed: {
    ...mapState(['column']),
    ...mapGetters(['style']),
  },
  watch: {
    column() {
      const container = this.$refs.container;
      const text = this.$refs.text;
      if (container.clientWidth < text.scrollWidth) {
        this.scroll = true;
      } else {
        this.scroll = false;
      }
    },
  },
  mounted() {
    const container = this.$refs.container;
    const text = this.$refs.text;
    if (container.clientWidth < text.scrollWidth) {
      this.scroll = true;
    } else {
      this.scroll = false;
    }
  },
  methods: {
    ...mapActions('mainSchedule', ['selectMainSchedule']),
    handleDetail() {
      this.selectMainSchedule(this.item);
      this.$router.push({
        name: 'MainSchedule',
        params: { id: this.item.id },
      });
    },
  },
};
</script>

<style lang="less" scoped>
.main-schedule-item {
  background: rgba(245, 245, 245, 1);
  border: 1px solid rgba(229, 229, 229, 1);
  cursor: pointer;
  .header {
    text-align: center;
    &.red {
      background-color: #f60f0f;
    }
    &.blue {
      background-color: #2267e5;
    }
    &.light {
      background-color: #fff;
      box-shadow: 0px 2px 12px 0px rgba(0, 0, 0, 0.2);
      .time {
        color: #333;
      }
    }
  }
  .body {
    padding: 12px 24px;
    overflow: hidden;
    position: relative;
  }
  .time {
    font-size: 24px;
    font-family: OpenSans-SemiBold, OpenSans;
    font-weight: 600;
    color: rgba(255, 255, 255, 1);
  }
  .name {
    font-size: 20px;
    font-family: PingFangTC-Semibold, PingFangTC;
    font-weight: 600;
    color: rgba(51, 51, 51, 1);
    line-height: 32px;
    white-space: nowrap;
    display: inline-block;
    &.animate {
      animation: scrollText 10s linear infinite;
    }
  }
  &.column-1 {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    .header {
      width: 125px;
      height: 56px;
      line-height: 56px;
    }
  }
  &.column-2,
  &.column-3 {
    .header {
      height: 48px;
      line-height: 48px;
    }
  }
}
</style>

<style lang="less">
@keyframes scrollText {
  0% {
    margin-left: 0;
  }
  100% {
    margin-left: -100%;
  }
}
</style>