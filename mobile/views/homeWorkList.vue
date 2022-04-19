<template>
  <div class="mb-page">
    <NavigationBar :title="topTips.homeworkTitle" v-if="topTips&&!loading">
      <template v-slot:right>
        <div
          class="color-primary iconfont icon-zuoyexiangqing"
          @click="homeWork"
        ></div>
      </template>
    </NavigationBar>
    <div class="tips" v-if="tipTitle&&!loading">
      <span class="iconfont icon-zuoyexiangqing"></span>
      <span class="homeworkTime" v-if="tipTitle">{{ tipTitle }}</span>
      <span class="time" v-if="date">{{ date | formatDate }}</span>
    </div>
    <div class="choseBox" v-if="!loading">
      <van-dropdown-menu>
        <van-dropdown-item
          v-model="seletTea"
          :options="option1"
          @change="getScreenSelectList()"
          v-if="this.permissionGroupId == 1"
        />
        <van-dropdown-item
          v-model="seletClass"
          :options="option2"
          @change="getGrouplist()"
        />
      </van-dropdown-menu>
      <span class="iconfont icon-quanshipei-sousuo" @click="doSerach"></span>
    </div>
    <div class="listBox" v-if="!loading">
      <div class="btnBox">
        <button
          @click="changeActive(4)"
          :class="active == 4 ? 'active' : ''"
        >
          <span v-if="statistics">已提交（{{ ytjNum() }}）</span>
        </button>
        <button
          @click="changeActive(5)"
          :class="active == 5 ? 'active' : ''"
        >
          <span v-if="statistics">未提交（{{ statistics.wtjNum }}）</span>
        </button>
      </div>
    </div>
    <div class="mb-body" v-if="topTips">
      <div>
        <!-- :immediate-check="false" -->
        <div v-if="total != 0" class="groupListBox">
          <van-list
            v-model="loading1"
            :finished="finished"
            loading-text="加载中"
            finished-text=""
            @load="onLoad"
            :offset="50"
          >
            <div
              v-for="(item, index) in list"
              :key="item.title"
              class="groupList van-clearfix"
              @click="review(item, index)"
            >
              <div class="desc">{{ item.groupName }}</div>
              <div class="sl">
                <span v-if="active == 5 && item.discussNum != 0">
                  <span class="iconfont icon-taolun"></span>
                  <span>{{ item.discussNum }}</span>
                </span>
                <span v-if="active == 4">
                  <span v-if="item.flag" class="tag">{{
                    tags[item.flag]
                  }}</span>
                  <span v-if="[2,6,7].includes(item.status)">{{statusMap[item.status]}}</span>
                  <!-- <span v-if="item.status == 6">待互评</span>
                  <span v-if="item.status == 7">互评中</span> -->
                  <span v-if="item.score != null" class="choseText"
                    >{{ item.score }}分</span
                  >
                </span>
              </div>
              <i class="van-icon van-icon-arrow"></i>
            </div>
          </van-list>
        </div>
        <div
          v-if="
            total != 0 &&
            active == 5 &&
            topTips &&
            ((topTips.lateShipment == 1 && topTips.homeworkStatus > 2) ||
              (topTips.lateShipment == 0 && topTips.homeworkStatus == 3))
          "
          class="remindHomeWork"
          @click="remindHomeWork"
        >
          提醒学生交作业
        </div>
        <div v-if="total == 0" class="empty">暂无数据</div>
      </div> 
    </div>
     <div v-if="loading" class="loading">
          <van-loading color="#ea5947" />
        </div>
  </div>
  
