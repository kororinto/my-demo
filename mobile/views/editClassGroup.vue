<template>
  <div class="mb-page">
    <NavigationBar :title="title">
      <template v-slot:right>
        <div class="color-primary" @click="onSave">完成</div>
      </template>
    </NavigationBar>
    <div class="choseStudentInfo">
      将<span class="choseName">{{ checkCurrentStudent.userName }}</span
      >更改至
    </div>
    <div class="search-wrapper">
      <SearchGroup
        placeholder="搜索"
        v-model="input"
        @search="getGrouplist()"
      ></SearchGroup>
    </div>
    <div class="mb-body">
      <div v-if="total != 0" class="groupListBox">
        <van-radio-group v-model="selectGroupId">
          <van-radio
            :name="item.groupId"
            v-for="(item, index) in list"
            :key="index"
            class="class-list"
            checked-color="#ea5947"
            icon-size="20px"
            ><div class="studentInfo">
              <div class="info">
                <div class="stuName">{{ item.title }}</div>
                <div class="stuInfo">
                  <span>{{ getNames(item.students) }}</span>
                </div>
              </div>
            </div></van-radio
          >
        </van-radio-group>
      </div>
      <div v-if="total == 0" class="empty">暂无数据</div>
    </div>
    <div v-if="loading" class="loading">
      <van-loading color="#ea5947" />
    </div>
  </div>
</template>
<script>
import {
  moveGroupMember,
  searchGroups,
} from "@/api/courseApi";
import SearchGroup from "../components/Search/search.vue";
import { mapGetters, mapActions } from "vuex";
import { getHeadImage } from "@/utils/getHeadImage.js";
export default {
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
      loading1: false,
      subStatus: null,
      statistics: null,
      isFirst: true,
      selectGroupId: 0,
      title: "",
      radio: 0,
    };
  },
  created() {
    this.title = this.checkCurrentGroup.groupId > 0 ? "更改分组" : "选择小组";
    this.selectGroupId =
      this.checkCurrentGroup.groupId > 0 ? this.checkCurrentGroup.groupId : 0;
    this.getGrouplist();
  },
  computed: {
    ocId() {
      return this.$route.query.ocId;
    },
    classId() {
      return this.$route.query.classId;
    },
    ...mapGetters("checkClass", { checkClassList: "checkClassList" }),
    ...mapGetters("user", { user: "user" }),
    ...mapGetters("currentGroup", { checkCurrentGroup: "checkCurrentGroup" }),
    ...mapGetters("currentGroup", {
      checkCurrentStudent: "checkCurrentStudent",
    }),
  },
  watch: {},
  methods: {
    HeadImage(headImage, sex, role) {
      return getHeadImage(headImage, sex, role);
    },
    getFlag(type) {
      if (type == 2) {
        return `需重写`;
      } else if (type == 1) {
        return `迟交`;
      }
    },
    // 根据教师id获取讨论和班级列表

    getGrouplist() {
      this.loading = true;
      searchGroups(this.classId, this.input)
        .then((res) => {
          console.log(res);
          this.total = res.total;
          this.list = res.groups;
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
    getNames: function (list) {
      if (list && list.length > 0) {
        return `${list[0].userName}等${list.length}人`; //this.$t('score.nameAndCount', {name: list[0].userName, count: list.length}) //  `${list[0].userName}等${list.length}人`
      } else {
        return "无成员"; //this.$t('member.null') // '无成员'
      }
    },
    onSave() {
      if (this.selectGroupId > 0) {
        if (this.checkCurrentGroup.groupId > 0) {
          this.$dialog
            .confirm({
              title: "提示",
              message: "确认将学生更改分组？",
              confirmButtonText: "确定",
            })
            .then(() => {
              // on confirm
              this.doSave()
            })
            .catch(() => {
             
              // on cancel
            });
          
        } else {
          this.doSave();
        }
      }
    },
   doSave(){
      if (this.selectGroupId === 0) {
         this.$message({
             type:'error',
             message:'请选择一个小组'
         })
          return
        }
        
        moveGroupMember(this.classId, this.selectGroupId, this.checkCurrentStudent.userId)
        .then(res=>{
          this.$message({
             type:'success',
             message:'更改成功'
         })
          this.$router.back()
        })
        .catch(res=>{
           this.$message({
             type:'error',
             message:'保存错误，请重试'
         })
        })
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
        params: {
          ocId: this.$route.query.ocId,
          classId: this.seletClass,
          homeworkId: this.homeworkId,
          teacherId: this.seletTea,
          status: this.active,
        },
      });
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
.choseStudentInfo {
  padding: 16px;
  background-color: #fff;
  padding-bottom: 0px;
  .choseName {
    font-weight: bold;
    margin: 0px 5px;
  }
}
.search-wrapper {
  padding: 16px;
  background-color: #fff;
}
.class-list {
  padding: 15px 0px;
  margin: 0px 16px;
 // height: 81px;
  align-items: flex-start;
  border-bottom: solid 1px #f1f3f7;

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
      border-radius: 50px;
      margin-right: 16px;
    }
  }
}
.van-checkbox {
  width: 100%;
  ::v-deep .van-checkbox__label {
    width: 100%;
    margin-left: 20px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
  ::v-deep .van-checkbox__icon {
    margin-top: 4px;
  }
}
.van-radio{
 ::v-deep .van-radio__icon {
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
  padding-bottom:50px;
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