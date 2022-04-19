<template>
<div class="messageBox" v-if="visible">
  <transition name="el-message-fade">
    <div
      :class="['message', type ? `message--${type}` : '']"
      :style="positionStyle"
    >
      <i :class="typeClass"></i>
      <slot>
        <span class="el-message__content">{{ message }}</span>
      </slot>
    </div>
  </transition>
  </div>
</template>

<script>
export default {
  data() {
    return {
      visible: true,
      message: "这是一条消息提示",
      type: "info",
      verticalOffset: 0,
      duration: 1000, //默认1s消失
    };
  },
  computed: {
    typeClass() {
      if (this.type == "success") {
        return `iconfont icon-chenggong`;
      } else if (this.type == "error") {
        return `iconfont icon-cuowu`;
      } else {
        return ``;
      }
      //return this.type ? `el-message__icon el-icon-${typeMap[this.type]}` : "";
    },
    positionStyle() {
      return {
        top: `${this.verticalOffset}px`,
      };
    },
  },
  methods: {
    close() {
      this.closed = true;
      this.visible = false;
      clearTimeout(this.timer)
    },
    startTimer() {
      // duration是3000
      if (this.duration > 0) {
        this.timer = setTimeout(() => {
          if (!this.closed) {
            this.close();
          }
        }, this.duration);
      }
    },
  },
  mounted() {
    this.startTimer();
  },
};
</script>
<style lang="scss" scoped>
.messageBox{
  position: absolute;
  top: 0px;
  bottom: 0px;
  width: 100%;
  height: 100%;
  z-index: 9999;
}
.message {
  width: 100%;
  border: 1px solid #ebeef5;
  // position: fixed;
  // left: 50%;
  // top: 0px;
  // transform: translateX(-50%);
  background-color: #edf2fc;
  transition: opacity 0.3s, transform 0.4s, top 0.4s;
 // overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  z-index: 9999;
  padding-top: 0px;
  padding: 13px 16px;
  .iconfont {
    font-size: 24px;
    margin-right: 14px;
  }
  span{
    max-height: none;
  }
}
@supports (top: constant(safe-area-inset-top)) or
  (top: env(safe-area-inset-top)) {
  .message {
    // height: 80px;
    // line-height: 95px;
    padding-top: calc(10px + constant(safe-area-inset-top)) !important;
    padding-top: calc(10px + env(safe-area-inset-top)) !important;
  }
}
.message--success {
  background: #f2f9ec;
  box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.1);
  color: #7fbf50;
}
.message--error {
  background: #fbf1f0;
  box-shadow: 0 2px 10px 0 rgba(234, 89, 71, 0.2);
  color: #e37470;
}
</style>
