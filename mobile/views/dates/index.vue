<template>
  <div class="mb-page">
    <NavigationBar :title="title">
      <template v-slot:right>
        <span class="color-primary" @click="saveTime">确认</span>
      </template>
    </NavigationBar>
    <div class="mb-body">
      <van-swipe :loop="false" :show-indicators="false" :autoPlay="false">
        <van-swipe-item>
          <DatePickery :value="currentTime" @input="(date) => input(date)" />
        </van-swipe-item>
      </van-swipe>
      <div @click="showTimePicker" class="hour">
        <span class="text">{{ currentHour }}</span>
        <van-icon name="arrow-down" class="icon" />
      </div>
      <van-popup v-model="show" position="bottom" class="dataPick">
        <van-datetime-picker
          v-model="selectHour"
          type="time"
          title="选择时间"
          @confirm="doSelectHour"
          @cancel="cancleSelectHour"
        />
      </van-popup>
      <van-popup v-model="errshow" class="errorPop">
        <div class="errtext">{{ errorMessage }}</div>
        <div class="subBtn" @click="cancleShowError">确定</div>
      </van-popup>
    </div>
  </div>
</template>
<script>
import DatePickery from "./DatePicker";
// import UPage from "common/components/u-page"
import { formatDate } from "./date.js";
// import * as Util from "common/utils/common"
// import * as ULoading from "common/js/UDialog"
import { mapGetters, mapActions } from "vuex";
export default {
  components: {
    DatePickery,
  },
  data() {
    return {
      userID: this.$route.params.userId,
      type: this.$route.params.type, //判断是选择开始还是结束时间
      currentHour: "",
      currentTime: "",
      selectHour: "",
      selectTime: "",
      show: false,
      errshow: false,
      errorMessage: "",
      title: "",
    };
  },
  computed: {
    ...mapGetters("choseDate", { choseModel: "choseModel" }),
  },
  created() {
    if (this.type == 1) {
      this.title = "设置开始时间";
    } else if (this.type == 2) {
      this.title = "设置提交截止时间";
    } else if(this.type==3){
      this.title = "设置成绩公布时间";
    }else{
       this.title = "设置互评截止时间";
    }
    this.init();
    
  },
  activated() {
    this.type = this.$route.params.type;
    this.init();
  },
  methods: {
    //  初始化
    init() {
      const _this = this;
      if (this.type == 1) {
        var time = this.choseModel.choseStartDate;
      } else if(this.type == 2){
        var time = this.choseModel.choseEndDate;
      }else if(this.type == 3){
        var time = this.choseModel.gradePublishTime;
      }else{
        var time = this.choseModel.peerReviewTime;
      }
      if (time) {
        time = this.handleTime(time);
        var startTime = new Date(time);
      } else {
        var startTime = new Date();
      }
      this.currentTime = this.handleTime(startTime);
      this.currentHour = this._formatHours(this.currentTime);
      this.selectHour = this._formatHours(this.currentTime);
      this.selectTime = this.handleTime(startTime);
    },
    // ios时间问题显示
    handleTime(time) {
      if (time) {
        if (Object.prototype.toString.call(time) === "[object String]") {
          time = time.replace(/-/g, "/");
        }
        return new Date(time);
      }
      return "";
    },
    _formatHours(hour) {
      return hour ? formatDate(hour, "hh:mm") : "00:00";
    },
    // 保存时间
    input(value) {
      this.selectTime = value;
    },
    add0(m) {
      return m < 10 ? "0" + m : m;
    },
    // 同步时间到Tab
    _getFullTime(times, hours) {
      if (times) {
        var year = times.getFullYear();
        var month = this.add0(times.getMonth() + 1);
        var day = this.add0(times.getDate());
        var gethour = hours ? hours : "00:00";
        let time = `${year}/${month}/${day} ${gethour}`;
        return time;
      } else {
        return "";
      }
    },
    saveTime() {
      console.log(this.selectTime, this.currentHour);
      var time = this._getFullTime(this.selectTime, this.currentHour);
      console.log(time);
      time = new Date(time).getTime();
      console.log(time);
      // if (this.type == 1) {
      //   if (this.choseModel.choseEndDate) {
      //     if (time > new Date(this.choseModel.choseEndDate).getTime()) {
      //       this.errorMessage = "作业开始时间不能晚于提交截止时间";
      //       this.errshow = true;
      //       return;
      //     }
      //   }
      // } else if(this.type==2){
      //   if (this.choseModel.choseStartDate) {
      //     if (time < new Date(this.choseModel.choseStartDate).getTime()) {
      //       this.errorMessage = "提交截止时间必须晚于作业开始时间";
      //       this.errshow = true;
      //       return;
      //     }
         
      //   }
      //    if(time < new Date()){
      //       this.errorMessage = "提交截止时间必须晚于当前时间";
      //       this.errshow = true;
      //       return;
      //     }
      //     if(this.choseModel.gradePublishTime){
      //       if(time > new Date(this.choseModel.gradePublishTime).getTime()){
      //        this.errorMessage = "提交截止时间不能晚于成绩公布时间";
      //       this.errshow = true;
      //       return;
      //     }
      //     }
      // }else if(this.type==3){
      //   if (this.choseModel.choseEndDate) {
      //     if (time < new Date(this.choseModel.choseEndDate).getTime()) {
      //       this.errorMessage = "成绩公布时间必须晚于提交截止时间";
      //       this.errshow = true;
      //       return;
      //     }
      //   }
      //   if (this.choseModel.peerReviewTime) {
      //     if (time < new Date(this.choseModel.peerReviewTime).getTime()) {
      //       this.errorMessage = "成绩公布时间必须晚于互评截止时间";
      //       this.errshow = true;
      //       return;
      //     }
      //   }
      // }else{
      //    if (this.choseModel.choseEndDate) {
      //     if (time < new Date(this.choseModel.choseEndDate).getTime()) {
      //       this.errorMessage = "互评截止时间必须晚于提交截止时间";
      //       this.errshow = true;
      //       return;
      //     }
      //   }
         
      // }

      if (this.type == 1) {
        this.setchoseModel({
          userID: this.userID,
          choseStartDate: time,
          choseEndDate: this.choseModel.choseEndDate,
          gradePublishTime:this.choseModel.gradePublishTime,
           info:this.choseModel.info,
           peerReviewTime: this.choseModel.peerReviewTime,
        });
      } else if(this.type == 2) {
        this.setchoseModel({
          userID: this.userID,
          choseStartDate: this.choseModel.choseStartDate,
          choseEndDate: time,
          gradePublishTime:this.choseModel.gradePublishTime,
          info:this.choseModel.info,
           peerReviewTime: this.choseModel.peerReviewTime,
        });
      }else if(this.type==3){
        this.setchoseModel({
          userID: this.userID,
          choseStartDate: this.choseModel.choseStartDate,
          choseEndDate: this.choseModel.choseEndDate,
          gradePublishTime:time,
          info:this.choseModel.info,
           peerReviewTime: this.choseModel.peerReviewTime,
        });
      }else{
       this.setchoseModel({
          userID: this.userID,
          choseStartDate: this.choseModel.choseStartDate,
          choseEndDate: this.choseModel.choseEndDate,
          gradePublishTime:this.choseModel.gradePublishTime,
          info:this.choseModel.info,
          peerReviewTime: time,
        });
      }
      this.$router.back();
    },
    showTimePicker() {
      this.show = true;
    },
    cancelHandle() {},
    onBackClick() {
      if (this.model.toClassList) {
        this.$router.replace(`/ClassList/${this.userID}`);
      } else {
        this.$router.back();
      }
    },
    doSelectHour() {
      this.currentHour = this.selectHour;
      this.show = false;
    },
    cancleSelectHour() {
      this.selectHour = this.currentHour;
      this.show = false;
    },
    cancleShowError() {
      this.errshow = false;
    },
    ...mapActions("choseDate", ["setchoseModel"]),
  },
};
</script>
<style lang="scss" scoped>
.mb-body {
  background-color: #fff;
}
.tab {
  height: 56px;
  line-height: 56px;
  font-weight: 600;
  .tab > span {
    display: inline-block;
    height: 100%;
    position: relative;
  }
}

