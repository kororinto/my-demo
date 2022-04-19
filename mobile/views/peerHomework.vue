<template>
  <div class="mb-page">
    <NavigationBar title="评价作业" />
    <div class="mb-body">
      <div class="homeworkBox">
        <div class="homeworkTitle">
          <span class="iconfont icon-zuoye1"></span>
          <span v-if="homeworkIndex">作业{{ homeworkIndex }}</span>
        </div>
        <div class="homeworkInfo" v-if="myGroupHomework">
          <Richtext
            @onClose="onImageviewClose"
            @onOpen="onImageviewOpen"
            v-if="myGroupHomework.content"
            :content="myGroupHomework.content"
          ></Richtext>
        </div>
        <Filelist
          :mode="2"
          v-if="myGroupHomework"
          :files="myGroupHomework.fileList"
          class="fileList"
        />
      </div>
      <div class="evaluationBox" v-if="gradeList && publishInfo && type == 1">
        <div class="evaluation">
          <div class="inputScore">
            <span class="ipt">评分:</span>
            <van-field
              type="number"
              label=""
              placeholder="输入评分"
              v-model="gradeList.grade"
              @input="changeScore($event)"
            />
            <span>分</span>
            <span class="score">满分：{{ publishInfo.grade }}</span>
          </div>
          <div class="comments">
            <van-field
              rows="3"
              type="textarea"
              v-model="gradeList.comment"
              placeholder="请输入评语，非必填"
            />
          </div>
          <div class="commentsError" v-if="contentError">
            评语不能超过1000字符
          </div>
          <div class="submitBtn" @click="peerBet">提交</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { peerBetweenGroup, stuInfo } from "@/api/homeworkApi";
import Filelist from "../components/FileList";
import Richtext from "../components/Richtext/richtext.vue";
export default {
  props: ["gradeList"],
  data() {
    return {
      myGroupHomework: null,
      publishInfo: null,
      contentError: false,
      isPublishing: false,
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
    groupOrder() {
      return this.$route.query.groupOrder;
    },
    homeworkIndex() {
      return this.$route.query.homeworkIndex;
    },
    type() {
      return this.$route.query.type;
    },
  },
  created() {
    this.getGroupInfo();
  },
  methods: {
    getGroupInfo() {
      stuInfo({
        ocId: this.ocId,
        homeworkId: this.homeworkId,
        groupOrder: this.groupOrder,
        roleId: 9,
      })
        .then((res) => {
          this.myGroupHomework = res.result.myGroupHomework;
          this.publishInfo = res.result.publishInfo;
        })
        .catch((res) => {
          console.log(res);
          this.$message({
            type: "error",
            message: res.data,
          });
        });
    },
    changeScore(value) {
      if (value.indexOf(".") > 0) {
        value = value.slice(0, value.indexOf(".") + 0);
      }
      if (value > this.publishInfo.grade) {
        value = this.publishInfo.grade;
      } else if (value < 0) {
        value = 0;
      }
      this.gradeList.grade = value;
    },
    peerBet() {
      if (this.isPublishing) {
        return;
      }
      if (this.gradeList.comment.length > 1000) {
        this.contentError = true;
      }
      if (this.gradeList.grade == "") {
        this.$message({
          type: "error",
          message: "请输入评分",
        });
        return false;
      }
      if (!this.contentError) {
        this.gradeList.comment = this.gradeList.comment.replace(/↵/gm, "/n");
        this.isPublishing = true;
        peerBetweenGroup({
          ocId: this.ocId,
          homeworkId: this.homeworkId,
          groupOrder: this.groupOrder,
          betweenList: [this.gradeList],
        })
          .then((res) => {
            this.$message({
              type: "success",
              message: "评分成功",
            });
            this.isPublishing = false;
            setTimeout(() => {
              this.onBackClick();
            }, 1000);
          })
          .catch((res) => {
            console.log(res);
            this.$message({
              type: "error",
              message: res.data,
            });
            this.isPublishing = false;
          });
      }
    },
    onBackClick() {
      // if (this.$route.meta.isNoHistory) {
      //   exitApp();
      // } else {
      this.$router.push({
        name: "reviewHomework",
        query: {
          ocId: this.ocId,
          homeworkId: this.homeworkId,
          currentGroupOrder: this.groupOrder,
        },
      });
      // }
    },
    onImageviewOpen() {
      console.log("open");
      this.postAppActivityParam({ operation: 3, attach: "1" });
    },
    onImageviewClose() {
      console.log("close");
      this.postAppActivityParam({ operation: 3, attach: "0" });
    },
  },
  components: {
    Richtext,
    Filelist,
  },
};
</script>
<style lang="scss" scoped>
.homeworkBox {
  background-color: #fff;
  padding-bottom: 40px;
}
.homeworkTitle {
  font-size: 16px;
  color: #444444;
  letter-spacing: 0;
  line-height: 24px;
  font-weight: 600;
  padding: 16px 16px 0px;
  .icon-zuoye1 {
    color: #969696;
    margin-right: 10px;
  }
}
.homeworkInfo {
  margin-top: 4px;
  font-size: 16px;
  color: #444444;
  letter-spacing: 0;
  line-height: 24px;
  font-weight: 400;
  padding: 0px 16px;
}
.evaluationBox {
  margin-top: 16px;
  .evaluation {
    //  margin-top: -20px;
    background-color: #fff;
    // box-shadow: 0 0 8px 0 rgba(0, 0, 0, 0.12);
    border-radius: 4px;
    padding: 20px 16px;
    .inputScore {
      display: flex;
      align-items: center;
      .van-field {
        width: 90px;
        padding: 5px 0px;
        margin: 0px 8px;
        ::v-deep input {
          border: 1px solid #e3e3e9;
          border-radius: 4px;
          text-align: center;
        }
      }
      .van-cell::after {
        position: unset;
      }
      .ipt {
        font-size: 15px;
        color: #444444;
        letter-spacing: 0;
        line-height: 22.5px;
        font-weight: 400;
      }
      .score {
        font-size: 15px;
        color: #969696;
        letter-spacing: 0;
        text-align: right;
        line-height: 22.5px;
        font-weight: 400;
        flex: 1;
      }
    }
    .comments {
      border: 1px solid #e3e3e9;
      margin-top: 20px;
    }
    .submitBtn {
      background-image: linear-gradient(225deg, #f97652 0%, #ea5947 100%);
      box-shadow: 0 5px 10px 0 rgba(234, 89, 71, 0.3);
      border-radius: 6px;
      font-size: 18px;
      color: #fff;
      text-align: center;
      font-weight: 400;
      width: 100%;
      //  padding: 8px 0px;
      height: 44px;
      line-height: 44px;
      margin-top: 16px;
    }
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
.fileList {
  margin: 0px 16px;
}
</style>