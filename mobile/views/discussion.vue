<template>
  <div class="mb-page">
    <NavigationBar title="作业讨论" />
    <div class="mb-body mb-body1">
      <div class="discussionInfo" v-if="groupOrderInfo">
        <div class="tips">
          <span class="iconfont icon-xiaozu"></span>
          <span class="memName">{{ groupOrderInfo.groupName }}</span>
        </div>
        <div class="person">{{ groupOrderInfo.userList.length }}人</div>
        <div class="number">{{ total }}条讨论</div>
      </div>
      <div
        :class="showFlag ? 'discussionVanList' : 'discussionVanList1'"
        v-if="total != 0"
      >
        <van-list
          v-model="loading"
          :finished="finished"
          finished-text=""
          @load="onLoad"
          :immediate-check="false"
          :offset="10"
        >
          <div
            class="discussionList"
            v-for="item in list"
            :key="item.discussId"
          >
            <div class="name">{{ item.userName }}</div>
            <div class="info">
              <Richtext
                @onClose="onImageviewClose"
                @onOpen="onImageviewOpen"
                v-if="item.filecontent"
                :content="item.filecontent"
              ></Richtext>
            </div>
            <Filelist :mode="2" :files="item.fileList" />
            <div class="time">
              <span>{{ item.achievetime | formatDate }}</span>
              <span class="btnBox" v-if="user.userId == item.userId">
                <span class="iconfont icon-bianji" @click="doEdit(item)"></span>
                <span
                  class="iconfont icon-shanchu"
                  @click="doDelete(item)"
                ></span>
              </span>
            </div>
          </div>
        </van-list>
      </div>
      <div class="empty" v-if="total == 0">暂无讨论</div>
      <div class="btn-publish" v-if="showFlag">
        <button @click="doDission()">留言</button>
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
  </div>
