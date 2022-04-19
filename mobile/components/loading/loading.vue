<template>
  <van-overlay :show="show">
    <div class="wrapper">
      <van-loading color="#ea5947" />
    </div>
  </van-overlay>
</template>
<script>
export default {
  props: {
    loadingShow: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      show: this.loadingShow,
    };
  },
};
</script>
<style lang="scss" scoped>
.wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>