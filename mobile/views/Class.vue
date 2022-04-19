<template>
  <div class="mb-page">
    <NavigationBar title="选择班级">
        <template v-slot:right>
          <div class="color-primary" @click="confirm">
            确定<span v-if="selectNum > 0">({{selectNum}})</span>
          </div>
        </template>
      </NavigationBar>
      <div class="mb-body">
        <van-dropdown-menu v-if="permissionGroupId == 1">
          <van-dropdown-item
            v-model="teacherId"
            :options="option1"
            @change="getScreenSelectList()"
          />
        </van-dropdown-menu>
        <div class="search-wrapper">
          <SearchGroup placeholder="搜索" v-model="input" @search="getClassList()"></SearchGroup>
        </div>
        <ul class="class-list clear_float">
          <li>
            <van-checkbox v-model="allcheck" shape="square" checked-color="#ea5947" icon-size="20px">全选</van-checkbox>
            <!-- <div class="text">全选</div> -->
          </li>
          <li v-for="(item, index) in AllClassList" :key="index">
            <van-checkbox  shape="square" checked-color="#ea5947" icon-size="20px" v-model="item.flag" >{{ item.className }}</van-checkbox>
            <!-- <div class="text ellipsis-one">{{ item.name }}</div>   -->
          </li>
        </ul>
      </div>
      <Loading :loadingShow="loadingShow" v-if="loadingShow" />
  </div>
</template>
<script>
import {
  // publishTopic,
  // editTopicDetail,
  getSelectInfo,
 // getClassList,
  getCourseRoleInfo,
  getCourseTeacherList
} from "@/api/courseApi";
import { systemGroup,getClassListByTeacher,teacherTeam ,selectInfo} from "@/api/homeworkApi";
import SearchGroup from '../components/Search/search.vue'
import Loading from "../components/loading/loading.vue"
import { mapGetters, mapActions } from "vuex";
export default {
  data() {
    return {
      AllClassList: [],
      input: "",
      value: "",
      value1: 0,
      ResClassList: [],
      option1: [{ text: "全部教师", value: "" }],
      teacherSet: [],
      permissionGroupId: "", //角色 1管理员2教师3助教
      teacherId: "",
      teacherTeamList:null,
      seletClassList:null,
      checkedList:[],
      teacherList: [],
      loadingShow:false
    };
  },
  created() {
    getCourseRoleInfo(this.ocId)
      .then(data => {
        this.permissionGroupId = data.permissionGroupId
        this.teacherId = data.userId
        //this.selectClass();
        this.getListTea()
        // if (this.permissionGroupId == 1) {
        //    this.getListTea()
        //  }
        //  this.getClassList()
      })
  },
  mounted() {

  },
  computed: {
    ocId () {
      return this.$route.query.ocId
    },
    homeworkId () {
      return this.$route.query.homeworkId
    },
    ...mapGetters(
      "checkClass",
      { checkClassList: "checkClassList" },
    ),
     ...mapGetters("user", { user: 'user' }),
    allcheck: {
      get() {
        //取值
        //every方法，数组中每一项都满足一个条件返回true
        if (this.AllClassList.length < 1) {
          return false
        }
        return this.AllClassList.every((item) => item.flag);
      },
      set(newValue) {
        //设置值
        if(this.value==''){
        this.AllClassList.map((item) => (item.flag = newValue));
        }
      },
    },
    selectNum() {
       this.checkedList = this.AllClassList.filter((item) => item.flag);
      return this.AllClassList.filter((item) => item.flag).length;
    },
    count() {
       this.checkedList = this.AllClassList.filter((item) => item.flag);
      return thischeckedList.length.reduce((total, item) => {
        return total + item.num;
      }, 0);
    },
  },
  methods: {
    getClassList() {
      var arr=this.seletClassList.filter(item =>{
       return  item.className.includes(this.input)
      }
      )
      if(this.input==""){
         this.getSetClassList(this.seletClassList);
      }else{
         this.getSetClassList(arr);
      }
    },
     getListTea() {
        let all = {
        name: '全部教师',
        classes: [],
        userId: 0
      }
      let list = []
      getCourseTeacherList(this.$route.query.ocId)
      .then(res=>{
          var hasTea=false
          if(res.list){
             res.list.forEach(item=>{
           if( item.classes.length!=0){
              this.option1.push({
              value: item.userId,
              text: item.name,
            });
            if(item.userId==this.teacherId){
              hasTea=true
            }
           } 
            item.classes.forEach(cl => {
              if (!list.map(item => item.classId).includes(cl.classId)) {
                list.push(cl)
              }
            })
          })
          }
          all.classes = list
          this.teacherList = [all,...res.list]
         if(!hasTea&&this.permissionGroupId==1){
           this.teacherId=''
         }
         this.getScreenSelectList();
      })
      .catch(res=>{
        console.log(res);
      })
    },
    getScreenSelectList() {
      let result = this.teacherList.filter(item => {
        return item.userId == this.teacherId
      })
      this.seletClassList = result.length > 0 ? result[0].classes : []
      this.getSetClassList(this.seletClassList)
    },
    getSetClassList(arr){
      let hash = {};
        const newArr = arr.reduce((item, next) => {
          hash[next.classId] ? "" : (hash[next.classId] = true && item.push(next));
          return item;
        }, []);
         newArr.forEach((item) => {
          item.flag = false
             for (let i = 0; i < this.checkClassList.length; i++) {
            const element = this.checkClassList[i];
            if(element.classID == item.classId||element.classId == item.classId) {
              item.flag = true
            }
          }
        });
        this.AllClassList = JSON.parse(JSON.stringify(newArr))
    },
    getsystemGroup(classId){
      this.loadingShow=true
     systemGroup({
        classIds:classId,
        ocId:this.ocId,
        userId:this.user.userId,
      })
       .then((res) => {
          this.setGroupList(res.result)
           this.loadingShow=false
          this.$router.back();
        })
        .catch((res) => {
          console.log(res);
          this.loadingShow=false
           this.$message({
              type: "error",
              message: res.data,
            });
        });
    },
    confirm() {
      var checked = this.AllClassList.filter((ele) => ele.flag);
      var arr=[]
      checked.forEach(item=>{
       arr.push(item.classId)
      })
      this.setCheckClassList(checked);
      this.getsystemGroup(arr)
    },
    ...mapActions("checkClass", ["setCheckClassList"]),
    ...mapActions("groupList", ["setGroupList"]),
  },
  components: {
    SearchGroup,
    Loading
  }
};
</script>
<style lang="scss" scoped>
.mb-body{
  background-color: #fff;
}
.search-wrapper{
  padding: 16px;
}
.class-list{
  padding: 0 16px 100px;
  li{
    display: flex;
    height: 56px;
    align-items: center;
    border-bottom: solid 1px #f1f3f7;
    .text{
      flex: 1;
      padding-left: 32px;
      font-size: 16px;
    }
  }
}
.van-checkbox{
  width: 100%;
  ::v-deep .van-checkbox__label{
    margin-left: 32px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
}
</style>