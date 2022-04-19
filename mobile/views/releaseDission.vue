<template>
  <div class="mb-page">
    <NavigationBar title="写留言" :hasBack="3" :hasChange="hasChange" />
    <div class="mb-body">
      <div class="homework">
        <u-editor
          class="editor attribute-editor"
          :uContent="content"
          uPlaceholder="输入留言"
          :uId="id"
          :fileList.sync="uploadList"
          @update:fileList="accessoryList"
          uName="homework-editor"
          @onTextChange="onTextChange"
          ref="ck"
          v-if="flag"
        >
        </u-editor>
      </div>
      <div class="btn-publish">
        <button class="btn-primary" @click="doDission()">提交</button>
      </div>
    </div>
  </div>
</template>
<script>
import { saveDiscuss } from "@/api/homeworkApi";
import { exitApp } from "@/plugins/cordova/index.js";
import {  wordCount } from "@/utils/index.js";
import { buildPath } from "@/utils/file.js";
export default {
  props: ["discuss"],
  name: "releaseDission",
  data() {
    return {
      flag: false,
      content: "",
      id: "",
      uploadList: [], //附件
      turnTo: false,
      isPublishing:false,
    };
  },
  mounted() {
    if (this.discussId > 0) {
      this.content = this.discuss.filecontent;
       if (this.discuss.fileList) {
            this.uploadList = buildPath(this.discuss.fileList);
          } else {
            this.uploadList = [];
          }
      this.flag=true;
    }else{
      this.flag=true;
    }
  },
  computed: {
    hasChange() {
      return this.content != "" || this.uploadList.length != 0;
    },
    ocId() {
      return this.$route.query.ocId;
    },
    homeworkId() {
      return this.$route.query.homeworkId > 0
        ? this.$route.query.homeworkId
        : 0;
    },
    discussId() {
      return this.$route.query.discussId > 0
        ? this.$route.query.discussId
        : null;
    },
  },
  created() {
    if (this.discussId > 0) {
      console.log(123);
    }
  },
  methods: {
    accessoryList(val) {
      this.uploadList = val;
    },
    onTextChange: function (content) {
      this.content = content;
    },
    doDission() {
      var reg = /^(http|https)/;
      var arr = this.uploadList.every((item) => {
        return reg.test(item.filePath);
      });
       if (this.isPublishing) {
        return;
      }
      if(!arr){
         this.$message({
          type: "error",
          message: "附件上传中，请稍后再试！",
        })
         return false;
      }
      if (wordCount(this.content) <1) {
        this.$message({
          type: "error",
          message: "留言不能为空",
        });
        return false;
      }
      if (wordCount(this.content) > 2000) {
        this.$message({
          type: "error",
          message: "留言不能超过2000字符",
        });
        return false;
      }
      this.isPublishing=true
      saveDiscuss({
        acthomeworkId: this.homeworkId,
        filecontent: this.content,
        fileList: this.uploadList,
        discussId: this.discussId,
        ocId: this.ocId,
      })
        .then((res) => {
        
              this.$message({
                type: "success",
                message:this.discussId > 0?"修改成功":"提交成功",
              });
              this.isPublishing=false;
            this.turnTo = true;
            setTimeout(() => {
              this.onBackClick();
            }, 1000);
          
        })
        .catch((res) => {
          console.log(res);
          this.$message({
            type: "error",
            message: res.message,
          });
          this.isPublishing=false;
        });
    },
    onBackClick() {
      // if (this.$route.meta.isNoHistory) {
      //   exitApp();
      // } else {
        this.$router.back();
      // }
    },
  },
  //  beforeRouteLeave: function (to, from, next) {
  //   if (this.hasChange&&!this.turnTo) {
  //    setTimeout(()=>{
  //       this.$dialog
  //       .confirm({
  //         title: "提示",
  //         message: "留言未提交，确定离开吗？",
  //         confirmButtonText: "确定",
  //       })
  //       .then(() => {
  //         // on confirm
  //          this.content = '';
  //     this.uploadList = [];
  //         next();
  //       })
  //       .catch(() => {
  //         // on cancel
  //         next(false);
  //       });
  //    },100)
  //   } else {
  //     next();
  //   }
  // },
  components: {
    UEditor: () => import("../components/uEditor/uEditor.vue"),
  },
};
</script>
<style lang="scss" scoped>
.homework {
  background-color: #fff;
  padding: 0px 16px;
}
.btn-publish {
  width: 100%;
  padding: 20px 20px 20px;
  height: 44px;
  button {
    width: 100%;
  }
}
.btn-saveDrafts {
  width: 100%;
  padding: 0px 20px 40px;
  height: 44px;
  button {
    width: 100%;
  }
}
</style>