</template>
<script>
import {  getCourseRoleInfo } from "@/api/courseApi";
import {
  submitList,
  remind,
  teacherTeam,
} from "@/api/homeworkApi";
import SearchGroup from "../components/Search/search.vue";
import { mapGetters, mapActions } from "vuex";
import formatDateFilter from '@/mixins/formatDate.js'
export default {
  name: "homeWorkList",
  mixins:[formatDateFilter],
  props: ["classId", "teacherId", "status"],
  data() {
    return {
      AllClassList: [],
      input: "",
      value: "",
      value1: 0,
      ResClassList: [],
      teacherSet: [],
      permissionGroupId: "", //角色 1管理员2教师3助教
      active: 4,
      option1: [{ text: "全部教师", value: "" }],
      option2: [{ text: "全部班级", value: "" }],
      seletTea: "",
      seletClass: "",
      list: [],
      loading: false,
      finished: false,
      refreshing: true,
      topTips: null,
      tipTitle: "",
      date: "",
      total: 0,
      pageSize: 10,
      currentPage: 1,
      loading1: false,
      subStatus: null,
      statistics: null,
      teacherTeamList: null,
      tags:{
        '1':'迟交',
        '2':'需重写',
      },
      statusMap:{
        '2':'待批阅',
        '6':'待互评',
        '7':'互评中'
      }
    };
  },
  created() {
    this.active = this.status ? this.status : 4;
    // this.seletClass = this.classId ? this.classId : "";
    // this.seletTea = this.teacherId ? this.teacherId : "";
    this.loading=true;
    getCourseRoleInfo(this.ocId).then((data) => {
      this.permissionGroupId = data.permissionGroupId;
      this.seletTea = data.userId ? data.userId : data.userID;
      this.getTeacherTeam();
    });
  },
  mounted() {},
  computed: {
    ocId() {
      return this.$route.query.ocId;
    },
    homeworkId() {
      return this.$route.query.homeworkId > 0
        ? this.$route.query.homeworkId
        : 0;
    },
    pageAllNum() {
      if(this.total){
       return Math.ceil(this.total / this.pageSize);
      }
    },
    ...mapGetters("checkClass", { checkClassList: "checkClassList" }),
    ...mapGetters("user", { user: "user" }),
  },
  watch: {
    active() {
      this.getGrouplist();
    },
  },
  methods: {
    // getFlag(type) {
    //   if (type == 2) {
    //     return `需重写`;
    //   } else if (type == 1) {
    //     return `迟交`;
    //   }
    // },
    getTeacherTeam() {
      teacherTeam({
        ocId: this.ocId,
        homeworkId: this.homeworkId,
      })
        .then((res) => {
          this.teacherTeamList = res.result || [];
          var hasTea = false;
          if(res.result){
              res.result.forEach((item) => {
            if (item.classes.length != 0) {
              this.option1.push({
                value: item.userId,
                text: item.name,
              });
              if (item.userId == this.seletTea) {
                hasTea = true;
              }
            }
          });
          }
          if (!hasTea) {
            this.seletTea = "";
          }
          this.getScreenSelectList();
        })
        .catch((res) => {
          console.log(res);
        });
    },
    // 根据教师id获取班级列表
    getScreenSelectList() {
      this.option2 = [{ text: "全部班级", value: "" }];
      if (this.seletTea > 0) {
        this.teacherTeamList.forEach((item, index) => {
          if (item.userId == this.seletTea) {
            this.teacherTeamList[index].classes.map((item) => {
              this.option2.push({
                value: item.classId,
                text: item.className,
              });
              return item;
            });
          }
        });
        this.getSetClassList();
      } else {
        this.teacherTeamList.forEach((item, index) => {
          item.classes.map((item) => {
            this.option2.push({
              value: item.classId,
              text: item.className,
            });
            return item;
          });
        });

        this.getSetClassList();
      }
      this.seletClass = "";
      this.getGrouplist();
    },
    getSetClassList() {
      let hash = {};
      const newArr = this.option2.reduce((item, next) => {
        hash[next.value] ? "" : (hash[next.value] = true && item.push(next));
        return item;
      }, []);
      this.option2 = newArr;
    },
    getGrouplist() {
       this.initialization();
      submitList({
        ocId: this.$route.query.ocId,
        classId: this.seletClass,
        homeworkId: this.homeworkId,
        teacherId: this.seletTea,
        status: this.active,
        pn: this.currentPage,
        ps: this.pageSize,
      })
        .then((res) => {
          this.total = res.result.groupHomeworkList.total;
          this.topTips = res.result.homeworkInfo;
          this.statistics = res.result.statistics;
          this.list = res.result.groupHomeworkList.list;
          this.subStatus = res.result.subStatus;
          if (res.result.subStatus) {
            if (res.result.subStatus == 1) {
              this.tipTitle = `作业未开始，开始时间：`;
              this.date = res.result.homeworkInfo.startTime;
            } else if (res.result.subStatus == 2) {
              this.tipTitle = `作业提交中，截止时间：`;
              this.date = res.result.homeworkInfo.endTime;
            } else if (res.result.subStatus == 3) {
              this.tipTitle = `作业提交数量不足，已转为教师评分`;
            } else if (res.result.subStatus == 4) {
              this.tipTitle = `作业互评中，截止时间：`;
              this.date = res.result.homeworkInfo.peerReviewTime;
            }
          }
          this.loading = false;
         
          //
        })
        .catch((res) => {
          // this.loading = false;
          this.loading=false
          this.$message({
            type: "error",
            message: res.message,
          });
        });
    },
    changeActive(value) {
      //this.refreshing=true;
      this.active = value;
    },
    initialization() {//重新初始化下拉列表
      this.currentPage = 1;
      this.finished = false;
      // this.loading = true;
      this.loading1 = true;
      this.list = [];
      if (this.loading1) {
       setTimeout(()=>{
         this.onLoad();
       },1000)
      }
    },
    homeWork() {
      this.$router.push({
        name: "publishInfo",
        query: {
          homeworkId: this.homeworkId,
          ocId: this.ocId,
        },
      });
    },
    doSerach() {
      this.$router.push({
        name: "serach",
        query: {
          ocId: this.$route.query.ocId,
          homeworkId: this.homeworkId,
          teacherId: this.seletTea,
          classId: this.seletClass,
        },
      });
    },
    onLoad() {
      setTimeout(() => {
        this.currentPage = this.currentPage + 1;
        if(!this.pageAllNum){//当数据没有加载完成时，重新初始化下拉列表
          this.initialization()
          return
        }
        if (this.currentPage <= this.pageAllNum) {
          this.loading1 = true;
          submitList({
            ocId: this.$route.query.ocId,
            classId: this.seletClass,
            homeworkId: this.homeworkId,
            teacherId: this.seletTea,
            status: this.active,
            pn: this.currentPage,
            ps: this.pageSize,
          })
            .then((res) => {
              this.loading1 = false;
              // this.total = res.total;
              res.result.groupHomeworkList.list.forEach((item) => {
                this.list.push(item);
              });
            })
            .catch((res) => {
              this.loading1 = false;
              console.log(res);
              this.$message({
                type: "error",
                message: res.message,
              });
            });
        } else {
          this.finished = true;
          this.loading1 = false;
        }
      }, 500);
    },
    remindHomeWork() {
      remind({ ocId: this.ocId, homeworkId: this.homeworkId })
        .then((res) => {
          this.$message({
            type: "success",
            message: "提醒成功",
          });
        })
        .catch((res) => {
          this.$message({
            type: "error",
            message: res.message,
          });
        });
    },
    review(item, index) {
      if (this.permissionGroupId == 1) {
        var classIds=[]
        if(this.seletClass==""){
         this.option2.forEach(item=>{
          if(item.value){
           classIds.push(item.value)
          }
        })
        }else{
         classIds.push(this.seletClass)
        }
        this.$router.push({
          name: "reviewHomework",
          query: {
            ocId: this.ocId,
            homeworkId: this.homeworkId,
            currentGroupOrder: item.groupOrder,
          },
          params:{
            classIds:classIds
          }
        });
      } else {
        this.$router.push({
          name: "reviewHomework",
          query: {
            ocId: this.ocId,
            homeworkId: this.homeworkId,
            currentGroupOrder: item.groupOrder,
          },
        });
      }
    },
    ytjNum() {
      return this.statistics.dpyNum + this.statistics.ypyNum;
    },
  },
  components: {
    SearchGroup,
  },
};
</script>
<style lang="scss" scoped>
.choseText {
  color: #444 !important;
}
.mb-body {
  background-color: #fff;
}
.search-wrapper {
  padding: 16px;
}
.class-list {
  padding: 0 16px 100px;
  li {
    display: flex;
    height: 56px;
    align-items: center;
    border-bottom: solid 1px #f1f3f7;
    .text {
      flex: 1;
      padding-left: 32px;
      font-size: 16px;
    }
  }
}
.van-checkbox {
  width: 100%;
  ::v-deep .van-checkbox__label {
    margin-left: 32px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
}
.color-primary.iconfont {
  font-size: 18px;
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
.choseBox {
  display: flex;
  background-color: #fff;
  .van-dropdown-menu {
    flex: 1;
    width: 90%;
  }
  .iconfont {
    display: inline-block;
    width: 52px;
    text-align: center;
    line-height: 39px;
    font-size: 19px;
    color: #cbcbd1;
    border-bottom: 1px solid rgb(241, 243, 247);
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
.groupList {
  margin: 0 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  border-bottom: 1px solid #f1f3f7;
  .desc {
    flex: 1;
    margin-right: 24px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  .tag {
    font-size: 15px;
    color: #f60000;
    letter-spacing: 0;
    text-align: right;
    line-height: 22.5px;
    font-weight: 400;
  }
  span {
    flex: 1;
    text-align: right;
    margin-right: 5px;
    color: #969696;
    font-size: 15px;
    //margin-left: 20px;
  }
  i {
    color: #969696;
  }
}
.empty {
  font-size: 15px;
  color: #969696;
  letter-spacing: 0;
  line-height: 250px;
  font-weight: 400;
  text-align: center;
}
.groupListBox {
  padding-bottom: 50px;
}
.remindHomeWork {
  height: 50px;
  background-color: #ea5947;
  position: fixed;
  width: 100%;
  bottom: 0px;
  font-size: 18px;
  color: #ffffff;
  text-align: center;
  font-weight: 400;
  line-height: 50px;
}
.loading {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
@supports (top: constant(safe-area-inset-top)) or
  (top: env(safe-area-inset-top)) {
  .remindHomeWork {
    bottom: constant(safe-area-inset-bottom) !important;
    bottom: env(safe-area-inset-bottom) !important;
  }
}
</style>