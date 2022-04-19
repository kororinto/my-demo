<template>
  <div class="mb-page">
    <NavigationBar title="作业详情"> </NavigationBar>
    <div class="mb-body">
      <div v-if="!loading && infoList">
        <div class="tips" v-if="tipTitle">
          <span class="iconfont icon-zuoyexiangqing"></span>
          <span class="homeworkTime" v-if="tipTitle">{{ tipTitle }}</span>
          <!-- <span class="time" v-if="date">{{ getLocalTime(date) }}</span> -->
        </div>
        <div class="info">
          <div class="title">
            {{ infoList.homeworkTitle }}
          </div>
          <div class="author">发布人：{{ infoList.teacherName }}</div>
          <div class="homeWork">
            <Richtext
              @onClose="onImageviewClose"
              @onOpen="onImageviewOpen"
              v-if="infoList.homeworkRequest"
              :content="infoList.homeworkRequest"
            ></Richtext>
          </div>
          <Filelist :mode="2" :files="infoList.fileList" v-if="infoList.fileList" />
        </div>
        <div class="setting">
          <div class="hTitle">作业设置</div>
          <div v-if="infoList.autoRemark == 0">
            <div>满分：{{ infoList.grade }}</div>
            <div>评分方式：{{ autoRemark(infoList.autoRemark) }}</div>
            <div>成绩是否公布：{{ gradePublish(infoList.gradePublish) }}</div>
          </div>
          <div v-if="infoList.autoRemark == 2">
            <div>满分：{{ infoList.grade }}</div>
            <div>评分方式：{{ autoRemark(infoList.autoRemark) }}</div>
            <div>每人评价作业份数：{{ infoList.peerReviewCount }}</div>
            <div>组内互评权重：{{ infoList.interClassWeight }}%</div>
            <div>组间互评权重：{{ infoList.interBlockWeight }}%</div>
            <div>成绩是否公布：{{ gradePublish(infoList.gradePublish) }}</div>
          </div>
          <div class="solidBox"></div>
          <div>
            <div>{{ infoList.startTime |formatDate }} 提交开始</div>
            <div>{{ infoList.endTime |formatDate }} 提交截止</div>
            <div v-if="infoList.autoRemark == 2">
              {{ infoList.peerReviewTime |formatDate }} 互评截止
            </div>
            <div v-if="infoList.gradePublish == 1">
              {{ infoList.gradePublishTime |formatDate }} 成绩公布
            </div>
          </div>
          <div
            class="doScore"
            @click="showRules"
            v-if="infoList.autoRemark == 2"
          >
            <div class="limit limit1 limitRule">
              <span class="iconfont icon-jieshiyiwen"></span>
              <span>互评规则说明</span>
            </div>
          </div>
        </div>
        <div class="classes" v-if="this.user.role == 8">
          <div class="hTitle">参与班级</div>
          <div v-for="item in infoList.classGroupList" :key="item.classId">
            {{ item.className }}
          </div>
        </div>
        <div class="memList" v-if="this.user.role == 9 && memberList&&((this.info&&this.info.publishInfo.homeworkStatus<3&&!isNogroup)||(isNogroup))">
          <div class="memHea">
            <div class="memtil">
              <span class="iconfont icon-xiaozu"></span>
              <span class="mem">小组成员</span>
              <span class="number" v-if="memberList.length != 0"
                >({{ memberList.length }}人)</span
              >
            </div>
          </div>
          <div v-if="memberList.length == 0" class="author">暂未分组</div>
          <div class="list" v-else>
            <ul>
              <li v-for="item in memberList" :key="item.userId">
                <div
                  class="portrait"
                  :style="{
                    backgroundImage:
                      'url(' + (item.userImg ? item.userImg : baseImg) + ')',
                    backgroundSize: 'cover',
                  }"
                ></div>
                <div class="name">{{ item.name }}</div>
              </li>
            </ul>
          </div>
          <div class="bgBox"></div>
        </div>
        <div class="btnList" v-if="user.role == 8">
          <button @click="deleteHomework" v-if="permissionGroupId == 1">
            删除作业
          </button>
          <button
            class="editBtn"
            @click="doassignHomework"
            v-if="this.seletTea == infoList.teacherId"
          >
            修改作业
          </button>
        </div>
        <van-dialog
          v-model="showRulesFlag"
          title="互评规则说明"
          :show-confirm-button="false"
          class="rules"
          closeOnClickOverlay
          confirmButtonText="确定"
        >
          <div class="rulesContent" ref="rulesContent">
            <div ref="rulesBox">
              <div class="state">
                <div>小组作业互评，包括<b>组内互评</b>和<b>组间互评</b>：</div>
                <div>
                  -<b>组内互评</b>，即学生评价同组其他成员在作业中的表现；
                </div>
                <div>-<b>组间互评</b>，即学生评价其他组的作业。</div>
              </div>
              <div class="time">
                <span class="htitle">互评时间与形式</span>
                <div>
                  <span>-学生互评在作业提交截止之后开始</span
                  ><span class="greyFont"
                    >（注意：如果提交的作业份数不足，作业将转为教师评分）</span
                  >
                </div>
                <div>
                  -未按时提交作业的小组，将不参与组间互评；在作业提交截止之后补交的作业，由教师评分。
                </div>
                <div>
                  -参与互评的学生，须在互评截止之前完成评价任务，否则将被扣除一定比例的分数。
                </div>
                <div>
                  -组内和组间互评，均采用匿名形式，即评价详情仅教师可见。
                </div>
              </div>
              <div class="work">
                <span class="htitle"> 评价任务分配 </span>
                <div>组内互评，学生须为同组其他所有成员打分。</div>
                <div>
                  组间互评，评价任务不跨班分配，学生只能评价本班其他小组的作业。系统从参与互评的小组中，随机为学生分配指定数量的作业。
                </div>
              </div>
              <div class="grad">
                <span class="htitle"> 成绩计算规则 </span>
                <div class="redFont">
                  <b>学生互评得分</b
                  >=组内互评平均得分*组内互评权重+组间互评平均得分*组间互评权重-互评任务未完成的扣分。
                </div>
                <div>
                  -互评任务扣分：学生未完成评价任务，组内互评每缺评一人，或组间互评每缺评一组，将从作业总分中扣除2%。累积扣分上限为20%，扣完为止。
                </div>
                <div>
                  -互评结束后，无人评价的作业，须由教师评分。教师也可以在学生互评得分基础上，重新评分。教师重新评分后，学生个人最终得分，将以教师评分为准。
                </div>
              </div>
            </div>
          </div>
          <div class="close" @click="closeRules">
            <span class="iconfont icon-guanbi1"></span>
          </div>
          <div class="tipsBox" v-show="scrollFlag">下滑显示更多</div>
        </van-dialog>
      </div>
      <div v-if="loading" class="loading">
        <van-loading color="#ea5947" />
      </div>
    </div>
  </div>
