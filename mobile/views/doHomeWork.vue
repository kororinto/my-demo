<template>
  <div class="mb-page">
    <NavigationBar
      title="写作业"
      :hasBack="2"
      :hasChange="hasChange"
      ref="navigate"
    >
      <template v-slot:right>
        <div
          class="color-primary iconfont icon-zuoyexiangqing"
          @click="goHomeWorkInfo"
        ></div>
      </template>
    </NavigationBar>
    <div class="mb-body">
      <div class="homework" v-if="publishInfo && flag">
        <u-editor
          class="editor attribute-editor"
          :uContent="content"
          uPlaceholder="输入作业"
          :uId="id"
          :copyPaste="publishInfo.allowCopy"
          :puginFlag="publishInfo.allowPostAttach"
          :fileList.sync="uploadList"
          @update:fileList="accessoryList"
          uName="homework-editor"
          @onTextChange="onTextChange"
          ref="ck"
          v-if="flag"
        >
        </u-editor>
      </div>
      <div class="btnBgBox">
        <div
          class="btnBox"
          v-if="
            myGroupHomework == null ||
            (myGroupHomework && myGroupHomework.status == 1)
          "
        >
          <div class="btn-saveDrafts">
            <button class="btn-white" @click="doHomework(1)">保存草稿</button>
          </div>
          <div class="btn-publish">
            <button class="btn-primary" @click="doHomework(0)">提交</button>
          </div>
        </div>
        <div class="btn" v-else>
          <button class="btn-primary" @click="doHomework(0)">提交</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { stuSubmit, stuInfo, rewrite } from "@/api/homeworkApi";
