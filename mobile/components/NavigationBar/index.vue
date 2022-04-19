<template>
  <div class="mb-header">
    <div class="header-left" @click="back()">
      <slot name="left">
        <i class="iconfont icon-zuoye"></i>
      </slot>
    </div>
    <div class="header-title">
      <slot name="title">
        {{ title }}
      </slot>
    </div>
    <div class="header-right">
      <slot name="right"> </slot>
    </div>
  </div>
</template>

<script>
import { exitApp } from "@/plugins/cordova/index.js";
export default {
  name: "page-header",
  props: {
    hasBack:{
      default:'default'
    },
    title:{
      type:String,
      default:''
    },
    hasChange:{
      type:Boolean,
      default:false
    }
  },
  data() {
    return {};
  },
  methods: {
    back() {
      this.getBackType(this.hasBack,this.hasChange)
    },
    getBackType(type,hasChange) {
      const backMap = {
        1:()=> {
          this.$dialog
            .confirm({
              title: "提示",
              message: "确定放弃？",
              confirmButtonText: "确定",
            })
            .then(() => {
              this.doBack();
            })
            .catch(() => {
              // on cancel
              return false;
            });
        },
        2:()=> {
          if(hasChange){
             this.$dialog
            .confirm({
              title: "提示",
              message: "作业未保存，确定离开吗？",
              confirmButtonText: "确定",
            })
            .then(() => {
              // on confirm
              this.doBack();
            })
            .catch(() => {
              // on cancel
              return false;
            });
          }else{
            this.doBack();
          }
        },
        3:()=> {
          if(hasChange){
            this.$dialog
            .confirm({
              title: "提示",
              message: "留言未提交，确定离开吗？",
              confirmButtonText: "确定",
            })
            .then(() => {
              // on confirm
              this.doBack();
            })
            .catch(() => {
              // on cancel
              return false;
            });
          }else{
             this.doBack();
          }
         
        },
        default:()=>{
          this.doBack();
        }
      };
      console.log(backMap[type]);
      backMap[type].call(this)
    //  backMap[type]? backMap[type].call(this) :backMap['default'].call(this)
    },
    doBack() {
      console.log("zhsd");
      if (this.$route.meta.isNoHistory) {
        exitApp();
      } else {
        this.$router.back();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.mb-header {
  display: flex;
  position: relative;
  justify-content: space-between;
  align-items: center;
  height: 44px;
  padding: 0 16px;
  border-bottom: solid 1px #e3e3e9;
  background-color: #fff;
  .header-left,
  .header-right {
    display: flex;
    position: absolute;
    top: 0;
    bottom: 0;
    padding: 0 16px;
    align-items: center;
  }
  .header-left {
    left: 0;
    i {
      color: #9b9b9b;
      font-size: 18px;
    }
  }
  .header-right {
    right: 0;
  }
  .header-title {
    max-width: 60%;
    margin: 0 auto;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 18px;
    font-weight: bold;
  }
}
</style>