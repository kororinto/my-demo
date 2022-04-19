<template>
<div class="mb-page">
      <div class="searchBox">
      <div class="search-wrapper">
        <SearchGroup
          placeholder="输入小组名称或学生姓名"
          v-model="input"
          @search="getClassList()"
        ></SearchGroup>
      </div>
      <div @click="doCancle" class="cancle">取消</div>
    </div>
    
    <div class="mb-body1">
    
    <div class="searchList">
      <div class="empty" v-if="total == 0">没有找到符合条件的内容</div>
      <div v-else>
        <ul>
          <li class="listBox" v-for="item in list" :key="item.id" @click="review(item)">
            <div class="groupList">
              <div class="desc">{{ item.groupName }}</div>
              <span class="sl"></span>
              <i class="van-icon van-icon-arrow" ></i>
            </div>
            <div class="groupMem">
              <span
                v-for="(item1, index) in item.groupInfo.userList"
                :key="item1.id"
              >
                <span v-if="index == item.groupInfo.userList.length - 1">{{
                  item1.name
                }}</span>
                <span v-else>{{ item1.name }}<span class="font">/</span></span>
              </span>
            </div>
          </li>
        </ul>
      </div>
    </div>
    </div>
  </div>
</template>
<script>
import SearchGroup from "../components/Search/search.vue";
import { submitList } from "@/api/homeworkApi";
export default {
 
  data() {
    return {
      input: "",
      total: -1,
      list: [],
     // isFirst:true
    };
  },
  created() {
    // console.log(this.$route);
    // console.log(this.ocId);
    // submitList({
    //   ocId: this.ocId,
    //   classId: 0,
    //   homeworkId: this.homeworkId,
    //   teacherId: 0,
    //   pn: 1,
    //   ps: 9999,
    // })
    //   .then((res) => {
    //     console.log(res);
    //     // this.loading = false;
    //     this.total = res.result.groupHomeworkList.total;
    //     this.list = res.result.groupHomeworkList.list;
    //   })
    //   .catch((res) => {
    //     console.log(res);
    //      this.$message({
    //           type: "error",
    //           message: res.result,
    //         });
    //   });
  },
   computed: {
    ocId() {
      return this.$route.query.ocId;
    },
    homeworkId() {
      return this.$route.query.homeworkId > 0
        ? this.$route.query.homeworkId
        : null;
    },
    teacherId(){
      return this.$route.query.teacherId;
    },
    classId(){
      return this.$route.query.classId;
    }
  },
  methods: {
    doCancle() {
      this.$router.push({
        name: "homeWorkList",
        query: {
          ocId: this.ocId,
          homeworkId: this.homeworkId,
        },
      });
    },
    getClassList(){
         submitList({
      ocId: this.ocId,
      classId: this.classId,
      homeworkId: this.homeworkId,
      teacherId: this.teacherId,
      studentName:this.input,
      pn: 1,
      ps: 9999,
    })
      .then((res) => {
        this.isFirst=false
        console.log(res);
        // this.loading = false;
        this.total = res.result.groupHomeworkList.total;
        this.list = res.result.groupHomeworkList.list;
      })
      .catch((res) => {
        console.log(res);
         this.$message({
              type: "error",
              message: res.data,
            });
      });
    },
    review(item){
        console.log(item);
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
  components: {
    SearchGroup,
  },
};
</script>
<style lang="scss" scoped>
.mb-body1{
 flex: 1;
  overflow: auto;
  background-color: #fff;
}
.searchBox {
    display: flex;
    position: relative;
    justify-content: space-between;
    align-items: center;
    height: 44px;
    padding: 0px 16px;
   // border-bottom: solid 1px #e3e3e9;
    background-color: #fff;
 // display: flex;
  background-color: #fff;
  //padding: 10px 16px;
  border-bottom: 1px solid #f1f3f7;
}
.search-wrapper {
  flex: 1;
}
.cancle {
  font-size: 16px;
  color: #444444;
  letter-spacing: 0.63px;
  text-align: right;
  line-height: 20px;
  font-weight: 400;
  padding: 0px 10px;
  //padding-top: 10px;
}
.searchList {
  padding: 0px 16px;
  background-color: #fff;
}
.empty {
  font-size: 15px;
  color: #969696;
  letter-spacing: 0;
  line-height: 400px;
  font-weight: 400;
  text-align: center;
}
.groupList {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  margin-bottom: 10px;
  .desc {
    flex: 1;
    margin-right: 24px;
  }
  span {
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
.listBox {
  border-bottom: 1px solid #f1f3f7;
  padding-bottom: 15px;
}
.groupMem {
  margin-top: -10px;
  span {
    font-size: 14px;
    color: #444444;
    letter-spacing: 0;
    line-height: 21px;
    font-weight: 400;
  }
  .font {
    margin: 0px 5px;
  }
}
.desc {
  font-size: 16px;
  color: #444444;
  letter-spacing: 0;
  line-height: 24px;
  font-weight: 500;
  overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
}
</style>