import { exitApp, updateActiveList } from "@/plugins/cordova/index.js";
import { wordCount } from "@/utils/index.js";
import { buildPath } from "@/utils/file.js";
export default {
  name: "doHomeWork",
  data() {
    return {
      flag: false,
      content: "",
      id: "",
      uploadList: [], //附件
      myGroupHomework: null,
      publishInfo: null,
      trunTo: false,
      isPublishing: false,
    };
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
    groupOrder() {
      return this.$route.query.groupOrder;
    },
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      stuInfo({
        ocId: this.ocId,
        homeworkId: this.homeworkId,
        groupOrder: this.groupOrder,
        roleId: 9,
      })
        .then((res) => {
          console.log(res);
          this.myGroupHomework = res.result.myGroupHomework;
          this.publishInfo = res.result.publishInfo;
          if (this.myGroupHomework != null) {
            this.getPeerInfo();
          } else {
            this.flag = true;
          }
        })
        .catch((res) => {
          console.log(res);
          this.$message({
            type: "error",
            message: res.data,
          });
        });
    },
    accessoryList(val) {
      this.uploadList = val;
    },
    onTextChange: function (content) {
      this.content = content;
    },
    doHomework(type) {
      var reg = /^(http|https)/;
      var arr = this.uploadList.every((item) => {
        return reg.test(item.filePath);
      });
      if (this.isPublishing) {
        return;
      }
      if (!arr) {
        this.$message({
          type: "error",
          message: "附件上传中，请稍后再试！",
        });
        return false;
      }
      if (wordCount(this.content) < 1) {
        this.$message({
          type: "error",
          message: "作业内容不能为空",
        });
        return false;
      }
      if (wordCount(this.content) > 5000) {
        this.$message({
          type: "error",
          message: "作业内容不能超过5000字符",
        });
        return false;
      }
      var obj = {
        achomeworkId: this.homeworkId,
        content: this.content,
        fileList: this.uploadList,
        draft: type,
        groupOrder: this.groupOrder,
        ocId: this.ocId,
      };
      if (type == 0) {
        this.$dialog
          .confirm({
            // title: "提示",
            message: `每组作业由一人提交即可，请务必和其他成员沟通确认后提交。<br />确定提交吗？`,
            confirmButtonText: "确定",
            messageAlign: "left",
          })
          .then(() => {
            // on confirm
            this.isPublishing = true;
            if (this.myGroupHomework && this.myGroupHomework.status > 1) {
              rewrite(obj)
                .then((res) => {
                  if (res.code == 500) {
                    this.$message({
                      type: "error",
                      message: res.message,
                    });
                  } else {
                    this.$message({
                      type: "success",
                      message: "提交成功",
                    });
                    this.trunTo = true;
                    setTimeout(() => {
                      this.onBackClick();
                    }, 1000);
                  }
                  this.isPublishing = false;
                })
                .catch((res) => {
                  console.log(res);
                  this.$message({
                    type: "error",
                    message: res.message,
                  });
                  this.isPublishing = false;
                });
            } else {
              stuSubmit(obj)
                .then((res) => {
                  this.$message({
                    type: "success",
                    message: "提交成功",
                  });
                  this.isPublishing = false;
                  this.trunTo = true;
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
                  this.isPublishing = false;
                });
            }
          })
          .catch(() => {
            // on cancel
          });
      } else {
        stuSubmit(obj)
          .then((res) => {
            if (res.code == 500) {
              this.$message({
                type: "error",
                message: res.message,
              });
            } else {
              this.$message({
                type: "success",
                message: "保存成功",
              });
              this.isPublishing = false;
              this.trunTo = true;
              setTimeout(() => {
                this.onBackClick();
              }, 1000);
            }
          })
          .catch((res) => {
            console.log(res);
            this.$message({
              type: "error",
              message: res.message,
            });
            this.isPublishing = false;
          });
      }
    },
    getPeerInfo() {
      this.content = this.myGroupHomework.content;
       if (this.myGroupHomework.fileList) {
            this.uploadList = buildPath(this.myGroupHomework.fileList);
          } else {
            this.uploadList = [];
          }
    //  this.uploadList = this.myGroupHomework.fileList;
      this.flag = true;
    },
    goHomeWorkInfo() {
      var reg = /^(http|https)/;
      var arr = this.uploadList.every((item) => {
        return reg.test(item.filePath);
      });
      if (!arr) {
        this.$message({
          type: "error",
          message: "附件上传中，请稍后再试！",
        });
        return false;
      }
      if (this.hasChange) {
        this.$dialog
          .confirm({
            title: "提示",
            message: "作业未保存，确定离开吗？",
            confirmButtonText: "确定",
          })
          .then(() => {
            // on confirm
            this.$router.push({
              name: "publishInfo",
              query: {
                homeworkId: this.homeworkId,
                ocId: this.ocId,
                groupOrder: this.groupOrder,
              },
            });
          })
          .catch(() => {
            // on cancel
            return false;
          });
      } else {
        this.$router.push({
          name: "publishInfo",
          query: {
            homeworkId: this.homeworkId,
            ocId: this.ocId,
            groupOrder: this.groupOrder,
          },
        });
      }
    },
    onBackClick() {
      updateActiveList();
      if (this.$route.meta.isNoHistory) {
        exitApp();
      } else {
        this.$router.back();
      }
    },
  },
  // beforeRouteLeave: function (to, from, next) {
  //   if (this.hasChange&&!this.trunTo) {
  //    setTimeout(()=>{

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
.color-primary.iconfont {
  font-size: 18px;
}
.homework {
  background-color: #fff;
  padding: 0px 16px;
  margin-bottom: 90px;
}
.btn-publish {
  width: 100%;
 // padding: 20px 0px;
  height: 44px;
  line-height: 44px;
  button {
    width: 100%;
    background-image: linear-gradient(225deg, #f97652 0%, #ea5947 100%);
    border-radius: 6px;
    box-shadow: none;
  }
}
.btn {
  width: 100%;
  //padding: 20px 16px;
  height: 44px;
  line-height: 44px;
  button {
    width: 100%;
  }
}
.btn-saveDrafts {
  width: 100%;
 // padding: 20px 0px;
  height: 44px;
  line-height: 44px;
  padding-right: 15px;
  button {
    width: 100%;
    border: 1px solid #dedede;
  }
}
.btnBgBox {
  position: absolute;
  bottom: 0px;
  width: 100%;
  background-image: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.2) 0%,
    #ffffff 100%
  );
  .btnBox {
    display: flex;
    padding: 20px 16px;
  }
}
@supports (top: constant(safe-area-inset-top)) or
  (top: env(safe-area-inset-top)) {
  .btnBgBox {
    bottom: constant(safe-area-inset-bottom) !important;
    bottom: env(safe-area-inset-bottom) !important;
  }
}
</style>