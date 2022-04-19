<template>
  <div></div>
</template>
<script>
import { myGroupOrder, stuInfo } from "@/api/homeworkApi";
export default {
  data() {
    return {
      groupOrder: 0,
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
    activityType(){
       return this.$route.query.activityType > 0
        ? this.$route.query.activityType
        : 0;
    }
  },
  created() {
    myGroupOrder({
      ocId: this.ocId,
      homeworkId: this.homeworkId,
    })
      .then((res) => {
        this.groupOrder = res.result;
        this.getGroupInfo();
      })
      .catch((res) => {
        console.log(res);
         this.$message({
              type: "error",
              message: res.data,
            });
      });
  },
  methods: {
    getGroupInfo() {
      stuInfo({
        ocId: this.ocId,
        homeworkId: this.homeworkId,
        groupOrder: this.groupOrder,
        roleId: 9,
        //roleId:8,
      })
        .then((res) => {
          if (
           ( res.result.publishInfo.homeworkStatus == 1 ||
            res.result.publishInfo.homeworkStatus == 2 )||(!res.result.groupInfo||!res.result.groupInfo.groupOrder)
          ) {
            this.$router.push({
              name: "publishInfo",
              query: {
                ocId: this.ocId,
                homeworkId: this.homeworkId,
                groupOrder: this.groupOrder,
              },
            });
          } else {
            if(this.activityType>0){
               this.$router.push({
              name: "reviewHomework",
              query: {
                ocId: this.ocId,
                homeworkId: this.homeworkId,
                currentGroupOrder: this.groupOrder,
                activityType:this.activityType,
              },
            });
            }else{
              this.$router.push({
              name: "reviewHomework",
              query: {
                ocId: this.ocId,
                homeworkId: this.homeworkId,
                currentGroupOrder: this.groupOrder,
              },
            });
            }
          }
        })
        .catch((res) => {
          console.log(res);
           this.$message({
              type: "error",
              message: res.result,
            });
        });
    },
  },
};
</script>