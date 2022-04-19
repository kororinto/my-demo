<template>
  <div>
    <div
      ref="memList"
      v-if="memberList"
      :class="this.memberList.length <= 2 ? 'memList heightAuto' : 'memList'"
    >
      <div class="memHea">
        <div class="memtil">
          <span class="iconfont icon-xiaozu"></span>
          <span class="mem">小组成员</span>
          <span class="number">({{ memberList.length }}人)</span>
        </div>
        <span
          class="iconfont icon-zhankai"
          @click="showMoreList"
          v-show="!iconRote"
        ></span>
        <span
          class="iconfont icon-zhankai rote"
          @click="showMoreList"
          v-show="iconRote"
        ></span>
      </div>
      <div :class="iconRote ? 'list heightList' : 'list'">
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
    <div class="discussion" v-if="discussionInfo" @click="goDiscussion">
      <div class="hTitle hTitle1">
        <span class="title">
          组内讨论
          <span class="number">（{{ discussionInfo.total }}条）</span>
        </span>
        <i class="van-icon van-icon-arrow"></i>
      </div>
    </div>
    <div :class="this.user.role == 8 ? 'homework' : 'homework homework1'">
      <div class="hTitle">本组作业</div>
      <div class="myhomework"></div>
      <div
        class="empty"
        v-if="
          (!myGroupHomework ||
            !myGroupHomework.content ||
            (myGroupHomework && myGroupHomework.status == 1)) &&
          ((publishInfo && publishInfo.lateShipment == 1) ||
            publishInfo.homeworkStatus < 4)
        "
      >
        暂未提交
      </div>
      <div
        class="empty"
        v-if="
          publishInfo &&
          publishInfo.lateShipment == 0 &&
          publishInfo.homeworkStatus > 3 &&
          (!myGroupHomework ||
            !myGroupHomework.content ||
            (myGroupHomework && myGroupHomework.status == 1))
        "
      >
        逾期未交
      </div>
      <div
        class="homeTitle"
        v-if="myGroupHomework && myGroupHomework.status > 1"
      >
        <span>{{ myGroupHomework.userName }}</span
        ><span class="submitTil">提交于</span
        ><span>{{ myGroupHomework.submitTime | formatDate }}</span>
      </div>
      <div
        class="homeworkInfo"
        v-if="
          myGroupHomework &&
          myGroupHomework.content &&
          myGroupHomework.status > 1
        "
      >
        <Richtext
          @onClose="onImageviewClose"
          @onOpen="onImageviewOpen"
          v-if="myGroupHomework && myGroupHomework.content"
          :content="myGroupHomework.content"
        ></Richtext>
      </div>
      <Filelist
        :mode="2"
        :files="myGroupHomework.fileList"
        v-if="
          myGroupHomework &&
          myGroupHomework.status > 1 &&
          myGroupHomework.fileList
        "
      />
      <div v-if="this.user.role == 9">
        <div
          class="lateTips"
          v-if="
            publishInfo &&
            publishInfo.lateShipment == 1 &&
            (!myGroupHomework ||
              !myGroupHomework.content ||
              (myGroupHomework && myGroupHomework.status == 1)) &&
            publishInfo.homeworkStatus > 3
          "
        >
          本次作业允许补交，请尽快提交作业。
        </div>
        <div
          class="lateTips"
          v-if="
            publishInfo &&
            publishInfo.homeworkStatus == 3 &&
            (!myGroupHomework ||
              !myGroupHomework.content ||
              (myGroupHomework && myGroupHomework.status == 1))
          "
        >
          <div v-if="publishInfo && publishInfo.autoRemark == 0">
            提交截止时间：{{ publishInfo.endTime | formatDate }}
          </div>
          <div>协作完成小组作业，最后由一人提交</div>
        </div>
        <div
          class="write"
          v-if="
            (!myGroupHomework ||
              !myGroupHomework.content ||
              (myGroupHomework && myGroupHomework.status == 1)) &&
            ((publishInfo && publishInfo.lateShipment == 1) ||
              publishInfo.homeworkStatus < 4)
          "
          @click="doHomework"
        >
          写作业
        </div>
        <div
          class="reWriteHomework"
          @click="withdrawHomework"
          v-if="
            myGroupHomework &&
            myGroupHomework.content &&
            (myGroupHomework.status == 2 || myGroupHomework.status == 6) &&
            publishInfo.homeworkStatus == 3
          "
        >
          撤回重交
        </div>
        <div
          class="reWriteHomework"
          v-if="myGroupHomework && myGroupHomework.status == 5"
          @click="doRewite"
        >
          重写作业
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { withdraw } from "@/api/homeworkApi";
import { formatDate } from "@/utils/index.js";
import Richtext from "../../components/Richtext/richtext.vue";
import Filelist from "../../components/FileList";
import { mapGetters, mapActions } from "vuex";
import formatDateFilter from '@/mixins/formatDate.js'
export default {
  name: "groupHomework",
  mixins:[formatDateFilter],
  props: [
    "myGroupHomework",
    "publishInfo",
    "memberList",
    "discussionInfo",
    "groupOrder",
    "classIds",
  ],
  data() {
    return {
      iconRote: false,
      baseImg: "https://courseweb.ulearning.cn/common/img/defaultHeaderLg.png",
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
    onImageviewOpen() {
      console.log("open");
      this.postAppActivityParam({ operation: 3, attach: "1" });
    },
    onImageviewClose() {
      console.log("close");
      this.postAppActivityParam({ operation: 3, attach: "0" });
    },
    showMoreList() {
      this.iconRote = !this.iconRote;
      if (this.memberList.length <= 2) {
        this.$refs.memList.classList.add("heightAuto");
      } else {
        if (this.$refs.memList.className == "memList") {
          this.$refs.memList.classList.add("heightAuto");
        } else {
          this.$refs.memList.classList.remove("heightAuto");
        }
      }
    },
    goDiscussion() {
      this.$router.push({
        name: "discussion",
        query: {
          ocId: this.ocId,
          homeworkId: this.homeworkId,
          currentGroup: this.groupOrder,
        },
        params: {
          classIds: this.classIds,
        },
      });
    },
    withdrawHomework() {
      this.$dialog
        .confirm({
          title: "提示",
          message:
            "所有小组成员共享一份作业，如果要撤回请确保其他成员同意，确定撤回作业吗？",
          confirmButtonText: "确定",
        })
        .then(() => {
          // on confirm
          withdraw({
            ocId: this.ocId,
            homeworkId: this.homeworkId,
            groupOrder: this.groupOrder,
          })
            .then((res) => {
              this.$message({
                type: "success",
                message: "撤回成功，可在作业提交截止时间前重新提交作业",
              });
              this.$parent.getGroupInfo();
            })
            .catch((res) => {
              console.log(res);
              this.$message({
                type: "error",
                message: res.message,
              });
            });
        })
        .catch(() => {
          console.log("执行确定");
          // on cancel
        });
    },
    doHomework() {
      this.$router.push({
        name: "dohomework",
        query: {
          ocId: this.ocId,
          homeworkId: this.homeworkId,
          groupOrder: this.groupOrder,
        },
        params: {
          allMember: this.allMember,
        },
      });
    },
    doRewite() {
      this.$router.push({
        name: "dohomework",
        query: {
          ocId: this.ocId,
          homeworkId: this.homeworkId,
          groupOrder: this.groupOrder,
        },
        params: {
          allMember: this.allMember,
        },
      });
    },
  },
  components: {
    Richtext,
    Filelist,
  },
};
</script>
<style lang="scss" scoped>
.memList {
  height: 110px;
  background-color: #fff;
  padding: 16px;
  overflow: hidden;
  position: relative;
  .memHea {
    display: flex;
    align-items: center;
    .memtil {
      flex: 1;
      display: flex;
      align-items: center;
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
  .heightList {
    max-height: 300px;
    overflow-y: scroll;
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
.memList.heightAuto {
  height: auto;
}
.discussion {
  margin: 16px 0px;
  padding: 16px;
  position: relative;
  font-size: 15px;
  color: #444444;
  letter-spacing: 0;
  line-height: 22.5px;
  font-weight: 400;
  background-color: #fff;
  .icon-youye {
    float: right;
  }
}
.van-icon-arrow {
  color: #969696;
}
.homework {
  //margin: 16px 0px;
  padding: 16px;
  background-color: #fff;
  position: relative;
  font-size: 15px;
  color: #444444;
  letter-spacing: 0;
  line-height: 22.5px;
  font-weight: 400;
  position: relative;
  background-color: #fff;
  margin-bottom: 120px;
  .empty {
    font-size: 15px;
    color: #969696;
    letter-spacing: 0;
    line-height: 22.5px;
    font-weight: 400;
  }
  .homeTitle {
    font-size: 14px;
    color: #969696;
    letter-spacing: 0;
    line-height: 22.5px;
    font-weight: 400;
    .submitTil{
      padding: 0px 6px;
    }
  }
  .homeworkInfo {
    font-size: 16px;
    color: #444444;
    letter-spacing: 0;
    line-height: 24px;
    font-weight: 400;
  }
  .lateTips {
    font-size: 14px;
    color: #f7b13d;
    letter-spacing: 0;
    font-weight: 400;
    margin-top: 5px;
  }
  .write {
    background-image: linear-gradient(225deg, #f97652 0%, #ea5947 100%);
    box-shadow: 0 5px 10px 0 rgba(234, 89, 71, 0.3);
    border-radius: 6px;
    font-size: 18px;
    color: #fff;
    text-align: center;
    font-weight: 400;
    width: 100%;
    height: 44px;
    line-height: 44px;
    //padding: 8px 0px;
    margin-top: 70px;
  }
  .reWriteHomework {
    background: #ffffff;
    border: 1px solid #e3e3e9;
    border-radius: 6px;
    font-size: 18px;
    color: #ea5947;
    text-align: center;
    font-weight: 400;
    width: 100%;
    height: 44px;
    line-height: 44px;
    //padding: 8px 0px;
    margin-top: 20px;
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
.rote {
  transform: rotateX(180deg);
}
.homework1 {
  margin-bottom: 0px;
}
</style>