<template>
  <div class="mb-page">
    <NavigationBar title="选择学生">
      <template v-slot:right>
        <div class="color-primary" @click="onSave">确定<span v-if="selectNum > 0">({{selectNum}})</span></div>
      </template>
    </NavigationBar>
    <div class="search-wrapper">
        <SearchGroup
          placeholder="搜索"
          v-model="input"
          @search="getStudentList()"
        ></SearchGroup>
      </div>
    <div class="mb-body">
        <div v-if="total != 0" class="groupListBox">
          <van-list
            :finished="finished"
            finished-text=""
            @load="onLoad"
            :immediate-check="false"
            :offset="10"
          >
            <ul class="class-list clear_float">
              <li v-for="(item, index) in list" :key="index">
                <van-checkbox
                  v-model="item.flag"
                  :disabled="item.disabled"
                  shape="square"
                  checked-color="#ea5947"
                  icon-size="20px"
                >
                  <div class="studentInfo">
                    <div
                      class="headerInfo"
                      :style="{
                        backgroundImage:
                          'url(' + HeadImage(item.headImage, user.sex, 9) + ')',
                        backgroundSize: 'cover',
                      }"
                    ></div>
                    <div class="info">
                      <div class="stuName">{{ item.userName }}</div>
                      <div class="stuInfo">
                        <span>{{ item.studentId }}</span
                        ><span class="stuTitle" v-if="item.title">{{
                          item.title
                        }}</span>
                        <span class="stuTitle" v-else>未分组</span>
                      </div>
                    </div>
                  </div>
                </van-checkbox>
                <!-- <div class="text ellipsis-one">{{ item.name }}</div> -->
              </li>
            </ul>
          </van-list>
        </div>
        <div
          v-if="
            total != 0 &&
            active == 5 &&
            topTips &&
            ((topTips.lateShipment == 1 &&
              (subStatus == 2 || subStatus == 3)) ||
              (topTips.lateShipment == 0 && subStatus == 2))
          "
          class="remindHomeWork"
          @click="remindHomeWork"
        >
          提醒学生交作业
        </div>
        <div v-if="total == 0" class="empty">暂无数据</div>
      </div>
  </div>
