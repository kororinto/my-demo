<template>
  <div class="mb-page">
    <NavigationBar :title="pageTitle ? pageTitle : '小组'">
      <template v-slot:right v-if="checkCurrentGroup.groupId != -1">
        <div class="color-primary" @click="deleteGroup">删除小组</div>
      </template>
    </NavigationBar>
    <div class="mb-body">
      <div class="tips" v-if="tipTitle">
        <span class="iconfont icon-zuoyexiangqing"></span>
        <span class="homeworkTime" v-if="tipTitle">{{ tipTitle }}</span>
        <span class="time" v-if="date">{{ date | formatDate }}</span>
      </div>
      <div>
        <div class="groupListBox" v-if="checkCurrentGroup.groupId != -1">
          <div class="groupList showGroup van-clearfix" v-show="!isEditTitle">
            <div class="desc1">{{ group.title }}</div>
            <div class="sl1">
              <!-- <span>{{ item.students.length }}人</span> -->
              <span class="iconfont icon-bianji" @click="doedit()"></span>
            </div>
          </div>
        </div>
        <transition name="van-slide-up">
          <div class="editGroupBox" v-show="isEditTitle">
            <div class="groupList editList van-clearfix">
              <div class="desc cancleBtn" @click="cancleEdit">取消</div>
              <div class="sl comfimBtn" @click="editGroup">
                完成
              </div>
            </div>
            <div class="groupList editList van-clearfix">
              <input
                class="input-text left"
                type="search"
                v-model.trim="title"
                ref="input"
              />
            </div>
          </div>
        </transition>
        <div
          :class="
            checkCurrentGroup.groupId == -1
              ? 'addStuListBox addStuListBox1'
              : 'addStuListBox'
          "
        >
          <ul class="class-list clear_float">
            <li v-for="(item, index) in studentList" :key="index">
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
                  <div class="stuName">
                    {{ item.userName }}
                    <span class="groupLeader" v-if="item.isGroupLeader == 1"
                      >（组长）</span
                    >
                  </div>
                  <div class="stuInfo">
                    <span>{{ item.studentId }}</span>
                    <div
                      v-if="checkCurrentGroup.groupId == -1"
                      class="editGroupBtn"
                      @click="goEditGroup(item)"
                    >
                      选择小组
                    </div>
                    <div
                      class="editGroupBtn"
                      @click="goEditGroup(item)"
                      v-if="checkCurrentGroup.groupId != -1"
                    >
                      修改分组
                    </div>
                  </div>
                </div>
              </div>

              <!-- <div class="text ellipsis-one">{{ item.name }}</div> -->
            </li>
          </ul>
          <div
            class="btnList"
            v-if="
              studentList &&
              studentList.length > 0 &&
              checkCurrentGroup.groupId != -1
            "
          >
            <span class="addBtn" @click="addStudent">添加学生</span>
            <span @click="leaderShow = true">重设组长</span>
          </div>
          <div
            @click="addStudent"
            class="addStuBtn"
            v-if="
              (!studentList || studentList.length == 0) &&
              checkCurrentGroup.groupId != -1
            "
          >
            添加学生
          </div>
        </div>
      </div>
    </div>
    <div v-if="loading" class="loading">
      <van-loading color="#ea5947" />
    </div>
    <van-action-sheet v-model="leaderShow" class="leaderBox">
      <div class="btn">
        <span class="cancleBtn" @click="cancleGroup">取消</span>
        <span class="leaderTitle">设置组长</span>
        <span class="confimBtn" @click="comfimGroup">确认</span>
      </div>
      <div v-if="leaderAction.length != 0" class="studentList">
        <ul v-for="item in leaderAction" :key="item.index">
          <li
            @click="choseGruop(item)"
            :class="item.index == choseLeaderIndex ? 'active' : ''"
          >
            {{ item.name }}
          </li>
        </ul>
      </div>
    </van-action-sheet>
  </div>
