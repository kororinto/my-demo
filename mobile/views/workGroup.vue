<template>
  <div class="mb-page">
    <NavigationBar title="作业分组">
      <template v-slot:right>
        <span class="color-primary" @click="saveGroup">保存</span>
      </template>
    </NavigationBar>
    <div class="mb-body">
      <div class="topTip" v-if="homeworkId > 0&&type==0">
        <span class="iconfont icon-zuoyexiangqing"></span>
        <div class="tips">
          作业已发布，修改作业分组不会影响班级固定的分组方案。已经提交作业的小组，不能删除或调整成员。
        </div>
      </div>
      <div class="topTip" v-if="homeworkId > 0&&type==1">
        <span class="iconfont icon-zuoyexiangqing"></span>
        <div class="tips">
          修改作业分组不会影响班级固定分组。
        </div>
      </div>
      <div class="doScore">
        <p @click="addGroup">
          <span class="iconfont icon-tianjia"></span>添加小组
        </p>
      </div>
      <ul class="setting-list" v-if="noGroupList.length != 0">
        <li>未分组</li>
        <div v-for="item in noGroupList" :key="item.studentId">
          <li>
            <div class="desc">{{ item.name }}</div>
            <span
              class="iconfont icon-bianji"
              @click="showGroup(0, item)"
            ></span>
          </li>
        </div>
      </ul>
      <ul
        class="setting-list"
        v-for="(item, index) in GroupList"
        :key="item.groupId"
      >
        <li class="groupTitle">
          <div class="desc">{{ item.importGroupName }}</div>
          <span v-if="!item.hasSubmit" class="del" @click="deleteGroup(index)"
            >删除</span
          >
          <span v-if="item.hasSubmit" class="hasSubmit">作业已提交</span>
        </li>
        <div v-for="item1 in item.userList" :key="item1.studentId">
          <li>
            <div class="desc">{{ item1.name }}</div>
            <span
              class="iconfont icon-bianji"
              v-if="!item.hasSubmit"
              @click="showGroup(item, item1)"
            ></span>
          </li>
        </div>
      </ul>
      <van-dialog
        v-model="memberShow"
        title="添加小组"
        show-cancel-button
        confirmButtonText="确定"
        class="group"
        @confirm="doSaveMembers"
        @close="reduction()"
        :before-close="onBeforeClose"
      >
        <input
          type="text"
          class="inp"
          v-if="inpMembers"
          v-model="currentGroupName"
          @input="changeValue($event)"
          v-focus
        />
        <div class="errMessage" v-if="errorFlag">{{ errorMessage }}</div>
        <div class="showinp" v-if="!inpMembers" @click="doInpMembers()">
          <span>{{ groupName }}</span>
        </div>
      </van-dialog>
      <van-action-sheet v-model="groupShow" class="groupList">
        <div class="btn">
          <button class="cancleBtn" @click="cancleGroup">取消</button>
          <button class="confimBtn" @click="comfimGroup">确定</button>
        </div>
        <div v-if="groupAction.length != 0" class="list">
          <ul v-for="item in groupAction" :key="item.index">
            <li
              @click="choseGruop(item)"
              :class="item.index == choseGruopIndex ? 'active' : ''"
            >
              {{ item.name }}
            </li>
          </ul>
        </div>
        <div v-if="groupAction.length == 0" class="noGroup">没有可选的小组</div>
      </van-action-sheet>
    </div>
  </div>
