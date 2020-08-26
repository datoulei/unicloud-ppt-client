<template>
  <div class="sub-schedule-item">
    <div class="header" flex></div>
    <div class="body"></div>
  </div>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  computed: {
    duration() {
      const startTime = this.$moment(this.item.startDate).format('HH:mm');
      const endTime = this.$moment(this.item.endDate).format('HH:mm');
      return `${startTime}-${endTime}`;
    },
  },
};
</script>

<style lang="less" scoped>
</style>