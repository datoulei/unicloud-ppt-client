<template>
  <div class="header" flex="cross:center">
    <p flex-box="1" class="title">{{ screen.name }}</p>
    <img :src="screen.logo" alt="" class="logo" />
  </div>
</template>

<script>
import { mapState } from 'vuex';
export default {
  name: 'Header',
  computed: {
    ...mapState(['screen']),
  },
};
</script>

<style lang="less" scoped>
.header {
  height: 100%;
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
</style>