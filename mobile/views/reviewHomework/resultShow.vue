<template >
  <div>
    <div
      class="results-show"
      v-if="
        (scoreInfo &&
          scoreInfo.grade !== null &&
          publishInfo &&
          publishInfo.gradePublish == 1 &&
          scoreInfo.isPublish == 1 &&
          user.role == 9) ||
        (user.role == 8 && scoreInfo && scoreInfo.grade !== null)
      "
    >
      <div
        :class="
          scoreInfo.flag == 2 || scoreInfo.status == 5 ? 'rewrite' : 'noRewrite'
        "
      ></div>
      <div class="scoreTitle">
        作业成绩
        <span
          class="findScoreInfo"
          @click="showScoreInfo"
          v-if="publishInfo.autoRemark == 2"
          >查看详情 <i class="van-icon van-icon-arrow"></i
        ></span>
      </div>
      <div
        :class="
          scoreInfo.rewrite || scoreInfo.status == 5
            ? 'rewriteResult result'
            : 'noRewriteResult result'
        "
      >
        <div class="score">
          <span class="myScore">{{ scoreInfo.grade }}</span> 分
        </div>
        <div class="fullMarks">满分：{{ scoreInfo.fullGrade }}</div>
        <div class="dashBox" v-if="scoreInfo.overallComment"></div>
        <div class="socreComments">
          <div
            class="myComments"
            v-html="scoreInfo.overallComment"
            v-if="scoreInfo.overallComment"
          ></div>
          <div
            class="more"
            v-if="scoreInfo.overallComment"
            @click="showMoreComment"
          >
            更多
          </div>
        </div>
        <div class="errorTag" v-if="scoreInfo.rewrite || scoreInfo.status == 5">
          需重写
        </div>
      </div>
    </div>
    <div
      class="results-show nopublish"
      v-if="
        user.role == 9 &&
        scoreInfo &&
        publishInfo &&
        (publishInfo.gradePublish == 0 ||
          (publishInfo.gradePublish == 1 && scoreInfo.isPublish == 0))
      "
    >
    <!-- role:9学生,有成绩，不公布成绩或者公布成绩时间未到-->
      <div class="nopushGrade"></div>
      <div class="scoreTitle">作业成绩</div>
      <div class="result">
        <div class="score">
          <span class="myScore" v-if="publishInfo.gradePublish == 0"
            >本次作业不公布成绩</span
          >
          <!-- 不公布成绩 -->
          <span
            class="myScore"
            v-if="publishInfo.gradePublish == 1 && scoreInfo.isPublish == 0"
            >成绩暂未公布</span
          >
          <!-- 公布成绩且公布时间未到 -->
        </div>
        <div
          class="fullMarks"
          v-if="publishInfo.gradePublish == 1 && scoreInfo.isPublish == 0"
        >
          公布时间：{{ publishInfo.gradePublishTime | formatDate }}
        </div>
        <div class="dashBox" v-if="scoreInfo.overallComment"></div>
        <div class="socreComments">
          <div
            class="myComments"
            v-html="scoreInfo.overallComment"
            v-if="scoreInfo.overallComment"
          ></div>
          <div
            class="more"
            v-if="scoreInfo.overallComment"
            @click="showMoreComment"
          >
            更多
          </div>
        </div>
        <div class="errorTag" v-if="scoreInfo.rewrite || scoreInfo.status == 5">
          需重写
        </div>
      </div>
    </div>
    <van-dialog
      v-model="showStuFillayScore"
      title="成绩详情"
      :show-confirm-button="false"
      class="rules"
      closeOnClickOverlay
      v-if="finalStuScore"
    >
      <div class="myScoreContent" ref="myScoreContent">
        <div ref="mytScoreContainer">
          <div class="scoreBox">
            <div class="score">
              我的得分：<span v-if="finalStuScore.finalScore != null">{{
                finalStuScore.finalScore
              }}</span>
              <span v-else>--</span>分
            </div>
            <div class="modified">
              组内互评得分：<span v-if="finalStuScore.withinScoreStr">{{
                finalStuScore.withinScoreStr
              }}</span>
              <span v-else>--</span>
            </div>
            <div class="modified">
              组间互评得分：<span v-if="finalStuScore.betweenScoreStr">{{
                finalStuScore.betweenScoreStr
              }}</span>
              <span v-else>--</span>
            </div>
            <div class="modified">
              评价任务扣分：-<span v-if="finalStuScore.deductScore != null">{{
                finalStuScore.deductScore
              }}</span>
              <span v-else>--</span>分
            </div>
            <div class="modified">
              教师评分：<span v-if="finalStuScore.teacherScore != null">{{
                finalStuScore.teacherScore
              }}</span>
              <span v-else>--</span>分
            </div>
            <div class="time">
              <span class="htitle">同学对本组作业的评价</span>
              <ul>
                <li
                  v-for="(item, index) in finalStuScore.betweenList"
                  :key="item.userId"
                >
                  <div class="name">同学{{ index + 1 }}</div>
                  <!-- {{item.userName}} -->
                  <div class="grad">
                    <!--  -->
                    <div class="showScore" v-if="item.grade != null">
                      {{ item.grade }}分
                    </div>
                    <div class="doScore" v-else>未评分</div>
                    <div
                      class="evaluation"
                      v-if="item.comment"
                      v-html="getHtml(item.comment)"
                    ></div>
                  </div>
                </li>
                <li>
                  <div class="name1">平均分</div>
                  <div class="grad">
                    <div class="doScore">
                      {{ finalStuScore.betweenAverage }}分
                    </div>
                  </div>
                </li>
              </ul>
            </div>
            <div class="time">
              <span class="htitle">组内成员对我的评价</span>
              <ul>
                <li
                  v-for="(item, index) in finalStuScore.withinList"
                  :key="item.userId"
                >
                  <div class="name">成员{{ index + 1 }}</div>
                  <!-- {{item.userName}} -->
                  <div class="grad">
                    <!--  -->
                    <div class="showScore" v-if="item.grade != null">
                      {{ item.grade }}分
                    </div>
                    <div class="doScore" v-else>未评分</div>
                    <div
                      class="evaluation"
                      v-if="item.comment"
                      v-html="getHtml(item.comment)"
                    >
                      <!-- 同学对本组作业的评价 -->
                    </div>
                  </div>
                </li>
                <li>
                  <div class="name1">平均分</div>
                  <div class="grad">
                    <div class="doScore">
                      {{ finalStuScore.withinAverage }}分
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div class="close" @click="closeStuScoreInfo">
        <span class="iconfont icon-guanbi1"></span>
      </div>
      <div class="tipsBox" v-show="myScoreScrollFlag">下滑显示更多</div>
    </van-dialog>
    <van-dialog
      v-model="showFillayScore"
      title="作业成绩详情"
      :show-confirm-button="false"
      class="rules"
      closeOnClickOverlay
      v-if="finalScore"
    >
      <div class="scoreInfoBox" ref="scoreInfoContent">
        <div ref="scoreInfoContainer">
          <div class="time">
            <span class="htitle">小组成员平均得分：</span>
            <span class="score">{{ finalScore.average }}</span>
          </div>
          <div
            class="scoreBox"
            v-for="item in finalScore.userScores"
            :key="item.userId"
          >
            <div class="name">{{ item.userName }}</div>
            <div class="score">个人最终得分：{{ item.finalScore }}分</div>
            <div class="modified">
              组内互评得分：
              <span v-if="item.withinScoreStr">{{ item.withinScoreStr }}</span
              ><span v-else>--</span>
            </div>
            <div class="modified">
              组间互评得分：<span v-if="item.betweenScoreStr">{{
                item.betweenScoreStr
              }}</span
              ><span v-else>--</span>
            </div>
            <div class="modified">
              评价任务扣分：-<span v-if="item.deductScore != null">{{
                item.deductScore
              }}</span
              ><span v-else>--</span>分
            </div>
            <div class="modified">
              教师评分：<span v-if="item.teacherScore != null">{{
                item.teacherScore
              }}</span
              ><span v-else>--</span>分
            </div>
          </div>
        </div>
      </div>
      <div class="close" @click="closeScoreInfo">
        <span class="iconfont icon-guanbi1"></span>
      </div>
      <div class="tipsBox" v-show="scrollFlag">下滑显示更多</div>
    </van-dialog>
    <van-dialog
      v-model="showComment"
      title="评语"
      :show-confirm-button="false"
      class="rules"
      closeOnClickOverlay
      v-if="scoreInfo"
    >
      <div class="scoreInfoBox" ref="commentContent">
        <div
          ref="commentContainer"
          v-html="getHtml(scoreInfo.overallComment)"
          class="comment"
        ></div>
      </div>
      <div class="close" @click="closeComment">
        <span class="iconfont icon-guanbi1"></span>
      </div>
      <div class="tipsBox" v-show="commentscrollFlag">下滑显示更多</div>
    </van-dialog>
  </div>
