<template>
  <div class="header drag" flex="cross:center">
    <a-button-group class="m-l-14 no-drag">
      <a-button ghost size="small" icon="left" @click="handleBack" />
      <a-button ghost size="small" icon="right" @click="handleForward" />
    </a-button-group>
    <span flex-box="1" />
    <div class="action-bar m-l-16 p-l-16 no-drag" flex="cross:center">
      <a-icon type="minus" class="pointer" @click="handleMinimize" />
      <a-icon type="border" class="pointer m-l-8" @click="handleMaximize" />
      <a-icon type="close" class="pointer m-l-8" @click="handleQuit" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'Header',
  methods: {
    handleBack() {
      this.$router.go(-1);
    },
    handleForward() {
      this.$router.go(1);
    },
    handleMinimize() {
      this.$ipcRenderer.invoke('channel', { type: 'minimize' });
    },
    handleMaximize() {
      this.$ipcRenderer.invoke('channel', { type: 'maximize' });
    },
    handleQuit() {
      this.$ipcRenderer.invoke('channel', { type: 'quit' });
    },
  },
};
</script>

<style lang="less" scoped>
.header {
  height: 100%;
  color: #fff;
  .logo {
    height: 24px;
    cursor: move;
  }
  .action-bar {
    height: 16px;
    // border-left: 1px solid rgba(255, 255, 255, 0.35);
  }
  .mode {
    line-height: 2;
    -webkit-user-select: none;
  }
}
</style>