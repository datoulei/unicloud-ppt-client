<template>
  <a-layout>
    <!-- <a-layout-header id="layoutHeader">
      <Header />
    </a-layout-header> -->
    <a-layout-content>
      <router-view />
      <CustomFab />
    </a-layout-content>
  </a-layout>
</template>

<script>
// import Header from '@/components/common/Header';
import CustomFab from '@/components/common/CustomFab';
export default {
  components: {
    // Header,
    CustomFab,
  },
};
</script>

<style lang="less">
@header-height: 0px;
// @header-height: 100px;
.ant-layout-header {
  height: @header-height;
  padding: 0 24px;
  background: #f5f5f5;
  position: fixed;
  z-index: 1;
  width: 100%;
}
.ant-layout-content {
  margin-top: @header-height;
  // padding: 24px 32px;
  // min-height: calc(100vh - 48px);
  background-color: #fff;
}
</style>