</template>
<script>
import { mapGetters, mapActions } from "vuex";
import { systemGroup, editGroup, groupInfo } from "@/api/homeworkApi";
export default {
  data() {
    return {
      noGroupList: [],
      GroupList: [],
      memberShow: false,
      inpMembers: false,
      show: true,
      groupShow: false,
      choseStudent: null,
      choseGruopIndex: 0,
      classId: this.$route.params.classId,
      classIndex: this.$route.params.index,
      ocId: this.$route.query.ocId,
      type:this.$route.query.type,
      homeworkId:
        this.$route.query.homeworkId > 0 ? this.$route.query.homeworkId : 0,
      indexGroup: null,
      currentGroupName: "",
      errorFlag: false,
      addFlag:false
    };
  },
  created() {
        this.allList = JSON.parse(JSON.stringify(this.checkGroupList)); 
        this.GroupList = JSON.parse(JSON.stringify(this.checkGroupList.groupListBef[this.classIndex].groupList));
        this.noGroupList =JSON.parse(JSON.stringify(this.checkGroupList.groupListBef[this.classIndex].notGroupList));
        systemGroup({
          ocId:this.ocId,
          classIds:[this.classId]
        })
        .then(res=>{
          console.log(res);
        })
        .catch(res=>{
         console.log(res);
        })
  },
  methods: {
    saveGroup() {
      var arr = [];
      var hasNoUser = false;
      this.GroupList.forEach((item) => {
        if (item.userList.length == 0) {
          hasNoUser = true;
          arr.push(item.importGroupName);
        }
      });
      if (hasNoUser) {
        this.$message({
          type:'error',
          message:`【${arr.join(",")}】没有成员`
        })
       // this.$toast(`${arr.join(",")}没有成员`);
      } else {
        this.allList.groupListBef[this.classIndex].groupList = this.GroupList;
        this.allList.groupListBef[this.classIndex].notGroupList = this.noGroupList;
        editGroup(
          {
            classId: this.classId,
            homeworkId: this.homeworkId,
            ocId: this.ocId,
          },
          this.allList
        )
          .then((res) => {
            console.log(res);
            var arr = JSON.parse(JSON.stringify(this.checkGroupList));
            console.log(arr);
            arr.classGroupList.splice(
              this.classIndex,
              1,
              res.result.classGroupList[this.classIndex]
            );
            arr.groupListBef.splice(
              this.classIndex,
              1,
              res.result.groupListBef[this.classIndex]
            );
            console.log(arr);
            this.setGroupList(arr)
            this.$router.back();
          })
          .catch((res) => {
            console.log(res);
            this.$message({
              type: "error",
              message: res.result,
            });
          });
      }
    },
    addGroup() {
      this.memberShow = true;
      this.currentGroupName = this.groupName;
      this.errorFlag=false
    },
    reduction() {
      this.memberShow = false;
    },
    doInpMembers() {
      this.inpMembers = true;
    },
    changeValue(value) {
      if(value!=""){
        this.errorFlag = false;
      }
    },
    onBeforeClose(action, done) {
      if (action == "confirm") {
        return done(false);
      } else {
        return done();
      }
    },
    doSaveMembers() {
      if(!this.addFlag){
        this.addFlag=true
          this.GroupList.forEach((item) => {
        if (!this.errorFlag) {
          if (this.currentGroupName.trim().length < 1) {
            this.errorMessage = "请输入小组名称";
            this.errorFlag = true;
          }
        }

        if (!this.errorFlag) {
          if (this.currentGroupName.trim().length > 100) {
            this.errorMessage = "小组名称不能超过100字符";
            this.errorFlag = true;
          }
        }

        if (!this.errorFlag) {
          if (item.importGroupName == this.currentGroupName) {
            this.errorMessage = "本班已存在同名小组";
            this.errorFlag = true;
          }
        }
      });
      if (!this.errorFlag) {
        setTimeout(() => {
          this.GroupList.push({
            importGroupName: this.currentGroupName,
            groupOrder:
              this.GroupList[this.GroupList.length - 1].groupOrder + 1,
            systemGroupId:
              this.GroupList[this.GroupList.length - 1].systemGroupId + 1,
            hasSubmit: null,
            userList: [],
          });
          this.memberShow = false;
          this.addFlag=false
        }, 1000);
      }else{
        this.addFlag=false
      }
      }
   
    },
    showGroup(type, item) {
      if (type == 0) {
        this.indexGroup = 0;
      } else {
        this.indexGroup = type;
      }
      this.choseStudent = item;
      this.groupShow = true;
    },
    choseGruop(item) {
      this.choseGruopIndex = item.index;
    },
    comfimGroup() {
      this.groupShow = false;
      setTimeout(() => {
        if (this.indexGroup == 0) {
          this.GroupList[this.choseGruopIndex].userList.push(this.choseStudent);
          this.noGroupList.forEach((item, index1) => {
            if (item.userId == this.choseStudent.userId) {
              this.noGroupList.splice(index1, 1);
            }
          });
          this.$message({
            type: "success",
            message: "移动成功",
          });
        } else {
          this.GroupList.forEach((item, index1) => {
            if (item.groupOrder == this.indexGroup.groupOrder) {
              if (index1 == this.choseGruopIndex) {
                return false;
              }
              var arr = item.userList;
              arr.forEach((item1, index2) => {
                if (item1.userId == this.choseStudent.userId) {
                  this.GroupList[index1].userList.splice(index2, 1);
                  this.GroupList[this.choseGruopIndex].userList.push(
                    this.choseStudent
                  );
                }
              });
            }
          });
        }
        this.choseStudent = null;
        this.choseGruopIndex = 0;
        this.$message({
          type: "success",
          message: "移动成功",
        });
      }, 100);
    },
    cancleGroup() {
      this.groupShow = false;
      this.choseStudent = null;
      this.choseGruopIndex = 0;
    },
    getGroupInfo() {
      groupInfo({
        classId: this.classId,
        ocId: this.ocId,
        homeworkId: this.homeworkId,
      })
        .then((res) => {
          if(this.checkGroupList.groupListBef[this.classIndex].groupList.length==res.result.groupListBef[0].groupList.length){
             this.GroupList = res.result.groupListBef[0].groupList;
          this.noGroupList = res.result.groupListBef[0].notGroupList;
          }else{
              this.GroupList = this.checkGroupList.groupListBef[this.classIndex].groupList;
             this.noGroupList =this.checkGroupList.groupListBef[this.classIndex].notGroupList;
          }
          this.allList = res.result;
          
        })
        .catch((res) => {
          console.log(res);
          this.$message({
            type: "error",
            message: res.result,
          });
        });
    },
    deleteGroup(index) {
      this.$dialog
        .confirm({
          title: "提示",
          message: "确定删除吗？",
          confirmButtonText: "确定",
        })
        .then(() => {
          // on confirm
          Array.prototype.push.apply(
            this.noGroupList,
            this.GroupList[index].userList
          );
          this.GroupList.splice(index, 1);
          this.$message({
            type: "success",
            message: "删除成功",
          });
        })
        .catch(() => {
          // on cancel
        });
    },
    ...mapActions("groupList", ["setGroupList"]),
  },
  computed: {
    groupName() {
      return `第${this.GroupList.length + 1}组`;
    },
    groupAction() {
      var arr = [];
      console.log(this.choseStudent,this.indexGroup);
      console.log(this.GroupList);
      if (this.GroupList.length != 0) {
        this.GroupList.forEach((item, index) => {
          if (!item.hasSubmit&&(!this.indexGroup||(item.groupOrder!=this.indexGroup.groupOrder))) {
            arr.push({
              index: index,
              name: `${item.importGroupName}（${item.userList.length}人）`,
            });
          }
        });
      }
      return arr;
    },
    ...mapGetters("choseDate", { choseModel: "choseModel" }),
    ...mapGetters("user", { user: "user" }),
    ...mapGetters("groupList", { checkGroupList: "checkGroupList" }),
  },
  directives: {
    focus: {
      // 指令的定义
      inserted: function (el) {
        el.focus();
      },
    },
  },
};
</script>
<style lang="scss" scoped>
.topTip {
  display: flex;
  padding: 8px 16px;
  background-color: #fff5db;
  .icon-zuoyexiangqing {
    font-size: 18px;
    color: #db9e00;
  }
  .tips {
    margin-left: 16px;
    font-size: 14px;
    color: #c79100;
    letter-spacing: 0.56px;
    line-height: 21px;
    font-weight: 400;
  }
}
.doScore {
  margin: 0px;
  padding: 0 16px;
  display: flex;
  justify-content: space-between;
  height: 56px;
  line-height: 56px;
  background-color: #fff;
  align-items: center;
  p {
    margin: 0;
    color: #ea5947;
    .iconfont {
      font-size: 10px;
      color: #ea5947;
    }
  }
  span {
    flex: 1;
    text-align: right;
    color: #969696;
    font-size: 15px;
  }
  i {
    color: #969696;
  }
}
.score {
  margin: 16px 0px 0px 0px;
  padding: 0 16px;
  display: flex;
  justify-content: space-between;
  height: 56px;
  line-height: 56px;
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
}
.setting-list {
  background-color: #fff;
  margin-top: 16px;
  li {
    margin: 0 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 60px;
    border-bottom: 1px solid #f1f3f7;
    .desc {
      flex: 3;
     // margin-right: 24px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    span {
      flex: 1;
      text-align: right;
      margin-right: 5px;
      color: #969696;
      font-size: 15px;
      margin-left: 20px;
    }
    i {
      color: #969696;
    }
  }
  // li:last-of-type {
  //   border: 0;
  // }
}
.showinp {
  width: 100%;
  height: 36px;
  line-height: 36px;
  padding: 0px 10px;
  background: #f1f3f7;
  border-radius: 2px;
  span {
    font-size: 16px;
    color: #444444;
    letter-spacing: 0;
    text-align: center;
    line-height: 24px;
    font-weight: 400;
  }
  .inpScore {
    float: right;
    font-size: 16px;
    color: #cbcbd1;
    letter-spacing: 0;
    text-align: center;
    line-height: 35px;
    font-weight: 400;
  }
}
.inp {
  width: 100%;
  padding: 0px 10px;
  height: 35px;
}
.errMessage {
  font-size: 14px;
  color: #f60000;
  letter-spacing: 0;
  line-height: 21px;
  font-weight: 400;
}
.groupList {
  .btn {
    background: #fafafa;
    display: flex;
    position: absolute;
    width: 100%;
    top: 0px;
    .cancleBtn {
      flex: 1;
      padding: 10px;
      height: 56px;
      border: 0px;
      position: relative;
      font-size: 16px;
      color: #444444;
      letter-spacing: 0.63px;
      line-height: 22.5px;
      font-weight: 500;
    }
    .cancleBtn::after {
      content: "";
      width: 2px;
      height: 36px;
      position: absolute;
      top: 10px;
      right: 10px;
      background-color: #e3e3e9;
    }
    .confimBtn {
      flex: 1;
      padding: 10px;
      height: 56px;
      border: 0px;
      font-size: 16px;
      color: #ea5a47;
      letter-spacing: 0.63px;
      line-height: 22.5px;
      font-weight: 500;
    }
  }
  li {
    padding: 18px 0px;
    text-align: center;
  }
  li.active {
    background: #f5f5f5;
    color: #ea5947;
  }
  .list{
    margin-top: 56px;
  }
  .noGroup {
    font-size: 15px;
    color: #969696;
    letter-spacing: 0;
    text-align: center;
    font-weight: 500;
    height: 200px;
    line-height: 200px;
  }
}
.groupTitle {
  .del {
    font-size: 14px;
    color: #ea5947;
    letter-spacing: 0;
    line-height: 24px;
    font-weight: 400;
  }
  .hasSubmit {
    font-size: 14px;
    color: #969696;
    letter-spacing: 0;
    text-align: right;
    line-height: 24px;
    font-weight: 400;
  }
}
</style>
<style>
.group .van-dialog__content {
  padding: 30px 20px;
}
.group .van-dialog__header {
  font-size: 18px;
  color: #444444;
  letter-spacing: -0.17px;
  text-align: center;
  line-height: 27px;
  font-weight: 500;
}
</style>

