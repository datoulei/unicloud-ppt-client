<template>
  <div
    :class="['main-schedule-item', `column-${column}`]"
    @click="handleDetail"
  >
    <div :class="['header', style]">
      <span class="time">{{ item.startTime }} - {{ item.endTime }}</span>
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
    item() {
      this.calculateScroll();
    },
    column() {
      this.calculateScroll();
    },
  },
  mounted() {
    this.calculateScroll();
  },
  methods: {
    ...mapActions('mainSchedule', ['selectMainSchedule']),
    calculateScroll() {
      this.$nextTick(() => {
        const container = this.$refs.container;
        const text = this.$refs.text;
        if (container.clientWidth < text.scrollWidth) {
          this.scroll = true;
        } else {
          this.scroll = false;
        }
      });
    },
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
  background: #fff;
  // border: 1px solid #e5e5e5;

  box-shadow: 0px 5px 10px 0px rgba(102, 102, 102, 0.1);

  cursor: pointer;
  border-radius: 5px;
  overflow: hidden;
  &:hover {
    transform: scale(1.038897893);
    transform-origin: center;
    transition: all 0.1s ease-in-out;

    box-shadow: 0px 5px 6px 0px rgba(0, 0, 0, 0.2);

    box-shadow: 0px 5px 6px 0px rgba(0, 0, 0, 0.1);
  }
  .header {
    text-align: center;
    &.red {
      background-color: #f60f0f;
    }
    &.blue {
      background-color: #2a5fff;
    }
    &.light {
      background-color: #838383;
      .time {
        color: #fff;
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
      min-width: 190px;
      padding: 0 12px;
      height: 104px;
      line-height: 104px;
    }
    .body {
      line-height: 80px;
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