</template>
<script>
import {
  groupDetail,
  addNewGroup,
  deleteGroup,
  editGroup,
  getNoGroupStudents,
  getGroupMembers,
  setGroupLeader,
} from "@/api/courseApi";
import SearchGroup from "../components/Search/search.vue";
import { getHeadImage } from "@/utils/getHeadImage.js";
import { mapGetters, mapActions } from "vuex";
import formatDateFilter from '@/mixins/formatDate.js'
export default {
  name:'addGroup',
  mixins:[formatDateFilter],
  data() {
    return {
      input: "",
      value: "",
      active: 4,
      list: [],
      loading: false,
      tipTitle: "",
      statistics: null,
      group: {},
      title: "",
      isEditTitle: false,
      pageTitle: "",
      studentList: [],
      leaderShow: false,
      choseLeaderStu: null,
      choseLeaderIndex: 0,
      axiosFlag: false,
    };
  },
  created() {
    if (this.checkCurrentGroup && this.checkCurrentGroup.groupId == -2) {
      this.getGrouplist();
    } else {
      this.group = JSON.parse(JSON.stringify(this.checkCurrentGroup));
      if (this.checkCurrentGroup && this.checkCurrentGroup.groupId == -1) {
        this.pageTitle = "未分组";
      }
      this.getStudentList();
    }
  },
  mounted() {
     if (window.history && window.history.pushState) { 
        document.addEventListener('backbutton', () => {
          if (isEditTitle) {
           this.isEditTitle=false
           history.pushState(null, null, document.URL)
          } else {
            this.$router.back()
          }
        }, false)
      }
  },
  computed: {
    ocId() {
      return this.$route.query.ocId;
    },
    classId() {
      return this.$route.query.classId;
    },
    leaderAction() {
      var arr = [];
      if (this.group.students && this.group.students.length != 0) {
        this.group.students.forEach((item, index) => {
          arr.push({
            index: index,
            userId: item.userId,
            name: item.userName,
          });
        });
      }
      return arr;
    },
    ...mapGetters("checkClass", { checkClassList: "checkClassList" }),
    ...mapGetters("user", { user: "user" }),
    ...mapGetters("currentGroup", { checkCurrentGroup: "checkCurrentGroup" }),
  },
  watch: {
    checkCurrentGroup: function () {
      this.group = JSON.parse(JSON.stringify(this.checkCurrentGroup));
    },
  },
  methods: {
    HeadImage(headImage, sex, role) {
      return getHeadImage(headImage, sex, role);
    },
    getGrouplist() {
      this.loading = true;
      groupDetail(this.classId)
        .then((res) => {
          this.list = res.groupStudents;
          if (this.list) {
            this.group.title = this.setTitle();
            this.title = this.group.title;
            this.addGroup();
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
    addGroup() {
      addNewGroup({
        classId: this.classId,
        title: this.title,
      })
        .then((res) => {
          if (res.code) {
            this.$message({
              type: "error",
              message: res.message,
            });
          } else {
            this.group = {
              groupId: res.groupId,
              title: res.title,
              students: [],
            };
            this.setCurrentGroup(this.group);
          }
        })
        .catch((res) => {
          this.$message({
            type: "error",
            message: res.message,
          });
        });
    },
    setTitle: function () {
      let length = this.list ? this.list.length : 0;
      let strLength = `第${length + 1}小组`; // `第${length + 1}组`
      if (length > 0) {
        this.list.forEach((group) => {
          if (group.title == strLength) {
            length++;
            strLength = `第${length + 1}小组`;
          }
        });
      }
      return strLength;
    },
    getRestLeadList() {
      getGroupMembers(
        this.classId,
        this.checkCurrentGroup.groupId > 0 ? this.checkCurrentGroup.groupId : 0
      )
        .then((res) => {
          if (res.code === 200) {
            this.group.students = res.students;
            this.group.groupId = this.checkCurrentGroup.groupId;
            this.studentList = this.group.students;
            this.title = res.title;
            setTimeout(() => {
              this.leaderShow = false;
            }, 500);
          } else {
            this.$message({
              type: "error",
              message: res.message,
            });
          }
        })
        .catch((res) => {
          console.log(res);
        });
    },
    getStudentList() {
      if (this.checkCurrentGroup.groupId === -1) {
        getNoGroupStudents(this.classId)
          .then((res) => {
            if (res.code === 200) {
              this.group.students = res.noGroupStudents;
              this.group.groupId = this.checkCurrentGroup.groupId;
              this.studentList = this.group.students;
            }
          })
          .catch((res) => {
            console.log(res);
          });
      } else {
        getGroupMembers(
          this.classId,
          this.checkCurrentGroup.groupId > 0
            ? this.checkCurrentGroup.groupId
            : 0
        )
          .then((res) => {
            if (res.code === 200) {
              this.group.students = res.students;
              this.group.groupId = this.checkCurrentGroup.groupId;
              this.studentList = this.group.students;
              this.title = res.title;
            } else {
              this.$message({
                type: "error",
                message: res.message,
              });
            }
          })
          .catch((res) => {
            console.log(res);
          });
      }
    },
    addStudent() {
      this.setCurrentGroup(this.group);
      this.$router.push({
        name: "addGroupStudent",
        query: {
          classId: this.classId,
          ocId: this.ocId,
        },
      });
    },
    goEditGroup(item) {
      this.setCurrentStuent(item);
      this.setCurrentGroup(this.group);
      this.$router.push({
        name: "editClassGroup",
        query: {
          classId: this.classId,
          ocId: this.ocId,
        },
      });
    },
    editGroup() {
      //const this = this
      if (this.title == "") {
        this.$message({
          type: "error",
          message: "名称不能为空",
        });
        return false;
      }
      if (this.title.length > 100) {
        this.$message({
          type: "error",
          message: "小组名称不能超过100字符",
        });
        return false;
      }
      if (this.title == this.group.title) {
        this.isEditTitle = false;
        return false;
      }
      editGroup(this.classId, this.group.groupId, this.title)
        .then((res) => {
          if (res) {
            if (res.code === 200) {
              this.group.title = this.title;
              this.$message({
                 type: "success",
                message: '修改成功',
              })
            } else {
              this.$message({
                type: "error",
                message: res.message,
              });
            }
          }
          setTimeout(()=>{
            this.cancelEdit();
          },1000)
        })
        .catch((res) => {
          this.$message({
            type: "error",
            message: "修改失败",
          });
        });
    },
    cancelEdit() {
      this.title = this.group.title;
      this.isEditTitle = false;
    },
    deleteGroup() {
      this.$dialog
        .confirm({
          title: "提示",
          message: "确定删除小组？",
          confirmButtonText: "确定",
        })
        .then(() => {
          // on confirm
          deleteGroup(this.classId, this.group.groupId)
            .then((res) => {
              this.$message({
                type: "success",
                message: "删除成功",
              });
              this.$router.back();
            })
            .catch((res) => {
              this.$message({
                type: "error",
                message: "修改失败",
              });
            });
        })
        .catch(() => {
          // on cancel
        });
    },

    choseGruop(item) {
      this.choseLeaderStu = item;
      this.choseLeaderIndex = item.index;
    },
    comfimGroup() {
      if (!this.choseLeaderStu) {
        this.choseLeaderStu = this.leaderAction[choseLeaderIndex];
      }
      this.groupShow = false;
      if (!this.axiosFlag) {
        this.axiosFlag = true;
        setTimeout(() => {
          setGroupLeader(
            this.classId,
            this.checkCurrentGroup.groupId,
            this.choseLeaderStu.userId
          )
            .then((res) => {
              this.choseLeaderStu = null;
              this.$message({
                type: "success",
                message: "重设组长成功",
              });

              this.getRestLeadList();
              this.choseLeaderStu = null;
              this.choseLeaderIndex = 0;
              this.axiosFlag = false;
            })
            .catch((res) => {
              console.log(res);
              this.axiosFlag = false;
            });
        }, 100);
      }
    },
    doedit() {
      this.isEditTitle = true;
      this.$nextTick(() => {
        this.$refs.input.focus();
      });
    },
    cancleEdit(){
     this.isEditTitle = false;
    },
    cancleGroup() {
      this.leaderShow = false;
      this.choseLeaderStu = null;
    },
    ...mapActions("currentGroup", ["setCurrentGroup"]),
    ...mapActions("currentGroup", ["setCurrentStuent"]),
  },
  directives: {
    focus: {
      // 指令的定义
      inserted: function (el) {
        el.focus();
      },
    },
  },
  components: {
    SearchGroup,
  },
};
</script>
<style lang="scss" scoped>
.editGroupBox {
  position: absolute;
  top: 0px;
  bottom: 0px;
  left: 0px;
  right: 0px;
  background-color: #f5f5f5;
  .editList {
    margin: 0px;
    padding: 15px 16px;
    background-color: #fff;
    .cancleBtn {
      font-size: 16px;
      color: #444444;
      letter-spacing: 0;
      line-height: 24px;
      font-weight: 400;
    }
    .comfimBtn {
      font-size: 16px;
      color: #ea5a47;
      letter-spacing: 0;
      text-align: right;
      line-height: 24px;
      font-weight: 400;
    }
  }
}
@supports (top: constant(safe-area-inset-top)) or
  (top: env(safe-area-inset-top)) {
  .editGroupBox {
    top: constant(safe-area-inset-top) !important;
    top: env(safe-area-inset-top) !important;
    bottom: constant(safe-area-inset-bottom) !important;
    bottom: env(safe-area-inset-bottom) !important;
  }
}
.search-wrapper {
  padding: 16px;
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
.groupList {
  margin: 0 16px;
  padding: 15px 0px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  // height: 60px;
  border-bottom: 1px solid #f1f3f7;
  .desc {
    flex: 1;
    margin-right: 24px;
  }
  .desc1 {
    margin-right: 10px;
  }
  .sl1 {
    flex: 1;
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
.showGroup{
  align-items: flex-start;
  .sl1{
    margin-top: 4px;
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
  background-color: #fff;
}

.addStuListBox {
  background-color: #fff;
  margin-top: 16px;
  .addStuBtn {
    color: #ea5947;
    height: 52px;
    line-height: 52px;
    padding: 0 16px;
  }
  .btnList {
    color: #ea5947;
    height: 40px;
    line-height: 40px;
    padding: 0 16px;
    .addBtn {
      margin-right: 10px;
    }
  }
}
.addStuListBox1 {
  margin-top: 0px;
}
.input-text {
  width: 100%;
  padding: 0px 10px;
  height: 36px;
  outline: none;
  border: none;
}
.confirmEdit {
  background-color: #ea5947;
  color: #fff;
  margin-right: 10px;
  padding: 3px 10px;
  border: none;
  border-radius: 3px;
}
.cancelEdit {
  background-color: #fff;
  color: #ea5947;
  padding: 3px 10px;
  border: none;
  border-radius: 3px;
}
.class-list {
  padding: 0 16px;
  li {
    // display: flex;
    align-items: center;
    border-bottom: solid 1px #f1f3f7;
    padding: 15px 0px;
    .text {
      flex: 1;
      padding-left: 32px;
      font-size: 16px;
    }
    .studentInfo {
      display: flex;
      flex: 1;
      .info {
        flex: 1;
        .stuName {
          font-size: 16px;
          color: #444444;
          letter-spacing: 0;
          line-height: 24px;
          font-weight: 500;
          margin-bottom: 8px;
          // overflow: hidden;
          // text-overflow: ellipsis;
          // display: -webkit-box;
          // -webkit-line-clamp: 2;
          // line-clamp: 2;
          // -webkit-box-orient: vertical;
        }
        .groupLeader {
          color: #ea5947;
        }
        .stuInfo {
          span{
            flex:1;
          }
          font-size: 15px;
          color: #969696;
          letter-spacing: 0;
          line-height: 22.5px;
          font-weight: 400;
          display: flex;
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
    .editGroupBtn {
      color: #969696;
      letter-spacing: 0;
    }
  }
}
.leaderBox {
  //position: relative;
  .btn {
    background: #fafafa;
    height: 56px;
    line-height: 56px;
    padding: 0 16px;
    text-align: center;
    position: absolute;
    width: 100%;
    top: 0px;
    .cancleBtn {
      font-size: 14px;
      color: #969696;
      float: left;
    }

    .confimBtn {
      font-size: 14px;
      color: #ea5a47;
      float: right;
    }
  }
  .studentList{
    margin-top: 56px;
  }
  li {
    padding: 18px 16px;
    // text-align: center;
    // overflow: hidden;
    // text-overflow: ellipsis;
    // display: -webkit-box;
    // -webkit-line-clamp: 2;
    // line-clamp: 2;
    // -webkit-box-orient: vertical;
  }
  li.active {
    background: #f5f5f5;
    color: #ea5947;
  }
}
input[type="search"]::-webkit-search-cancel-button {
  -webkit-appearance: none;
  position: relative;
  height: 15px;
  width: 15px;
  background: url("../../../assets/images/close.png") no-repeat center;
  background-size: 100% 100%;
}
input[type="search"]::-ms-clear {
  color: transparent;
  position: relative;
  height: 15px;
  width: 15px;
  background: url("../../../assets/images/close.png") no-repeat center;
  background-size: 100% 100%;
}
</style>
