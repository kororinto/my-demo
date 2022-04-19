<template>
  <div>
    <div
      class="noSubmit"
      v-if="
        publishInfo &&
        (publishInfo.homeworkStatus == 5 || publishInfo.homeworkStatus == 6) &&
        (!myGroupHomework ||
          !myGroupHomework.content ||
          (myGroupHomework && myGroupHomework.status == 1))
      "
    >
      未提交作业，不参与互评
    </div>
    <div
      class="markInfo"
      v-else-if="publishInfo && publishInfo.homeworkStatus < 5"
    >
      <div>1.互评将在作业提交截止之后开始。</div>
      <div>
        2.未按时提交作业，本组作业不能参与组间互评，补交的作业将由教师评分。
      </div>
      <div>
        3.在互评阶段，如果未完成评价任务，每个任务将从总分中扣除2%，累积扣除分数不超过20%。
      </div>
    </div>
    <div
      v-else-if="
        myGroupHomework &&
        (myGroupHomework.status == 7 ||
          myGroupHomework.status == 3 ||
          myGroupHomework.status == 5 ||
          myGroupHomework.status == 8 ||
          bannerType == 12 ||
          bannerType == 11 ||
          (myGroupHomework.status == 2 && bannerType == null))
      "
      class="peerScoreBox"
    >
      <div v-if="user.role == 8">
        <div class="mutual">
          <div class="hTitle">
            组间互评
            <div class="infoTips" v-if="betweenList && betweenList.length != 0">
              其他学生对本组作业的评价
            </div>
            <div class="infoTips" v-else>作业迟交，不参与组间互评</div>
          </div>
          <div class="mutualList" v-if="betweenList">
            <ul class="groupList">
              <li>
                <div class="Tbody">评价人</div>
                <div class="Tbody">评分</div>
              </li>
              <li v-for="item in betweenList" :key="item.userId">
                <div class="name">{{ item.userName }}</div>
                <div class="showgrad">
                  <div class="score" v-if="item.grade != null">
                    {{ item.grade }}
                  </div>
                  <div class="noScore" v-else>未评分</div>
                  <div
                    class="evaluation"
                    v-if="item.comment"
                    v-html="getHtml(item.comment)"
                  ></div>
                </div>
              </li>
              <li>
                <div class="name">平均分</div>
                <div class="showgrad">
                  <div class="score" v-if="betweenAverage != null">
                    {{ betweenAverage }}
                  </div>
                  <div class="noScore" v-else>--</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div class="within" v-if="withinList && withinList.length != 0">
          <div class="hTitle">
            组内互评
            <span class="info" @click="showWithInfo">
              详情
              <i class="van-icon van-icon-arrow"></i>
            </span>
          </div>
          <div class="withList">
            <ul class="groupList">
              <li>
                <div class="Tbody">成员</div>
                <div class="Tbody">平均得分</div>
              </li>
              <li v-for="item in withinList" :key="item.userId">
                <div class="name">{{ item.userName }}</div>
                <div class="grad">
                  <div class="score" v-if="item.average != null">
                    {{ item.average }}
                  </div>
                  <div class="noScore" v-else>-</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div v-if="user.role == 9">
        <div class="mutual" v-if="betweenList">
          <div class="hTitle">
            组间互评

            <div class="infoTips" v-if="betweenList.length != 0">
              评价其它小组的作业，评价为匿名，仅教师可见
            </div>
            <div class="infoTips" v-if="scoreInfo.late">
              作业迟交，不参与组间互评
            </div>
          </div>
          <div class="mutualList">
            <ul class="groupList">
              <li v-for="(item, index) in betweenList" :key="item.evaluationId">
                <div class="name">{{ `作业${index + 1}` }}</div>
                <div
                  class="grad"
                  v-if="publishInfo && publishInfo.homeworkStatus == 6"
                  @click="goPeerHomework(item, index + 1, 0)"
                >
                  <div class="flexBox">
                    <div
                      class="score flexContainer"
                      v-if="item.grade != null"
                    >
                      {{ item.grade }}
                    </div>
                    <div class="noScore flexContainer" v-else >未评分</div>
                    <i class="van-icon van-icon-arrow noScore"></i>
                  </div>
                  <div
                    class="evaluation"
                    v-if="item.comment"
                    v-html="getHtml(item.comment)"
                  ></div>
                </div>
                <div
                  class="grad1"
                  v-if="publishInfo && publishInfo.homeworkStatus == 5"
                  @click="goPeerHomework(item, index + 1, 1)"
                >
                  <div class="score" v-if="item.grade != null">
                    {{ item.grade }}
                  </div>
                  <div class="doScore" v-else>评分</div>
                  <i class="van-icon van-icon-arrow"></i>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div class="within" v-if="withinList && withinList.length != 0">
          <div class="hTitle">
            组内互评
            <div class="infoTips">
              评价本组其他成员在本次作业中的表现，评价为匿名，仅教师可见。
            </div>
          </div>
          <div class="withList">
            <ul class="groupList">
              <li v-for="item in withinList" :key="item.userId">
                <div class="name1">{{ item.userName }}</div>
                <div
                  class="grad"
                  v-if="publishInfo && publishInfo.homeworkStatus == 6"
                >
                  <div class="score" v-if="item.grade != null">
                    {{ item.grade }}
                  </div>
                  <div class="noScore" v-else>-</div>
                  <div
                    class="evaluation"
                    v-if="item.comment"
                    v-html="getHtml(item.comment)"
                  ></div>
                </div>
                <div class="grad1" v-else @click="doWithnScore(item)">
                  <div class="score" v-if="item.grade != null">
                    {{ item.grade }}
                  </div>
                  <div
                    class="doScore"
                    v-if="
                      publishInfo &&
                      publishInfo.homeworkStatus == 5 &&
                      item.grade == null
                    "
                  >
                    评分
                  </div>
                  <!-- <span class="iconfont icon-youye"></span> -->
                  <i class="van-icon van-icon-arrow"></i>
                  <!-- <div class="evaluation">
                          {{item.comment}}
                        </div> -->
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <van-dialog
      v-model="showWithinScore"
      title="组内互评详情"
      :show-confirm-button="false"
      class="rules"
      closeOnClickOverlay
    >
      <div class="memScoreContent" ref="memScoreContent">
        <div ref="memScoreContainer">
          <div
            class="memScoreBox"
            v-for="item1 in withinList"
            :key="item1.userId+item1.studentId"
          >
            <div class="htitle">{{ item1.userName }}</div>
            <div
              class="memPerson"
              v-for="item in item1.peerInfo"
              :key="item.id"
            >
              <span class="normal">{{ item.userName }}：</span>
              <div>
                <span class="dart" v-if="item.grade != null">{{
                  item.grade
                }}</span>
                <span class="dart" v-else>未评分</span>
                <div
                  class="comments"
                  v-if="item.comment"
                  v-html="getHtml(item.comment)"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="close" @click="closeWithnInfo">
        <span class="iconfont icon-guanbi1"></span>
      </div>
      <div class="tipsBox" v-show="scrollFlag">下滑显示更多</div>
    </van-dialog>
    <van-dialog
          v-if="withnMements && publishInfo"
          v-model="inputScoreFlag"
          :title="withnMements.userName"
          show-cancel-button
          class="rules"
          closeOnClickOverlay
          @confirm="peerGroup"
          confirmButtonText="确定"
          :before-close="onBeforeClose"
        >
          <div class="iptscoreBox">
            <div class="inputScore">
              <div>
                <van-field
                  type="number"
                  label=""
                  placeholder="输入评分"
                  v-model="withnMements.grade"
                  @input="changeWithnScore($event)"
                />
              </div>
              <div class="fontScore">分</div>
              <div class="fullScore">满分：{{ publishInfo.grade }}</div>
            </div>
            <div class="commentsBox">
              <van-field
                rows="3"
                type="textarea"
                v-model="withnMements.comment"
                placeholder="请输入评语，非必填"
                @input="changecomment1($event)"
              />
            </div>
            <div class="commentsError" v-if="content1Error">
              评语不能超过1000字符
            </div>
          </div>
        </van-dialog>  
  </div>