</template>
<script>
import {
  searchStudents,
  moveGroupMember
} from "@/api/courseApi";
import { remind } from "@/api/homeworkApi";
import SearchGroup from "../components/Search/search.vue";
import { mapGetters, mapActions } from "vuex";
import { getHeadImage } from "@/utils/getHeadImage.js";
export default {
  name:'addGroupStudent',
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
      pageSize: 9,
      currentPage: 1,
      pageAllNum: 0,
      subStatus: null,
      statistics: null,
      isFirst: true
    };
  },
  created() {
    this.active = this.status ? this.status : 4;
    this.seletClass = this.classId ? this.classId : "";
    this.seletTea = this.teacherId ? this.teacherId : "";
    this.getGrouplist();
  },
  mounted() {},
  computed: {
    ocId() {
      return this.$route.query.ocId;
    },
    classId() {
      return this.$route.query.classId;
    },
    allcheck: {
      get() {
        //取值
        //every方法，数组中每一项都满足一个条件返回true
        if (this.list.length < 1) {
          return false
        }
        return this.list.every((item) => item.flag);
      },
      set(newValue) {
        //设置值
        this.list.map((item) => (item.flag = newValue));
      },
    },
    selectNum() {
      return this.list.filter((item) => item.flag).length;
    },
    count() {
      let checkedList = this.list.filter((item) => item.flag);
      return checkedList.length.reduce((total, item) => {
        return total + item.num;
      }, 0);
    },
    ...mapGetters("checkClass", { checkClassList: "checkClassList" }),
    ...mapGetters("user", { user: "user" }),
    ...mapGetters("currentGroup", { checkCurrentGroup: "checkCurrentGroup" }),
  },
  watch: {
    active() {
      this.getGrouplist();
    },
  },
  methods: {
    HeadImage(headImage, sex, role) {
      return getHeadImage(headImage, sex, role);
    },
    getGrouplist() {
      this.loading = true;
      searchStudents({
        classId: this.classId,
        keyword: this.input,
        pn: this.currentPage,
        ps: this.pageSize,
      })
        .then((res) => {
          console.log(res);
          this.total = res.total;
          //   this.topTips = res.result.homeworkInfo;
          //   this.statistics=res.result.statistics
          this.pageAllNum = Math.ceil(this.total / this.pageSize);
          res.students.forEach((item) => {
          item.flag = false
          item.disabled=false
          if(this.checkCurrentGroup.students.length!=0){
              for (let i = 0; i < this.checkCurrentGroup.students.length; i++) {
            const element = this.checkCurrentGroup.students[i];
            if(element.userId == item.userId) {
              item.flag = true
              item.disabled=true
            }
          }
          }
        });
        if(this.currentPage==1){
            this.list = res.students;
        }else{
          console.log(this.list);
            this.list=this.list.concat(res.students)
            console.log(this.list);
        }
          this.loading = false;
        })
        .catch((res) => {
          this.loading = false;
          this.$message({
            type: "error",
            message: res.data,
          });
        });
    },
    onSave(){
     var checked = this.list.filter((ele) => ele.flag);
      console.log(checked);
      var arr=[]
      checked.forEach(item=>{
       arr.push(item.userId)
      })
      if(arr.length==0){
          this.$message({
              type:'error',
              message:'请至少选择一名学生'
          })
        return 
      };
      moveGroupMember(this.classId,this.checkCurrentGroup.groupId,arr.join(','))
      .then(res=>{
         this.$message({
              type:'success',
              message:'移动成员成功'
          })
      })
      .catch(res=>{
         this.$message({
              type:'error',
              message:'移动成员失败'
          })
      })
      setTimeout(()=>{
        this.$router.back();
      },1000)
     
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
    onLoad() {
      this.currentPage = this.currentPage + 1;
      if (this.currentPage <= this.pageAllNum) {
        this.getGrouplist()
      } else {
        this.finished = true;
      }
      //   }
    },
    getStudentList(){
      this.currentPage=1;
      this.pageSize=9999;
      this.getGrouplist()
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
            message: res.data,
          });
        });
    },
    review(item) {
      console.log(item);
      this.$router.push({
        name: "reviewHomework",
        query: {
          ocId: this.ocId,
          homeworkId: this.homeworkId,
          currentGroupOrder: item.groupOrder,
        },
      });
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
.mb-body {
  background-color: #fff;
  position: relative;
}
.search-wrapper {
  padding: 16px;
 background-color: #fff;
}
.class-list {
  padding: 0px 16px;
  li {
    display: flex;
   // height: 81px;
   padding: 15px 0px;
    align-items: center;
    border-bottom: solid 1px #f1f3f7;
    .text {
      flex: 1;
      padding-left: 32px;
      font-size: 16px;
    }
    .studentInfo {
      display: flex;
      .info {
        flex: 1;
        .stuName {
          font-size: 16px;
          color: #444444;
          letter-spacing: 0;
          line-height: 24px;
          font-weight: 500;
          margin-bottom: 8px;
        }
        .stuInfo {
          font-size: 15px;
          color: #969696;
          letter-spacing: 0;
          line-height: 22.5px;
          font-weight: 400;
          .stuTitle {
            float: right;
          }
        }
      }
      .headerInfo {
        width: 50px;
        height: 50px;
        border-radius: 50px;
        margin-right: 16px;
      }
    }
  }
}
.van-checkbox {
  width: 100%;
  align-items: flex-start;
  ::v-deep .van-checkbox__label {
    width: 100%;
    margin-left: 20px;
  }
  ::v-deep .van-checkbox__icon {
    margin-top: 4px;
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
        padding-bottom: 20px;
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
@supports (top: constant(safe-area-inset-top)) or
  (top: env(safe-area-inset-top)) {
  .remindHomeWork {
    bottom: constant(safe-area-inset-bottom) !important;
    bottom: env(safe-area-inset-bottom) !important;
  }
}
</style>