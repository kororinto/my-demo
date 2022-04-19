<template>
  <van-action-sheet
    v-model="model"
    :actions="actions"
    cancel-text="取消"
    :round="false"
    close-on-popstate
    close-on-click-action
    @select="onSelect"
    @cancel="onCancel"
    @click-overlay="onCancel"
  />
</template>
<script>
export default {
  name: "actionSheet",
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    actions: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  data() {
    return {
      model: false,
    };
  },
  watch: {
    show() {
      this.model = this.show;
    },
  },
  methods: {
    onSelect(item) {
      this.$emit("select", item);
    },
    onCancel() {
      this.$emit("cancel");
    },
  },
};
</script>
<style lang="scss" scoped>
</style>
<style>
  .van-action-sheet{
    min-height: auto;
  }
</style>