.tabSlider {
  display: block;
  width: 62.5%;
  margin: 0 auto;
  height: 2px;
  background: #ea5947;
}

.tabIndexActive {
  position: relative;
  color: #ea5947;

  &::after {
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 50%;
    height: 2px;
    background-color: #ea5947;
    content: "";
    transform: translateX(-50%);
  }
}

.tabWrapper {
  overflow: hidden;
}

.tabContent {
  & > li {
    float: left;
  }
}

.uButton {
  width: 335px;
  margin: 48px auto 0;
}

.hour {
  position: relative;
  top: 20px;
  width: 140px;
  height: 48px;
  margin: 0 auto;
  text-align: center;
  line-height: 48px;
  border: 1px solid #f97652;
  font-size: 22px;
}

.text {
  color: #ea5947;
}

.icon {
  color: #ea5947;
  margin-left: 8px;
  font-size: 18px;
}
.errorPop {
  padding: 20px 20px 10px;
  .errtext {
    white-space: nowrap;
    font-size: 14px;
  }
  .subBtn {
    margin-top: 20px;
    text-align: center;
    color: #ea5947;
  }
}
.header {
  height: 44px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid #e3e3e9;
  background-color: #fff;
  span:last-child {
    color: #ea5947;
  }
}
.dataPick{
  ::v-deep .van-picker__confirm{
    color:#ea5947;
  }
}
</style>
