<template>
  <div class="mb-page">
    <NavigationBar title="小组方案">
      <template v-slot:right v-if="!isEmpty">
        <div
          class="color-primary"
          @click="addGroup"
        >添加小组</div>
      </template>
    </NavigationBar>
    <div class="mb-body">
      <div class="tips" v-if="!isEmpty">
        <span class="iconfont icon-zuoyexiangqing"></span>
        <span class="homeworkTime">您正在修改班级固定分组方案</span>
        <span class="time" v-if="date">{{ date | formatDate }}</span>
      </div>
        <div class="groupListBox">
            <div
              v-for="item in list"
              :key="item.groupId"
              class="groupList van-clearfix"
              @click="doAddGroup(item)"
            >
              <div class="desc">{{ item.title }}</div>
              <div class="sl">
                  <span v-if="item.students!=0">{{ item.students.length }}人</span>
                  <span v-else>无成员</span>
              </div>
              <i class="van-icon van-icon-arrow"></i>
            </div>
        </div>
        <div class="noGroupList" v-if="noGroupList&&noGroupList.length!=0">
            <div
              class="groupList van-clearfix"
              @click="doGroupList()"
            >
              <div class="desc">未分组</div>
              <div class="sl">
                  <span >{{ noGroupList.length }}人</span>
              </div>
              <i class="van-icon van-icon-arrow"></i>
            </div>
        </div>
         <div v-if="isEmpty" class="empty">
       <div class="empty-content">
          <img class="empty-img" :src="image">
          <span>班级没有学生</span>
       </div>
    </div>
    </div>
    <div v-if="loading" class="loading">
      <van-loading color="#ea5947" />
    </div>
   
  </div>
</template>
<script>
import { groupDetail } from "@/api/courseApi";
import SearchGroup from "../components/Search/search.vue";
import { mapGetters, mapActions } from "vuex";
import formatDateFilter from '@/mixins/formatDate.js'
export default {
  name:'classGroup',
  mixins:[formatDateFilter],
  data() {
    return {
      list: [],
      noGroupList:[],
      loading: false,
      topTips: null,
      tipTitle: "",
      date: "",
      isEmpty:false,
      image:require("@/assets/images/es-01.png")
    };
  },
  created() {
      this.getGrouplist()
  },
  mounted() {},
  computed: {
    ocId() {
      return this.$route.query.ocId;
    },
    classId(){
       return this.$route.query.classId;
    },
    ...mapGetters("checkClass", { checkClassList: "checkClassList" }),
    ...mapGetters("user", { user: "user" }),
    ...mapGetters("currentGroup", { checkCurrentGroup: "checkCurrentGroup" }),
  },
  watch: {
 
  },
  methods: {
    getGrouplist() {
      this.loading = true;
      groupDetail(
         this.classId,
      )
        .then((res) => {
            if(res.code==202){
              this.isEmpty=true
            }else{
            this.list = res.groupStudents;
            this.noGroupList=res.noGroupStudents
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
    addGroup(){
      this.doAddGroup({groupId: -2})
    },
    doGroupList(){
      this.doAddGroup({groupId: -1})
    },
    doAddGroup(item){
      this.setCurrentGroup(item)
      this.$router.push({
        name: "addGroup",
        query: {
          classId: this.classId,
          ocId: this.ocId,
        },
      });
    },
    ...mapActions("currentGroup", ["setCurrentGroup"]),
  },
  components: {
    SearchGroup,
  },
};
</script>
<style lang="scss" scoped>
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
.groupList {
  margin: 0 16px;
  padding: 15px 0px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  //height: 60px;
  border-bottom: 1px solid #f1f3f7;
  .desc {
    flex: 1;
    margin-right: 24px;
    // overflow: hidden;
    //   text-overflow: ellipsis;
    //   display: -webkit-box;
    //   -webkit-line-clamp: 2;
    //   line-clamp: 2;
    //   -webkit-box-orient: vertical;
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
      z-index: 10;
      width: 100%;
      height: 100%;
      background-color: #fff;
      .empty-content{
        height: 100%;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
      }
        
       img{
        max-width: 40%;
        margin-bottom: 8px;
       }
          
}
.groupListBox {
  background-color: #fff;
}
.noGroupList{
  background-color: #fff;
  margin-top: 16px;
}
</style>