</template>
<script>
import { mapGetters, mapActions } from "vuex";
import {
  discussionList,
  delDiscuss,
  groupInfoByOrder,
  reviewGroup,
  getAllGroupDisInfo
} from "@/api/homeworkApi";
import Filelist from "../components/FileList";
import Richtext from "../components/Richtext/richtext.vue";
import { formatDate } from "@/utils/index.js";
import formatDateFilter from '@/mixins/formatDate.js'
export default {
  name:'discussion',
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
      list: [],
      total: 0,
      pageSize: 10,
      currentPage: 1,
      loading: false,
      finished: false,
      groupOrderInfo: null,
      pageAllNum: 0,
      groupOrderList: [],
      groupIndex: 0,
      groupOrder: this.$route.query.currentGroup,
      currentGroup: this.$route.query.currentGroup,
    };
  },
  created() {
    this.init();
    this.groupInfo();
   // this.getGroupList()
    if(this.user.role==8){
       this.getGroupList();
    }else{
      this.getAllGroup()
    }
    
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
    showFlag() {
      return (
        this.user.role == 9 &&
        this.groupOrderInfo &&
        this.groupOrderInfo.groupOrder == this.currentGroup
      );
    },
    ...mapGetters("user", { user: "user" }),
  },
  methods: {
    onImageviewOpen() {
      this.postAppActivityParam({ operation: 3, attach: "1" });
    },
    onImageviewClose() {
      this.postAppActivityParam({ operation: 3, attach: "0" });
    },
    init() {
      discussionList({
        ocId: this.ocId,
        homeworkId: this.homeworkId,
        groupOrder: this.groupOrder,
        //roleId: this.user.role,
        roleId: 8,
        pn: this.currentPage,
        ps: this.pageSize,
      })
        .then((res) => {
          this.total = res.result.total;
          this.pageAllNum = Math.ceil(this.total / this.pageSize);
          this.list = res.result.list;
        })
        .catch((res) => {
          console.log(res);
          this.$message({
            type: "error",
            message: res.result,
          });
        });
    },
    groupInfo() {
      groupInfoByOrder({
        ocId: this.ocId,
        homeworkId: this.homeworkId,
        groupOrder: this.groupOrder,
      })
        .then((res) => {
          this.groupOrderInfo = res.result;
        })
        .catch((res) => {
          console.log(res);
          this.$message({
            type: "error",
            message: res.result,
          });
        });
    },
    doEdit(item) {
      this.$router.push({
        name: "releaseDission",
        query: {
          ocId: this.ocId,
          homeworkId: this.homeworkId,
          discussId: item.discussId,
        },
        params: {
          discuss: item,
        },
      });
    },
    doDelete(item) {
        this.$dialog.confirm({
        title: "提示",
         message: "确定删除吗？",
         confirmButtonText:'确定'
      })
        .then(() => {
          // on confirm
        delDiscuss({
        discussId: item.discussId,
        ocId: this.ocId,
        homeworkId: this.homeworkId,
      })
        .then((res) => {
          this.$message({
            type: "success",
            message: "删除评论成功",
          });
          this.init();
        })
        .catch((res) => {
          console.log(res);
          this.$message({
            type: "error",
            message: res.data,
          });
        });
        })
        .catch(() => {
          // on cancel
        });
     
    },
    doDission() {
      this.$router.push({
        name: "releaseDission",
        query: {
          ocId: this.ocId,
          homeworkId: this.homeworkId,
          discussId: 0,
        },
      });
    },
    onLoad() {
      this.currentPage = this.currentPage + 1;
      if (this.currentPage <= this.pageAllNum) {
        this.loading = true;
        discussionList({
          ocId: this.ocId,
          homeworkId: this.homeworkId,
          groupOrder: this.groupOrder,
          //roleId: this.user.role,
          roleId: 8,
          pn: this.currentPage,
          ps: this.pageSize,
        })
          .then((res) => {
            //this.list = res.result.list;
            this.loading = false;
            // this.total = res.total;
            res.result.list.forEach((item) => {
              this.list.push(item);
            });
          })
          .catch((res) => {
            console.log(res);
            this.$message({
              type: "error",
              message: res.data,
            });
          });
      } else {
        this.finished = true;
      }
    },
    getGroupList() {
      reviewGroup( {
            ocId: this.ocId,
            homeworkId: this.homeworkId,
            groupOrder: this.groupOrder,
            teacherId:this.classIds.length>0?0:this.user.userId,
          },
          this.classIds)
        .then((res) => {
          this.groupOrderList = res.result;
           if(res.result.length!=0){
              res.result.forEach((item,index)=>{
                if(item.groupOrder==this.currentGroup){
                  this.groupIndex=index+1
                }
              })
            }
        })
        .catch((res) => {
          console.log(res);
          this.$message({
            type: "error",
            message: res.data,
          });
        });
    },
    getAllGroup(){
      getAllGroupDisInfo({
        ocId: this.ocId,
        homeworkId: this.homeworkId,
        groupOrder: this.groupOrder,
        teacherId: this.user.userId,
      })
      .then(res=>{
        this.groupOrderList = res.result;
           if(res.result.length!=0){
              res.result.forEach((item,index)=>{
                if(item.groupOrder==this.currentGroup){
                  this.groupIndex=index+1
                }
              })
            }
      })
      .catch(res=>{
          console.log(res);
          this.$message({
            type: "error",
            message: res.data,
          });
      })
     
    },
    preGroup() {
      if (this.groupIndex != 1) {
        this.groupIndex -= 1;
        this.groupOrder = this.groupOrderList[this.groupIndex - 1].groupOrder;
        this.currentPage = 1;
        this.init();
        this.groupInfo();
        //this.getGroupList();
      }
    },
    nextGroup() {
      if (this.groupIndex != this.groupOrderList.length) {
        this.groupIndex += 1;
        this.groupOrder = this.groupOrderList[this.groupIndex - 1].groupOrder;
        this.currentPage = 1;
        this.init();
        this.groupInfo();
       // this.getGroupList();
      }
    },
  },
  components: {
    Richtext,
    Filelist,
  },
};
</script>
<style lang="scss" scoped>
.mb-body1 {
  background-color: #fff;
}
.tips {
  display: flex;
  align-items: flex-start;
}
.discussionInfo {
  margin: 16px;
  padding: 20px 16px;
  background-image: linear-gradient(-23deg, #f6937d 0%, #ea5a47 100%);
  box-shadow: 0 5px 8px 0 rgba(234, 90, 71, 0.25);
  border-radius: 4px;
  margin-bottom: 0px;
  .icon-xiaozu {
    font-size: 18px;
    color: #fff;
  }
  .memName {
    margin-left: 6px;
    font-size: 16px;
    color: #ffffff;
    letter-spacing: 0;
    text-align: left;
    line-height: 20px;
    font-weight: 500;
  }
  .person {
    font-size: 15px;
    color: #ffffff;
    letter-spacing: 0;
    line-height: 20px;
    font-weight: 400;
    opacity: 0.6;
    margin: 8px 0px;
  }
  .number {
    font-size: 15px;
    color: #ffffff;
    letter-spacing: 0;
    line-height: 20px;
    font-weight: 400;
    opacity: 0.6;
  }
}
.discussionVanList {
  margin-bottom: 90px;
}
.discussionVanList1 {
  margin-bottom: 40px;
}
.discussionList {
  margin: 0px 16px;
  padding: 16px 0px;
  border-bottom: 1px solid #e3e3e9;
  .name {
    font-size: 16px;
    color: #444444;
    letter-spacing: 0;
    line-height: 24px;
    font-weight: 600;
  }
  .info {
    font-size: 14px;
    color: #444444;
    letter-spacing: 0;
    line-height: 21px;
    font-weight: 400;
    margin: 4px 0px;
  }
  .time {
    font-size: 14px;
    color: #969696;
    letter-spacing: 0;
    line-height: 21px;
    font-weight: 400;
    .btnBox {
      float: right;
      .icon-shanchu {
        margin-left: 20px;
      }
    }
  }
}
.btn-publish {
  width: 100%;
  // padding: 20px 20px 20px;
  position: fixed;
  bottom: 50px;
  button {
    width: 100%;
    height: 50px;
   // background-image: linear-gradient(180deg, #f97652 0%, #ea5947 100%);
    background-color: #ea5947;
    //box-shadow: 0px 5px 10px 0px rgba(234, 89, 71, 30%);
    //border-radius: 6px;
    outline: none;
    border: none;
    color: #fff;
  }
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
  border-top: 1px solid #e3e3e9;
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
  .btn-publish {
    bottom: calc(50px + constant(safe-area-inset-bottom)) !important;
    bottom: calc(50px + env(safe-area-inset-bottom)) !important;
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
</style>