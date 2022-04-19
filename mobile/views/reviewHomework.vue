<template>
  <div class="mb-page">
    <NavigationBar
      :title="
        user.role == 9 ? publishInfo.homeworkTitle : groupInfo.importGroupName
      "
      v-if="publishInfo && groupInfo && !loadding1"
    >
      <template v-slot:right v-if="user.role == 9">
        <div
          class="color-primary iconfont icon-zuoyexiangqing"
          @click="goHomeWorkInfo"
        ></div>
      </template>
    </NavigationBar>
    <div
      class="tips"
      v-if="
        (user.role == 9 && bannerType && (!scoreInfo || !scoreInfo.grade)) ||
        (user.role == 8 &&
          publishInfo &&
          (bannerType == 9 || bannerType == 11 || bannerType == 12) &&
          myGroupHomework &&
          myGroupHomework.status > 1 &&
          (!scoreInfo || !scoreInfo.grade) &&
          !loadding1)
      "
    >
      <span class="iconfont icon-zuoyexiangqing"></span>
      <span class="homeworkTime">{{ getBanner(bannerType) }}</span>
      <span
        class="time"
        v-if="
          bannerType == 7 ||
          bannerType == 8 ||
          (user.role == 9 && bannerType == 9)
        "
        >{{ currentDate | formatDate }}</span
      >
    </div>
    <div
      v-if="
        myGroupHomework &&
        [3,4,5,8].includes(myGroupHomework.status)&&(bannerType != 11 || bannerType != 12) &&!loadding1"
    >
    <!-- (myGroupHomework.status == 3 ||
          myGroupHomework.status == 4 ||
          myGroupHomework.status == 5 ||
          myGroupHomework.status == 8) && -->
    <!--myGroupHomework(提交的作业) status 3：学生互评已批阅 4：教师评分已批阅 5：需重写 8：已评分  bannerType 11 12表示作业被转成了师评(11:作业迟交，待教师评分。12：本组作业无人评价，待教师评分) -->
       <ResultShow  :scoreInfo="scoreInfo" :publishInfo="publishInfo" :groupOrder="groupOrder" v-if="scoreInfo&&publishInfo" />
    </div>
    <div
      class="listBox"
      v-if="publishInfo && publishInfo.autoRemark == 2 && !loadding1"
    >
      <div class="btnBox">
        <button
          @click="changeActive(1)"
          :class="active == 1 ? 'active' : ''"
        >
          <span>本组作业</span>
        </button>
        <button
          @click="changeActive(2)"
          :class="active == 2 ? 'active' : ''"
        >
          <span v-if="user.role == 8">互评详情</span>
          <span v-if="user.role == 9">评价任务</span>
        </button>
      </div>
    </div>
    <div
      :class="
        publishInfo && publishInfo.autoRemark == 2
          ? 'mb-body'
          : 'mb-body mb-body1'
      "
      v-if="!loadding1"
    >
      <div v-if="!loadding">
        <div v-if="active == 1">
         <GroupHomework :myGroupHomework="myGroupHomework" :publishInfo="publishInfo" :memberList="memberList" :discussionInfo="discussionInfo"  :groupOrder="groupOrder" :classIds="classIds" />
        </div>
        <div v-else>
         <MutualInfo :myGroupHomework="myGroupHomework" :publishInfo="publishInfo"  :betweenList="betweenList" :withinList="withinList"  :groupOrder="groupOrder" :classIds="classIds" :scoreInfo="scoreInfo" :bannerType="bannerType"/>
        </div>
        <div v-if="this.user.role == 8">
          <div
            class="mark"
            @click="doMark"
            v-if="
              myGroupHomework &&
              (myGroupHomework.status == 2 ||
                (myGroupHomework.status == 8 &&
                  (bannerType == 11 || bannerType == 12)))
            "
          >
          <!-- 作业已经提交，status:2作业待批阅，status:8已评分(且作业被转为了师评) -->
            评分
          </div>
          <div
            class="reMark"
            @click="reDoMark"
            v-if="
              (myGroupHomework && myGroupHomework.status == 3) ||
              (myGroupHomework && myGroupHomework.status == 4) ||
              (myGroupHomework &&
                myGroupHomework.status == 8 &&
                (bannerType != 11 || bannerType != 12)) ||
              (myGroupHomework && myGroupHomework.status == 5)
            "
          >
            重新评分
          </div>

          <div class="page" v-if="groupOrderList">
            <span
              :class="
                groupIndex == 1
                  ? 'iconfont icon-shangyige dart'
                  : 'iconfont icon-shangyige'
              "
              @click="preGroup"
            ></span>
            <span>{{ groupIndex }}/{{ groupOrderList.length }}</span>
            <span
              :class="
                groupIndex == groupOrderList.length
                  ? 'iconfont icon-xiayige dart'
                  : 'iconfont icon-xiayige'
              "
              @click="nextGroup"
            ></span>
          </div>
        </div>
        <div v-if="scoreForm && publishInfo">
          <van-dialog
            v-model="markShow"
            show-cancel-button
            class="doMark"
            @confirm="doSaveScore()"
            :before-close="onBeforeClose"
            confirmButtonText="确定"
          >
            <div>满分：{{ publishInfo.grade }}</div>
            <div class="settingBox">
              <div class="setting">
                <div class="switch">
                  <van-switch
                    v-model="scoreForm.unified"
                    active-color="#B4B4F6"
                    inactive-color="#DEDEDE"
                    :active-value="1"
                    :inactive-value="0"
                  />
                </div>
                <div class="font">
                  <div class="setFont" v-if="scoreForm.unified == 1">
                    统一打分
                  </div>
                  <div class="setFont" v-else>单独打分</div>
                  <van-field
                    type="number"
                    label=""
                    placeholder="输入分值"
                    v-if="scoreForm.unified == 1"
                    v-model="unifiedGrade"
                    @input="changeScore($event)"
                    @focus="scoreReviewFlag=false"
                    :class="unifiedInp ? 'error' : ''"
                  />
                </div>
              </div>
              <div class="errorScore" v-if="unifiedInp">请输入分数</div>
            </div>
            <div class="solidBox"></div>
            <ul class="rule-list">
              <li
                v-for="(item, index) in scoreForm.studentAndScore"
                :key="item.id"
              >
                <div class="liBox">
                  <label :class="index === errorIndex ? 'errorName' : ''">{{
                    item.userName
                  }}</label>
                  <van-field
                    type="number"
                    label=""
                    :class="index === errorIndex ? 'errorField' : ''"
                    :disabled="scoreForm.unified == 1"
                    v-model="item.grade"
                    @input="changePersonScore($event, index)"
                    @focus="scoreReviewFlag=false"
                  />
                  <span>分</span>
                </div>
                <div class="errorScore" v-if="index === errorIndex">
                  请输入分数
                </div>
              </li>
            </ul>
            <div class="solidBox"></div>
            <div class="avgGrad">
              小组平均分：<span>{{ getAvgScore() }}</span>
            </div>
            <div :class="contentError ? 'errorComments' : 'comments'">
              <van-field
                v-model="scoreForm.comment"
                rows="3"
                type="textarea"
                placeholder="请输入评语，非必填"
                @input="changecomment($event)"
              />
            </div>
            <div class="commentsError" v-if="contentError">
              评语不能超过1000字符
            </div>
            <div
              class="ckeckBox"
              v-if="publishInfo && publishInfo.autoRemark == 0"
            >
            <!-- 师评作业 -->
              <van-checkbox
                v-model="scoreForm.flag"
                shape="square"
                checked-color="#ea5947"
                :active-value="1"
                :inactive-value="0"
                >需重写</van-checkbox
              >
            </div>
            <div
              class="del"
              v-if="
                publishInfo &&
                publishInfo.autoRemark == 2 &&
                isRemark &&
                (bannerType != 11 || bannerType != 12)
              "
            >
            <!-- 互评的作业，重新打分的时候同时没有转为师评 -->
              *教师重新评分，则学生最终得分以教师评分为准
            </div>
          </van-dialog>
        </div>
      </div>
    </div>
    <div v-if="loadding || loadding1" class="loading">
      <van-loading color="#ea5947" />
    </div>
  </div>