</template>
<script>
import { groupHomeworkDetail, groupInfoByOrder, stuInfo } from "@/api/homeworkApi";
import { deleteHomework, getCourseRoleInfo } from "@/api/courseApi";
import { mapGetters, mapActions } from "vuex";
import Filelist from "../components/FileList";
import Richtext from "../components/Richtext/richtext.vue";
import { exitApp, refreshCourseHomework } from "@/plugins/cordova/index.js";
import formatDateFilter from '@/mixins/formatDate.js'
export default {
  name: "publishInfo",
  mixins:[formatDateFilter],
  data() {
    return {
      infoList: null,
      showRulesFlag: false,
      baseImg: "https://courseweb.ulearning.cn/common/img/defaultHeaderLg.png",
      memberList: [],
      loading: false,
      tipTitle: "",
      scroll: "",
      permissionGroupId: "",
      seletTea: "",
      scrollFlag: false,
      info:null,
      isNogroup:false
    };
  },
  created() {
    getCourseRoleInfo(this.ocId).then((data) => {
      this.permissionGroupId = data.permissionGroupId;
      if (data.permissionGroupId != 1) {
         this.getStuInfo();
      } 
      setTimeout(()=>{
       this.getpublishInfo();
      })
      this.seletTea = data.userId ? data.userId : data.userID;
    });
  },
  methods: {
    getStuInfo() {
      stuInfo({
        ocId: this.ocId,
        homeworkId: this.homeworkId,
        groupOrder: this.groupOrder,
        roleId: 9,
      })
        .then((res) => {
          this.info=res.result
          if(!res.result.groupInfo || !res.result.groupInfo.groupOrder){
            this.isNogroup=true
          }
            if (res.result.publishInfo.homeworkStatus <3&&this.user.role == 9) {
              this.tipTitle = "作业未开始";
            }
             if ((!res.result.groupInfo || !res.result.groupInfo.groupOrder)&&this.user.role == 9&&res.result.publishInfo.homeworkStatus >2) {
              this.tipTitle = "暂未分组，不能参与小组作业";
            } 
        })
        .catch((res) => {
          this.$message({
            type: "error",
            message: res.result,
          });
        });
    },
    getpublishInfo() {
      this.loading = true;
      groupHomeworkDetail({
        ocId: this.ocId,
        homeworkId: this.homeworkId,
      })
        .then((res) => {
          this.infoList = res.result;
          if (this.user.role == 9&&this.info&&this.info.groupInfo&&this.info.groupInfo.groupOrder) {
              this.getGroupInfo();
          }
          this.loading = false;
        })
        .catch((res) => {
          this.loading = false;
          console.log(res);
          this.$message({
            type: "error",
            message: res.result,
          });
        });
    },
    onImageviewOpen() {
      console.log("open");
      this.postAppActivityParam({ operation: 3, attach: "1" });
    },
    onImageviewClose() {
      console.log("close");
      this.postAppActivityParam({ operation: 3, attach: "0" });
    },
    autoRemark(type) {
      if (type == 0) {
        return "教师批阅";
      } else if (type == 1) {
        return "自动批阅";
      } else {
        return "学生互评";
      }
    },
    gradePublish(type) {
      if (type == 0) {
        return "不公布";
      } else {
        return "公布";
      }
    },
    // getLocalTime(time) {
    //   if (!time) {
    //     return "";
    //   }
    //   var date = new Date(time);
    //   var Month = date.getMonth() + 1;
    //   var Day = date.getDate();
    //   var Hour = date.getHours();
    //   var Minutes = date.getMinutes();
    //   var Y = date.getFullYear() + "-";
    //   var M = Month < 10 ? "0" + Month + "-" : Month + "-";
    //   var D = Day < 10 ? "0" + Day + " " : Day + " ";
    //   var h = Hour < 10 ? "0" + Hour + ":" : Hour + ":";
    //   var m = Minutes < 10 ? "0" + Minutes : Minutes;
    //   return Y + M + D + h + m;
    // },
    doassignHomework() {
      this.$router.push({
        path: `/assignHomework?ocId=${this.ocId}&homeworkId=${this.homeworkId}`,
      });
    },
    showRules() {
      this.showRulesFlag = true;
      this.$nextTick(() => {
      this.$refs["rulesContent"].addEventListener("scroll",this.hasScroll);
       this.hasScroll()
      });
    },
    closeRules() {
      this.showRulesFlag = false;
    },
    onBackClick() {
      // if (this.$route.meta.isNoHistory) {
      exitApp();
      refreshCourseHomework();
      // } else {
      //   this.$router.back();
      // }
    },
    hasScroll() {
      this.scroll = this.$refs.rulesContent.scrollTop;
      if (
        this.scroll + this.$refs.rulesContent.clientHeight + 50 >
        this.$refs.rulesBox.clientHeight
      ) {
        this.scrollFlag = false;
      } else {
        this.scrollFlag = true;
      }
    },
    getGroupInfo() {
      this.loading = true;
      groupInfoByOrder({
        ocId: this.ocId,
        homeworkId: this.homeworkId,
        groupOrder: this.groupOrder,
      })
        .then((res) => {
          this.loading = false;
          this.memberList = res.result.userList;
        })
        .catch((res) => {
          this.loading = false;
          console.log(res);
          this.$message({
            type: "error",
            message: res.data,
          });
        });
    },
    deleteHomework() {
      this.$dialog
        .confirm({
          title: "提示",
          message: "作业删除后不可恢复，确定删除吗？",
          confirmButtonText: "确定",
        })
        .then(() => {
          // on confirm
          deleteHomework({
            homeworkId: this.homeworkId,
            ocId: this.ocId,
          })
            .then((res) => {
              this.$message({
                type: "success",
                message: "删除成功",
              });
              setTimeout(() => {
                this.onBackClick();
              }, 1000);
            })
            .catch((res) => {
              this.$message({
                type: "error",
                message: res.data,
              });
            });
        })
        .catch(() => {
          // on cancel
        });
    },
  },
  computed: {
    ocId() {
      return this.$route.query.ocId;
    },
    homeworkId() {
      return this.$route.query.homeworkId > 0
        ? this.$route.query.homeworkId
        : 0;
    },
    groupOrder() {
      return this.$route.query.groupOrder > 0
        ? this.$route.query.groupOrder
        : 0;
    },
    ...mapGetters("user", { user: "user" }),
  },
  components: {
    Richtext,
    Filelist,
  },
};
</script>
<style lang="scss" scoped>
.info {
  padding: 16px;
  background-color: #fff;
  .title {
    font-size: 18px;
    color: #444444;
    letter-spacing: 0;
    line-height: 24px;
    font-weight: 500;
  }
  .author {
    font-size: 15px;
    color: #969696;
    letter-spacing: 0;
    line-height: 22.5px;
    font-weight: 400;
    padding: 6px 0px;
  }
  .homeWork {
    font-size: 15px;
    color: #444444;
    letter-spacing: 0;
    line-height: 22.5px;
    font-weight: 400;
  }
}
.setting {
  margin: 16px 0px;
  padding: 16px;
  background-color: #fff;
  position: relative;
  font-size: 15px;
  color: #444444;
  letter-spacing: 0;
  line-height: 22.5px;
  font-weight: 400;
  .solidBox {
    width: 100%;
    height: 1px;
    border-bottom: 1px dashed #e3e3e9;
    margin: 16px 0px;
  }
}
.classes {
  margin: 16px 0px;
  padding: 16px;
  background-color: #fff;
  position: relative;
  font-size: 15px;
  color: #444444;
  letter-spacing: 0;
  line-height: 22.5px;
  font-weight: 400;
  margin-bottom: 70px;
}
.hTitle {
  font-size: 15px;
  color: #444444;
  letter-spacing: 0;
  line-height: 22.5px;
  font-weight: 500;
  padding-left: 6px;
  margin-bottom: 10px;
}
.hTitle::before {
  content: "";
  width: 3px;
  height: 18px;
  background-color: #ea5947;
  position: absolute;
  top: 18px;
  left: 16px;
}
.btnList {
  position: fixed;
  display: flex;
  width: 100%;
  bottom: 0px;
  border-top: 1px solid #e3e3e9;
  button {
    flex: 1;
    border: none;
    background-color: #fff;
    padding: 17px 0px;
    border-bottom: 1px solid #e3e3e9;
    font-size: 16px;
    color: #444444;
    letter-spacing: 0;
    line-height: 24px;
    font-weight: 500;
  }
  .editBtn {
    color: #ea5947;
    border-left: 1px solid #e3e3e9;
  }
}
@supports (top: constant(safe-area-inset-top)) or
  (top: env(safe-area-inset-top)) {
  .btnList {
    bottom: constant(safe-area-inset-bottom) !important;
    bottom: env(safe-area-inset-bottom) !important;
  }
}
.doScore {
  margin: 0px;
  display: flex;
  justify-content: space-between;
  height: 33px;
  line-height: 33px;
  background-color: #fff;
  align-items: center;
  p {
    margin: 0;
  }
  span {
    flex: 1;
    text-align: right;
    margin-right: 5px;
    color: #969696;
    font-size: 15px;
  }
  i {
    color: #969696;
  }
  .className {
    text-align: left;
    font-size: 16px;
    color: #444444;
    letter-spacing: 0;
    line-height: 24px;
    font-weight: 400;
  }
  .limit {
    font-size: 14px;
    color: #969696;
    letter-spacing: 0;
    line-height: 21px;
    font-weight: 400;
    padding: 0 16px;
    background-color: #fff;
    margin-top: -15px;
    padding-bottom: 15px;
  }
  .limit1 {
    padding: 0px;
    margin-top: 0px;
  }
  .limitRule {
    span {
      color: #b4b4f6 !important;
    }
  }
}
.rules {
  font-size: 14px;
  color: #444444;
  letter-spacing: 0;
  line-height: 21px;
  font-weight: 400;
  border-radius: 8px !important;
  .rulesContent {
    max-height: 75vh;
    overflow-y: scroll;
  }
  .state {
    background: #f5f5f5;
    padding: 10px 16px;
    margin-top: 10px;
  }
  .time {
    padding: 5px 16px;
    position: relative;
  }
  .work {
    padding: 5px 16px;
    position: relative;
  }
  .grad {
    padding: 5px 16px 16px;
    position: relative;
  }
  .htitle {
    font-size: 15px;
    color: #444444;
    letter-spacing: 0;
    line-height: 24px;
    font-weight: 600;
    padding-left: 7px;
  }
  .htitle::before {
    content: "";
    width: 2px;
    height: 16px;
    background-color: #ea5947;
    position: absolute;
    top: 9px;
    left: 16px;
  }
  .redFont {
    color: #ea5947;
  }
  .greyFont {
    color: #969696;
  }
  .close {
    position: absolute;
    top: 20px;
    right: 16px;
  }
  ::v-deep .van-dialog__header {
    font-size: 18px;
    color: #444444;
    letter-spacing: -0.17px;
    text-align: center;
    line-height: 27px;
    font-weight: 500;
  }
  .tipsBox {
    position: absolute;
    bottom: 0px;
    height: 52px;
    width: 100%;
    // background-image: linear-gradient(
    //   180deg,
    //   rgba(238, 238, 238, 0) 0%,
    //   #ffffff 36%
    // );
    border-radius: 0 0 8px 8px;
    line-height: 52px;
    text-align: center;
    font-size: 15px;
    color: #8d77fb;
    letter-spacing: 0;
    text-align: center;
    font-weight: 400;
    background-color: #fff;
  }
}
.memList {
  background-color: #fff;
  padding: 16px;
  overflow: hidden;
  position: relative;
  .memHea {
    display: flex;
    .memtil {
      flex: 1;
      .icon-xiaozu {
        font-size: 18px;
        color: #cbcbd1;
      }
      .mem {
        font-size: 16px;
        color: #444444;
        letter-spacing: 0;
        line-height: 24px;
        font-weight: 600;
        padding: 0 6px;
      }
    }
    .icon-zhankai {
      color: #ea5947;
      padding: 0px 8px;
      border: 1px solid #dedede;
      border-radius: 4px;
      line-height: 20px;
      height: 22px;
    }
  }
  .list {
    li {
      width: 50%;
      display: flex;
      margin-top: 10px;
      float: left;
    }
    .portrait {
      width: 32px;
      height: 32px;
      background-color: red;
      border-radius: 50%;
    }
    .name {
      flex: 1;
      line-height: 32px;
      font-size: 16px;
      color: #444444;
      letter-spacing: 0;
      margin-left: 8px;
      font-weight: 400;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  .bgBox {
    width: 100%;
    height: 24px;
    background-image: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0) 50%,
      #ffffff 82%
    );
    position: absolute;
    bottom: 0px;
    margin-left: -16px;
  }
}
.tips {
  padding: 9px 16px;
  background: #fff5db;
  display: flex;
  align-items: center;
  .iconfont {
    font-size: 18px;
    color: #db9e00;
    margin-right: 16px;
  }
  .homeworkTime {
    font-size: 14px;
    color: #c79100;
    letter-spacing: 0;
    line-height: 21px;
    font-weight: 400;
  }
  .time {
    font-size: 14px;
    color: #f60000;
    letter-spacing: 0;
    line-height: 21px;
    font-weight: 400;
  }
}
</style>