</template>
<script>
import {
  peerWithinGroup,
} from "@/api/homeworkApi";
import { mapGetters, mapActions } from "vuex";
export default {
  props: [
    "myGroupHomework",
    "publishInfo",
    "betweenList",
    "withinList",
    "groupOrder",
    "classIds",
    "scoreInfo",
    "bannerType"
  ],
  data() {
    return {
      showWithinScore: false,
      scrollFlag: false,
      scroll: "",
      withnMements:null,
      inputScoreFlag:false,
      isPublishing:false,
      content1Error: false,
    };
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
    ...mapGetters("user", { user: "user" }),
  },
  methods: {
    showWithInfo() {
      this.showWithinScore = true;
      this.$nextTick(() => {
        if (
          this.$refs.memScoreContainer.clientHeight >
          this.$refs.memScoreContent.clientHeight
        ) {
          this.scrollFlag = true;
        }
        this.$refs["memScoreContent"].addEventListener(
          "scroll",
          this.hasScroll
        );
        this.hasScroll()
      });
    },
    closeWithnInfo() {
      this.showWithinScore = false;
    },
    hasScroll() {
      this.scroll = this.$refs.memScoreContent.scrollTop;
      if (
        this.scroll + this.$refs.memScoreContent.clientHeight + 50 >
        this.$refs.memScoreContainer.clientHeight
      ) {
        this.scrollFlag = false;
      } else {
        this.scrollFlag = true;
      }
    },
     doWithnScore(item, type) {
      this.withnMements = JSON.parse(JSON.stringify(item));
      this.inputScoreFlag = true;
    },
     peerGroup() {
      if (this.isPublishing) {
        return;
      }
      if (this.withnMements.comment.length > 1000) {
        this.content1Error = true;
      }
      if (this.withnMements.grade == "") {
        this.$message({
          type: "error",
          message: "请输入评分",
        });
        return false;
      }
      if (!this.content1Error) {
        this.withnMements.comment = this.withnMements.comment.replace(
          /↵/gm,
          "/n"
        );
        this.isPublishing = true;
        peerWithinGroup({
          ocId: this.ocId,
          homeworkId: this.homeworkId,
          groupOrder: this.groupOrder,
          withinList: [this.withnMements],
        })
          .then((res) => {
            this.$message({
              type: "success",
              message: "评分成功",
            });
            this.isPublishing = false;
            this.$parent.getStuPeerInfo();
            setTimeout(() => {
                  this.inputScoreFlag = false;
            }, 100);
          })
          .catch((res) => {
            console.log(res);
            this.inputScoreFlag = false;
            this.$message({
              type: "error",
              message: res.message,
            });
            this.isPublishing = false;
          });
      }
    },
      onBeforeClose(action, done) {
      if (action == "confirm") {
        return done(false);
      } else {
        return done();
      }
    },
        changecomment1(value) {
      if (value.length < 1000) {
        this.content1Error = false;
      }
    },
    changeWithnScore(value) {
      if (value.indexOf(".") > 0) {
        value = value.slice(0, value.indexOf(".") + 0);
      }
      if (value > this.publishInfo.grade) {
        value = this.publishInfo.grade;
      } else if (value < 0) {
        value = 0;
      }
      this.withnMements.grade = value;
    },
     goPeerHomework(item, index, type) {
      this.$router.push({
        name: "peerhomework",
        query: {
          homeworkId: this.homeworkId,
          ocId: this.ocId,
          groupOrder: item.groupOrder,
          homeworkIndex: index,
          type: type,
        },
        params: {
          gradeList: item,
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
};
</script>
<style lang="scss" scoped>
.peerScoreBox {
  .noScore {
    color: #969696;
  }
}
.flexBox{
    display: flex;
    .flexContainer{
        flex:1;
    }
}
.mutual {
  margin-bottom: 16px;
  padding: 16px 16px 0px;
  position: relative;
  font-size: 15px;
  color: #444444;
  letter-spacing: 0;
  line-height: 22.5px;
  font-weight: 400;
  background-color: #fff;
  .hTitle {
    display: unset;
  }
  .infoTips {
    font-size: 12px;
    color: #969696;
    letter-spacing: 0;
    line-height: 18px;
    font-weight: 400;
    margin: 4px 0px 5px;
  }
  .info {
    float: right;
    font-size: 14px;
    color: #969696;
    letter-spacing: 0;
    text-align: right;
    line-height: 21px;
    font-weight: 400;
    display: flex;
    align-items: center;
  }
  .mutualList {
    border-top: 1px solid #e3e3e9;
    margin-top: 14px;
  }
}
.within {
  margin: 16px 0px 120px;
  padding: 16px 16px 0px;
  position: relative;
  font-size: 15px;
  color: #444444;
  letter-spacing: 0;
  line-height: 22.5px;
  font-weight: 400;
  background-color: #fff;
  .infoTips {
    font-size: 12px;
    color: #969696;
    letter-spacing: 0;
    line-height: 18px;
    font-weight: 400;
    margin: 4px 0px 0px;
  }
  .hTitle {
    display: unset;
  }
  .info {
    float: right;
    font-size: 14px;
    color: #969696;
    letter-spacing: 0;
    text-align: right;
    line-height: 21px;
    font-weight: 400;
    display: flex;
    align-items: center;
    .icon-youye {
      font-size: 14px;
    }
  }
  .withList {
    margin-top: 14px;
  }
  .groupList {
    border-top: 1px solid #e3e3e9;
    .Tbody {
      width: 50%;
      font-size: 15px;
      color: #969696;
      letter-spacing: 0;
      line-height: 16px;
      font-weight: 600;
      padding-left: 10px;
    }
    .name1 {
      flex: 1;
      padding-left: 10px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    .grad {
      // width: 40%;
      padding-left: 15px;
    }
  }
}
.groupList {
  font-size: 15px;
  color: #444444;
  letter-spacing: 0;
  line-height: 22.5px;
  font-weight: 400;
  .Tbody {
    width: 50%;
    padding-left: 10px;
    font-size: 15px;
    color: #969696;
    letter-spacing: 0;
    line-height: 16px;
    font-weight: 600;
  }
  li {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 1px solid #f1f3f7;
    padding: 15px 0px;
    .name {
      width: 50%;
      padding-left: 10px;
    }
    .grad {
      width: 50%;
      // display: flex;
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
        color: #ea5947;
        letter-spacing: 0;
        line-height: 22.5px;
        font-weight: 400;
      }
    }
    .showgrad {
      width: 50%;
      padding-left: 10px;
      // display: flex;
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
        color: #ea5947;
        letter-spacing: 0;
        line-height: 22.5px;
        font-weight: 400;
      }
    }
    .grad1 {
      display: flex;
      align-items: center;
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
        color: #ea5947;
        letter-spacing: 0;
        line-height: 22.5px;
        font-weight: 400;
      }
    }
  }
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
      flex: 1;
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
.noSubmit {
  font-size: 15px;
  color: #969696;
  letter-spacing: 0;
  line-height: 400px;
  font-weight: 400;
  text-align: center;
}
.markInfo {
  font-size: 15px;
  color: #444444;
  letter-spacing: 0;
  line-height: 22.5px;
  font-weight: 400;
  padding: 16px;
  background-color: #fff;
}
.iptscoreBox {
  padding: 16px;
  .inputScore {
    display: flex;
    align-items: center;
    .fullScore {
      flex: 1;
      font-size: 15px;
      color: #969696;
      letter-spacing: 0;
      line-height: 22.5px;
      font-weight: 400;
    }
    .fontScore {
      font-size: 15px;
      color: #444444;
      letter-spacing: 0;
      line-height: 22.5px;
      font-weight: 400;
      margin: 0px 18px 0px 10px;
    }
    .van-field {
      width: 90px;
      padding: 5px 0px;
      margin-right: 8px;
      background-color: #f1f3f7;
      ::v-deep input {
        border-radius: 4px;
        text-align: center;
      }
    }
  }
  .commentsBox {
    margin-top: 16px;
    ::v-deep .van-field {
      background-color: #f1f3f7;
      border-radius: 2px;
    }
  }
}
</style>