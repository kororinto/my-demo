<template>
  <div id="app" class="app-starter">
    <!-- <keep-alive v-if="$route.meta.cache">
      <router-view />
    </keep-alive>
    <router-view v-if="!$route.meta.cache" /> -->
    <keep-alive :include="homeworkPageList"><router-view /></keep-alive>
  </div>
</template>

<script>
export default {
  name: 'app',
  data () {
    return {
      homeworkPageList: ['assignHomework',]
    }
  },
  created () {
  },
   directives: {
    focus: {
      // 指令的定义
      inserted(el) {
        el.focus();
      },
    },
  },
}
</script>
<style lang="scss" scoped>
</style>