</template>
<script>
import {
  stuInfo,
  teaReviewInfo,
  doReview,
  reviewGroup,
  peerReviewInfo,
  myPeerReview,
} from "@/api/homeworkApi";
import { formatDate } from "@/utils/index.js";
import ResultShow from "./reviewHomework/resultShow.vue"
import GroupHomework from "./reviewHomework/groupHomework.vue"
import MutualInfo from "./reviewHomework/mutualInfo.vue"
import { mapGetters, mapActions } from "vuex";
import formatDateFilter from '@/mixins/formatDate.js'
export default {
    name: "reviewHomework",
  mixins:[formatDateFilter],
  props: {
    classIds: {
      type: Array,
      default: function () {
        return [];
      },
    },
  },
  data() {
    return {
      markShow: false,
      checked: false,
      unifiedScore: true,
      active: 1,
      memberList: [],
      discussionInfo: null,
      myGroupHomework: null,
      scoreInfo: null,
      publishInfo: null,
      scoreForm: null,
      groupOrderList: [],
      groupIndex: 0,
      showFillayScore: false,
      showWithinScore: false,
      inputScoreFlag: false,
      withinList: null,
      betweenList: null,
      groupOrder: null,
      bannerType: 0,
      currentDate: 0,
      errorIndex: "",
      contentError: false,
      unifiedInp: false,
      unifiedGrade: "",
      loadding: false,
      loadding1: false,
      groupInfo: {},
      isRemark: false,
      showComment: false,
      isPublishing: false,
      scoreReviewFlag: false,
    };
  },
  created() {
    if (this.activityType == 12) {
      this.changeActive(2);
    }
    this.groupOrder = this.currentGroupOrder;
    this.getGroupInfo();
    this.getGroupList();
  },
  watch: {
    "scoreForm.unified"(value, oldValue) {
      if (this.unifiedInp) {
        this.unifiedInp = false;
        // this.unifiedCurrentGrade=this.unifiedGrade
      }
      if (oldValue == undefined && value == 1) {
        this.scoreForm.studentAndScore.forEach((item) => {
          item.grade = this.unifiedGrade;
          this.errorIndex = "";
        });
      }
      if (oldValue != undefined && value == 1) {
        this.unifiedGrade = "";
        this.scoreForm.studentAndScore.forEach((item) => {
          item.grade = this.unifiedGrade;
          this.errorIndex = "";
        });
      }
    },
  },
  beforeRouteEnter: (to, from, next) => {
    if (from.name == "peerhomework") {
      next((vm) => {
        vm.changeActive(2);
      });
    }
    next();
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
    activityType() {
      return this.$route.query.activityType > 0
        ? this.$route.query.activityType
        : 0;
    },
    currentGroupOrder() {
      return this.$route.query.currentGroupOrder;
    },
    ...mapGetters("user", { user: "user" }),
  },
  methods: {
    changeActive(value) {
      this.active = value;
      if (this.user.role == 8) {
        this.getPeerInfo();
      } else {
        this.getStuPeerInfo();
      }
      this.getGroupInfo();
    },
    doMark() {
      this.isRemark = false;
      this.reviewInfo();
      this.markShow = true;
    },
    reDoMark() {
      this.isRemark = true;
      this.reviewInfo();
      this.markShow = true;
    },
    reviewInfo() {
      teaReviewInfo({
        ocId: this.ocId,
        homeworkId: this.homeworkId,
        groupOrder: this.groupOrder,
      })
        .then((res) => {
          this.scoreForm = res.result;
          this.unifiedGrade = res.result.studentAndScore[0].grade
            ? res.result.studentAndScore[0].grade
            : "";
          this.scoreReviewFlag = true;
          this.$forceUpdate();
        })
        .catch((res) => {
          console.log(res);
          this.$message({
            type: "error",
            message: res.message,
          });
        });
    },
    preGroup() {
      if (this.groupIndex != 1) {
        this.groupIndex -= 1;
        this.groupOrder = this.groupOrderList[this.groupIndex - 1].groupOrder;
        this.changeActive(this.active);
      }
    },
    nextGroup() {
      if (this.groupIndex != this.groupOrderList.length) {
        this.groupIndex += 1;
        this.groupOrder = this.groupOrderList[this.groupIndex - 1].groupOrder;
        // this.getGroupInfo();
        this.changeActive(this.active);
      }
    },
    getGroupInfo() {
      this.loadding = true;
      stuInfo({
        ocId: this.ocId,
        homeworkId: this.homeworkId,
        groupOrder: this.groupOrder,
        roleId: this.user.role,
        //roleId:8,
      })
        .then((res) => {
          console.log(res);
          this.groupInfo = res.result.groupInfo;
          this.memberList = res.result.groupInfo || [];
          this.discussionInfo = res.result.discussInfo;
          this.myGroupHomework = res.result.myGroupHomework;
          this.scoreInfo = res.result.scoreInfo;
          this.publishInfo = res.result.publishInfo;
          this.bannerType = res.result.bannerType;
          if (this.bannerType == 7) {
            this.currentDate = this.publishInfo.endTime;
          } else if (this.bannerType == 8) {
            this.currentDate = this.publishInfo.endTime;
          } else if (this.bannerType == 9) {
            this.currentDate = this.publishInfo.peerReviewTime;
          }
          this.loadding = false;
        })
        .catch((res) => {
          console.log(res);
          this.loadding = false;
          this.$message({
            type: "error",
            message: res.message,
          });
        });
    },
    getAvgScore() {
      var avg = "";
      var arr1 = JSON.parse(JSON.stringify(this.scoreForm.studentAndScore));
      var arr = arr1.filter((item) => {
        return item.grade != "";
      });
      if (arr.length == 0) {
        avg = `-`;
      } else {
        var num = 0;
        arr.forEach((item) => {
          num += parseFloat(item.grade);
        });
        avg = num / arr.length;
        avg = this.GetRound(avg, 1);
      }
      return avg;
    },
    GetRound(num, len) {
      return Math.round(num * Math.pow(10, len)) / Math.pow(10, len);
    },
    getBanner(type) {
      if (this.user.role == 8) {
        switch (type) {
          case 9:
            return `学生互评中，互评结束可查看和修改成绩`;
            break;
          case 11:
            return `作业迟交，由教师评分`;
            break;
          case 12:
            return `互评已结束，作业无人评价，由教师评分`;
            break;
        }
      } else {
        switch (type) {
          case 1:
            return `作业未开始`;
            break;
          case 2:
            return `暂未分组，不能参与小组作业`;
            break;
          case 3:
            return `作业已提交，待教师评分`;
            break;
          case 4:
            return `作业已结束`;
            break;
          case 5:
            return `作业未开始`;
            break;
          case 6:
            return `暂未分组，不能参与小组作业`;
            break;
          case 7:
            return `作业提交中，截止时间：`;
            break;
          case 8:
            return `作业已提交，互评开始时间：`;
            break;
          case 9:
            return `作业互评中，截止时间：`;
            break;
          case 10:
            return `作业已结束`;
            break;
          case 11:
            return `互评已结束，作业迟交，请等待教师评分`;
            break;
          case 12:
            return `互评已结束，本组作业无人评价，请等待教师评分`;
            break;
        }
      }
    },
    changeScore(value) {
      if (!this.scoreReviewFlag) {
        if (value.indexOf(".") > 0) {
          value = value.slice(0, value.indexOf(".") + 2);
        }
        if (value > this.publishInfo.grade) {
          value = this.publishInfo.grade;
        } else if (value < 0) {
          value = 0;
        }
        if (value != "") {
          this.unifiedInp = false;
        }
      }
      this.unifiedGrade = value;
      this.scoreForm.studentAndScore.forEach((item) => {
        item.grade = value;
      });
     
    },
    changecomment(value) {
      if (value.length < 1000) {
        this.contentError = false;
      }
    },
    changePersonScore(value, index) {
      if (!this.scoreReviewFlag) {
        if (value.indexOf(".") > 0) {
        value = value.slice(0, value.indexOf(".") + 2);
      }
      if (value != "" && this.errorIndex == index) {
        this.errorIndex = "";
      }
      if (value > this.publishInfo.grade) {
        value = this.publishInfo.grade;
      } else if (value < 0) {
        value = 0;
      }
      }
      this.scoreForm.studentAndScore[index].grade = value;
    },
    onBeforeClose(action, done) {
      if (action == "confirm") {
        return done(false);
      } else {
        return done();
      }
    },
    doSaveScore() {
      if (this.isPublishing) {
        return;
      }
      var error = false;
      if (this.scoreForm.comment.length > 1000) {
        error = true;
        this.contentError = true;
      }
      if (this.scoreForm.unified == 1) {
        if (this.scoreForm.studentAndScore[0].grade == "") {
          this.unifiedInp = true;
          error = false;
          return false;
        }
      } else {
        for (var i = 0; i < this.scoreForm.studentAndScore.length; i++) {
          if (this.scoreForm.studentAndScore[i].grade == "") {
            this.errorIndex = i;
            error = true;
            return false;
          }
        }
      }
      if (!error) {
        if (this.scoreForm.flag == true) {
          this.scoreForm.flag = 1;
        } else {
          this.scoreForm.flag = 0;
        }
        this.scoreForm.comment = this.scoreForm.comment.replace(/↵/gm, "/n");
        this.isPublishing = true;
        doReview(this.scoreForm)
          .then((res) => {
            this.$message({
              type: "success",
              message: "评分成功",
            });
            this.markShow = false;
            this.isPublishing = false;
            this.getGroupInfo();
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
    getGroupList() {
      if (this.user.role == 8) {
        this.loadding1 = true;
        reviewGroup(
          {
            ocId: this.ocId,
            homeworkId: this.homeworkId,
            groupOrder: this.groupOrder,
            teacherId: this.classIds.length > 0 ? 0 : this.user.userId,
          },
          this.classIds
        )
          .then((res) => {
            this.loadding1 = false;
            this.groupOrderList = res.result;
            if (res.result.length != 0) {
              res.result.forEach((item, index) => {
                if (item.groupOrder == this.currentGroupOrder) {
                  this.groupIndex = index + 1;
                }
              });
            }
          })
          .catch((res) => {
            console.log(res);
            this.loadding1 = false;
            this.$message({
              type: "error",
              message: res.message,
            });
          });
      }
    },
    getPeerInfo() {
      this.loadding = true;
      peerReviewInfo({
        ocId: this.ocId,
        homeworkId: this.homeworkId,
        groupOrder: this.groupOrder,
      })
        .then((res) => {
          this.loadding = false;
          this.betweenList = res.result.betweenList;
          this.withinList = res.result.withinList;
          this.betweenAverage = res.result.betweenAverage;
        })
        .catch((res) => {
          this.loadding = false;
          console.log(res);
          this.$message({
            type: "error",
            message: res.message,
          });
        });
    },
    getStuPeerInfo() {
      myPeerReview({
        ocId: this.ocId,
        homeworkId: this.homeworkId,
      })
        .then((res) => {
          this.betweenList = res.result.betweenList;
          console.log(this.betweenList);
          this.withinList = res.result.withinList;
          this.betweenAverage = res.result.betweenAverage;
        })
        .catch((res) => {
          console.log(res);
          this.$message({
            type: "error",
            message: res.message,
          });
        });
    },
    goHomeWorkInfo() {
      this.$router.push({
        name: "publishInfo",
        query: {
          homeworkId: this.homeworkId,
          ocId: this.ocId,
          groupOrder: this.groupOrder,
        },
      });
    },
    getHtml(string) {
      if (string) {
        return string.replace(/(\r\n|\n|\r)/gm, "<br />");
      } else {
        return "";
      }
    },
  },
  components: {
    ResultShow,
    GroupHomework,
    MutualInfo
  },
};
</script>
<style lang="scss" scoped>
.mb-body1 {
  margin-top: -50px;
  padding-top: 50px;
}
.color-primary.iconfont {
  font-size: 18px;
}
.dart {
  color: #dedede;
}
.hTitle {
  font-size: 16px;
  color: #444444;
  letter-spacing: 0;
  line-height: 22.5px;
  font-weight: 500;
  padding-left: 10px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  .title {
    flex: 1;
  }
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
.hTitle1 {
  margin-bottom: 0px;
}
.page {
  height: 50px;
  background-color: #fff;
  position: fixed;
  bottom: 0px;
  width: 100%;
  font-size: 18px;
  color: #444;
  text-align: center;
  font-weight: 400;
  line-height: 50px;
  padding: 0 16px;
  .icon-shangyige {
    float: left;
    font-size: 23px;
  }
  .icon-xiayige {
    float: right;
    font-size: 23px;
  }
  .dart {
    color: #dedede;
  }
}
@supports (top: constant(safe-area-inset-top)) or
  (top: env(safe-area-inset-top)) {
  .page {
    bottom: constant(safe-area-inset-bottom) !important;
    bottom: env(safe-area-inset-bottom) !important;
  }
}
.mark {
  height: 50px;
  background-color: #ea5947;
  position: fixed;
  bottom: 50px;
  width: 100%;
  font-size: 18px;
  color: #ffffff;
  text-align: center;
  font-weight: 400;
  line-height: 50px;
}
.reMark {
  height: 50px;
  background-color: #fff;
  position: fixed;
  bottom: 50px;
  width: 100%;
  font-size: 18px;
  color: #ea5947;
  text-align: center;
  font-weight: 400;
  line-height: 50px;
  border-bottom: 1px solid #e3e3ea;
  border-top: 1px solid #e3e3ea;
}
@supports (top: constant(safe-area-inset-top)) or
  (top: env(safe-area-inset-top)) {
  .mark {
    bottom: calc(50px + constant(safe-area-inset-bottom)) !important;
    bottom: calc(50px + env(safe-area-inset-bottom)) !important;
  }
  .reMark {
    bottom: calc(50px + constant(safe-area-inset-bottom)) !important;
    bottom: calc(50px + env(safe-area-inset-bottom)) !important;
  }
}
.doMark {
  ::v-deep .van-dialog__content {
    padding: 16px;
    padding-bottom: 0px;
  }
  .settingBox {
    margin: 10px 0px;
    // padding-bottom: 10px;
    // border-bottom: 1px solid #e3e3e9;
    overflow: hidden;
    .errorScore {
      font-size: 14px;
      color: #f60000;
      letter-spacing: 0;
      line-height: 22px;
      font-weight: 400;
      float: right;
      margin-right: 10px;
    }
  }
  .solidBox {
    height: 1px;
    background-color: #e3e3e9;
    margin-left: -16px;
    margin-right: -16px;
  }
  .setting {
    display: flex;
    .font {
      flex: 1;
      display: flex;
      padding-top: 5px;
      .setFont {
        flex: 1;
        line-height: 32px;
        font-size: 15px;
        color: #444444;
        letter-spacing: 0;
        line-height: 22.5px;
        font-weight: 400;
        margin-left: 12px;
      }
    }
  }
}
.rule-list {
  font-size: 16px;
  max-height: 30vh;
  overflow-y: scroll;
  li {
    border-bottom: solid 1px #f1f3f7;
    overflow: hidden;
    .errorScore {
      font-size: 14px;
      color: #f60000;
      letter-spacing: 0;
      line-height: 22px;
      font-weight: 400;
      float: right;
      margin-right: 10px;
    }
  }
  .liBox {
    display: flex;
    align-items: center;
    line-height: 56px;

    label {
      flex: 1;
    }
    .van-field {
      width: 40px;
      padding: 0;
      margin-right: 8px;
      ::v-deep input {
        border: solid 1px #e3e3e9;
        border-radius: 4px;
        text-align: center;
      }
    }
    .errorName {
      color: #f60000;
    }
    .errorField {
      ::v-deep input {
        border: solid 1px #f60000;
      }
    }
  }
  ::v-deep .van-field__control:disabled {
    background-color: #eee;
  }
}
.font .van-field {
  width: 90px;
  padding: 0;
  margin-right: 8px;
  ::v-deep input {
    border: solid 1px #e3e3e9;
    border-radius: 4px;
    text-align: center;
  }
}
.font .error ::v-deep input {
  border: solid 1px #f60000;
}

.avgGrad {
  float: right;
  padding: 8px 0px;
}
.comments {
  border: 1px solid #e3e3e9;
  overflow: hidden;
  width: 100%;
  .van-cell {
    padding: 5px;
  }
}
.errorComments {
  border: 1px solid #f60000;
  overflow: hidden;
  width: 100%;
  .van-cell {
    padding: 5px;
  }
}
.commentsError {
  margin-top: 5px;
  font-size: 14px;
  color: #f60000;
  letter-spacing: 0;
  line-height: 22px;
  font-weight: 400;
}
.ckeckBox {
  margin: 10px 0px;
}
.del {
  margin-top: 5px;
  font-size: 14px;
  color: #969696;
  letter-spacing: 0;
  line-height: 22px;
  font-weight: 400;
}

.tips {
  padding: 9px 16px;
  background: #fff5db;
  display: flex;
  align-items: center;
  .iconfont {
    font-size: 18px;
    color: #db9e00;
    margin-right: 8px;
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
    color: #444;
    letter-spacing: 0;
    line-height: 21px;
    font-weight: 400;
  }
}
.listBox {
  .btnBox {
    display: flex;
    button {
      flex: 1;
      width: 50%;
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
    .active {
      color: #ea5947;
      span {
        border-bottom: 2px solid #ea5947;
        padding-bottom: 18px;
        position: relative;
      }
    }
  }
}
.number {
  font-size: 14px;
  color: #969696;
  letter-spacing: 0.78px;
  line-height: 21px;
  font-weight: 400;
}

.rules {
  font-size: 14px;
  color: #444444;
  letter-spacing: 0;
  line-height: 21px;
  font-weight: 400;
  .scoreInfoBox {
    max-height: 75vh;
    min-height: 50vh;
    overflow-y: scroll;
  }
  .memScoreContent {
    max-height: 75vh;
    min-height: 50vh;
    overflow-y: scroll;
  }
  .myScoreContent {
    max-height: 75vh;
    min-height: 50vh;
    overflow-y: scroll;
  }
  .commentContent {
    max-height: 75vh;
    min-height: 50vh;
    overflow-y: scroll;
  }
  .comment {
    padding: 10px;
  }
  .time {
    padding: 5px 16px;
    position: relative;
    .score {
      font-size: 15px;
      color: #69d184;
      letter-spacing: 0;
      line-height: 22.5px;
      font-weight: 400;
    }
    ul {
      margin: 0px -16px;
      margin-top: 5px;
      border-top: 1px solid #e3e3e9;
      border-bottom: 1px solid #e3e3e9;
      li {
        display: flex;
        padding: 10px 16px;
        border-bottom: 1px solid #e3e3e9;
        .name {
          flex: 1;
          font-size: 15px;
          color: #444444;
          letter-spacing: 0;
          line-height: 24px;
          font-weight: 400;
        }
        .name1 {
          flex: 1;
          font-size: 15px;
          color: #969696;
          letter-spacing: 0;
          line-height: 24px;
          font-weight: 400;
        }
        .grad {
          width: 50%;
          padding-left: 10px;
          .evaluation {
            font-size: 12px;
            color: #969696;
            letter-spacing: 0;
            line-height: 16px;
            font-weight: 400;
            padding-right: 8px;
          }
          .doScore {
            font-size: 15px;
            color: #969696;
            letter-spacing: 0;
            line-height: 24px;
            font-weight: 400;
          }
        }
      }
      li:last-child {
        border-bottom: none;
      }
    }
  }
  .time:last-child {
    padding-bottom: 16px;
  }
  .scoreBox {
    margin-top: 16px;
    padding: 16px;
    background-color: #f5f5f5;
    .name {
      font-size: 15px;
      color: #444444;
      letter-spacing: 0;
      line-height: 24px;
      font-weight: 600;
    }
    .score {
      font-size: 14px;
      color: #444444;
      letter-spacing: 0;
      line-height: 21px;
      font-weight: 600;
    }
    .modified {
      font-size: 14px;
      color: #969696;
      letter-spacing: 0;
      line-height: 21px;
      font-weight: 400;
    }
  }
  .scoreBox1 {
    margin-top: 5px;
    .modified {
      font-size: 14px;
      color: #969696;
      letter-spacing: 0;
      line-height: 21px;
      font-weight: 400;
    }
  }
  .memScoreBox {
    margin-top: 16px;
    padding: 16px;
    background-color: #f5f5f5;
    position: relative;
    margin-bottom: 3px;
    .memPerson {
      display: flex;
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
      width: 3px;
      height: 16px;
      background-color: #ea5947;
      position: absolute;
      top: 19px;
      left: 16px;
    }
    .normal {
      font-size: 14px;
      color: #444444;
      letter-spacing: 0;
      line-height: 21px;
      font-weight: 400;
    }
    .dart {
      font-size: 14px;
      color: #969696;
      letter-spacing: 0;
      line-height: 21px;
      font-weight: 400;
    }
    .comments {
      font-size: 14px;
      color: #444444;
      letter-spacing: 0;
      line-height: 21px;
      font-weight: 400;
      border: none;
    }
  }
  .htitle {
    font-size: 15px;
    color: #444444;
    letter-spacing: 0;
    line-height: 24px;
    font-weight: 400;
    padding-left: 7px;
  }
  .htitle::before {
    content: "";
    width: 3px;
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
</style>