</template>
<script>
import { stuFinalScore, finalScore } from "@/api/homeworkApi";
import { mapGetters, mapActions } from "vuex";
import formatDateFilter from '@/mixins/formatDate.js'
export default {
  name: "resultShow",
  mixins:[formatDateFilter],
  props: [
    "scoreInfo",
    "publishInfo",
    "groupOrder",
  ],
  data() {
    return {
      showStuFillayScore: false,
      showFillayScore: false,
      finalStuScore: null,
      finalScore: null,
      scrollFlag: false,
      commentscrollFlag: false,
      scroll: "",
      commentscroll: "",
      myScoreScrollFlag: false,
      myScoreScroll: "",
      showComment: false,
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
    showScoreInfo() {
      if (this.user.role == 9) {
        this.getStuFillayScore();
      } else {
        this.getTeaFillayScore();
      }
    },
    getStuFillayScore() {
      stuFinalScore({
        ocId: this.ocId,
        homeworkId: this.homeworkId,
        groupOrder: this.groupOrder,
      })
        .then((res) => {
          this.finalStuScore = res.result;
          this.showStuFillayScore = true;
          this.$nextTick(() => {
            if (
              this.$refs.mytScoreContainer.clientHeight >
              this.$refs.myScoreContent.clientHeight
            ) {
              this.myScoreScrollFlag = true;
            }
            this.$refs["myScoreContent"].addEventListener(
              "scroll",
              this.hasmyScoreScroll
            );
            this.hasmyScoreScroll()
          });
        })
        .catch((res) => {
          console.log(res);
          this.$message({
            type: "error",
            message: res.message,
          });
        });
    },
    getTeaFillayScore() {
      finalScore({
        ocId: this.ocId,
        homeworkId: this.homeworkId,
        groupOrder: this.groupOrder,
      })
        .then((res) => {
          this.finalScore = res.result;
          this.showFillayScore = true;
          this.$nextTick(() => {
            console.log(
              this.$refs.scoreInfoContainer.clientHeight,
              this.$refs.scoreInfoContent.clientHeight
            );
            console.log(
              this.$refs.scoreInfoContainer.clientHeight >
                this.$refs.scoreInfoContent.clientHeight
            );
            if (
              this.$refs.scoreInfoContainer.clientHeight >
              this.$refs.scoreInfoContent.clientHeight
            ) {
              this.scrollFlag = true;
            }
            this.$refs["scoreInfoContent"].addEventListener(
              "scroll",
             this.hasScroll
            );
            this.hasScroll()
          });
        })
        .catch((res) => {
          console.log(res);
          this.$message({
            type: "error",
            message: res.message,
          });
        });
    },
    closeScoreInfo() {
      this.showFillayScore = false;
    },
    hasScroll() {
      this.scroll = this.$refs.scoreInfoContent.scrollTop;
      if (
        this.scroll + this.$refs.scoreInfoContent.clientHeight + 50 >
        this.$refs.scoreInfoContainer.clientHeight
      ) {
        this.scrollFlag = false;
      } else {
        this.scrollFlag = true;
      }
    },
    hasmyScoreScroll() {
      this.myScoreScroll = this.$refs.myScoreContent.scrollTop;
      if (
        this.myScoreScroll + this.$refs.myScoreContent.clientHeight + 50 >
        this.$refs.mytScoreContainer.clientHeight
      ) {
        this.myScoreScrollFlag = false;
      } else {
        this.myScoreScrollFlag = true;
      }
    },
    hascommentscroll() {
      this.commentscroll = this.$refs.commentContent.scrollTop;
      if (
        this.commentscroll + this.$refs.commentContent.clientHeight + 50 >
        this.$refs.commentContainer.clientHeight
      ) {
        this.commentscrollFlag = false;
      } else {
        this.commentscrollFlag = true;
      }
    },
    showMoreComment() {
      this.showComment = true;
      this.$nextTick(() => {
        if (
          this.$refs.commentContainer.clientHeight >
          this.$refs.commentContent.clientHeight
        ) {
          this.commentscrollFlag = true;
        }
        this.$refs["commentContent"].addEventListener(
          "scroll",
          this.hascommentscroll
        );
        this.hascommentscroll()
      });
    },
    closeComment() {
      this.showComment = false;
    },
    getHtml(string) {
      if (string) {
        return string.replace(/(\r\n|\n|\r)/gm, "<br />");
      } else {
        return "";
      }
    },
    closeStuScoreInfo() {
      this.showStuFillayScore = false;
    },
  },
};
</script>
<style lang="scss" scoped>
.results-show {
  padding-bottom: 16px;
  position: relative;
  z-index: 9;
  .scoreTitle {
    font-size: 16px;
    color: #ffffff;
    letter-spacing: 0;
    line-height: 20px;
    font-weight: 500;
    margin-top: -85px;
    padding: 0px 16px;
    position: relative;
    z-index: 9;
    .findScoreInfo {
      float: right;
      font-size: 12px;
      line-height: 18px;
      font-weight: 400;
      display: flex;
      align-items: center;
      .van-icon-arrow {
        margin-left: 6px;
      }
    }
  }
  .van-icon-arrow {
    color: #fff;
  }
  .result {
    position: relative;
    background: #ffffff;
    box-shadow: 0 2px 4px 0 rgba(150, 150, 150, 0.25);
    border-radius: 4px;
    padding: 10px 16px;
    margin: 10px 16px 0px 16px;
    min-height: 74px;
    z-index: 99;
    .score {
      font-size: 14px;
      color: #444444;
      letter-spacing: 0;
      line-height: 21px;
      font-weight: 400;
      text-align: center;
      .myScore {
        font-size: 24px;
        letter-spacing: 0;
        line-height: 24px;
        font-weight: 600;
      }
    }
    .fullMarks {
      font-size: 12px;
      color: #969696;
      letter-spacing: 0;
      text-align: center;
      line-height: 18px;
      font-weight: 400;
      text-align: center;
      padding: 4px 0px;
    }
    .dashBox {
      border-bottom: 1px dashed #e3e3e9;
    }
    .socreComments {
      min-height: 10px;
      padding-top: 8px;
      display: flex;
      align-items: center;
    }
    .myComments {
      font-size: 12px;
      color: #969696;
      letter-spacing: 0;
      line-height: 18px;
      font-weight: 400;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
    }
    .more {
      font-size: 12px;
      color: #8d77fb;
      letter-spacing: 0;
      line-height: 18px;
      font-weight: 400;
      margin-left: 4px;
    }
    .errorTag {
      font-size: 12px;
      color: #fb6868;
      line-height: 16px;
      font-weight: 400;
      padding: 3px 10px;
      background: #fff3f3;
      border: 1px solid #ffd8d8;
      border-radius: 2px;
      //width: 58px;
      position: absolute;
      top: 10px;
      right: 15px;
    }
  }
  .rewriteResult {
    .myScore {
      color: #f60000;
    }
  }
  .noRewriteResult {
    .myScore {
      color: #69d184;
    }
  }
}
.noRewrite {
  background-image: url("../../../../assets/images/successImg.jpg");
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  height: 100px;
}
.nopublish {
  .myScore {
    font-size: 14px !important;
    color: #f7b13d;
    letter-spacing: 0;
    text-align: center;
    line-height: 24px;
    font-weight: 600;
  }
  .fullMarks {
    color: #444444;
  }
}
.nopushGrade {
  background-image: url("../../../../assets/images/noPublish.png");
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  height: 100px;
}
.rewrite {
  background-image: url("../../../../assets/images/errorImg.jpg");
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  height: 100px;
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
</style>