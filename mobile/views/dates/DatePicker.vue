<template>
  <div class="calendar">
    <div class="calendarCaption">
      <!-- 切换上一个月 -->
      <button
        @click="prevMonth"
        class="
          iconfont
          icon-zuoye
          hw-calendar-h-month
          switchMonthBtn
        "
      ></button>
      <!-- 显示年月 -->
      <time :datetime="`${year}-${month}`" class="h1">{{ currentMonth }}</time>
      <!-- 切换下一个月 -->
      <button
        v-on:click="nextMonth"
        class="iconfont icon-youye hw-calendar-h-month switchMonthBtn"
      ></button>
    </div>
    <!-- 切换年份 @TODO -->
    <!-- 日历面板 -->
    <dl class="calendarPanel">
      <!-- 星期 -->
      <dt class="row rowWeek">
        <div v-for="(day, index) in weeks" class="cell" :key="index">
          <!-- <div :class="blank"></div> -->
          <div class="item">{{ day }}</div>
        </div>
      </dt>
      <!-- 日期 -->
      <dd v-for="(row, index) in daysMatrix" class="row rowdata" :key="index">
        <div v-for="(it, innerIndex) in row" class="cell" :key="innerIndex">
          <div class="blank"></div>
          <button
            @click="selectDay(it.monthBase + month, it.day)"
            class="item"
            :class="{
              itemExclude: it.monthBase !== 0,
              itemActive: isSelected(it.monthBase + month, it.day),
              itemRules: rules(new Date(year, it.monthBase + month, it.day)),
            }"
          >
            <time :datetime="`${year}-${it.monthBase + month}-${it.day}`">{{
              it.day
            }}</time>
          </button>
        </div>
      </dd>
    </dl>
  </div>
</template>
<script>
import { getDaysMatrix, getPrevMonth, getNextMonth } from "./dateUtils";
export default {
  components: {},
  props: {
    // 指定初始化日期，并同步
    value: {
      default() {
        return new Date();
      },
    },
    // 指定某些日期不可选，暂时只支持函数
    rules: {
      type: Function,
      default: () => false,
    },
  },
  data() {
    return {
      weeks: [
        // this.$t("日"),
        // this.$t("一"),
        // this.$t("二"),
        // this.$t("三"),
        // this.$t("四"),
        // this.$t("五"),
        // this.$t("六"),
        "日",
        "一",
        "二",
        "三",
        "四",
        "五",
        "六",
      ], // 星期排列
      year: new Date().getFullYear(), // 当前年份
      month: new Date().getMonth(), // 当前月份
      selectedDay: new Date(), // 选定日期 默认不选择日期
    };
  },
  computed: {
    daysMatrix() {
      const matrix = getDaysMatrix(this.month, this.year);
      return matrix;
    },
    currentMonth() {
      const month = this.month + 1 + "月";
      return `${this.year}年${month}`;
      // return this.$t("m.currentMonth", { m: this.$t(month), y: this.year });
    },
  },
  watch: {
    value: {
      immediate: true,
      handler(newVal) {
        const date = newVal instanceof Date ? newVal : new Date(newVal);
        if (date.toString() !== "Invalid Date") {
          this.selectedDay = date;
          this.year = date.getFullYear();
          this.month = date.getMonth();
          // 立即同步
        }
      },
    },
  },
  methods: {
    // 选中时间，并把时间与父组件通过v-model同步
    selectDay(month, day) {
      const date = new Date(this.year, month, day);
      if (this.rules(date)) {
        return;
      }
      this.selectedDay = date;
      this.$emit("input", date);
    },
    // 前一个月
    prevMonth() {
      const [month, year] = getPrevMonth(this.month, this.year);
      if (this.rules(new Date(year, month, 1))) {
        return;
      }
      [this.year, this.month] = [year, month];
    },
    // 后一个月
    nextMonth() {
      const [month, year] = getNextMonth(this.month, this.year);
      if (this.rules(new Date(year, month, 1))) {
        return;
      }
      [this.year, this.month] = [year, month];
    },
    // 判断某一天是否被选中
    isSelected(month, day) {
      const date = new Date(this.year, month, day);
      if (this.selectedDay instanceof Date) {
        return (
          this.selectedDay.getFullYear() === date.getFullYear() &&
          this.selectedDay.getMonth() === date.getMonth() &&
          this.selectedDay.getDate() === date.getDate()
        );
      } else {
        return false;
      }
    },
    // 选择今天
    isToday(month, day) {
      const date = new Date(this.year, month, day);
      const today = new Date();
      return (
        today.getFullYear() === date.getFullYear() &&
        today.getMonth() === date.getMonth() &&
        today.getDate() === date.getDate()
      );
    },
  },
};
</script>


<style lang="scss" scoped>
// 日历caption
.calendarCaption {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 5.125%;
  padding: 16px;
}

.h1 {
  font-size: 18px;
}

.switchMonthBtn {
  border: none;
  background-color: transparent;
  font-size: 20px;
  width: 30px;
  height: 30px;
  transform: scale(0.83333);
  color: #ea5947;
}

.uDatePointer {
  font-weight: 600;
}

// 日历panel
// .calendarPanel

// 行
.row {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  text-align: center;
}

.rowWeek {
  height: 40px;
  background: #f5f5f5;
  margin-bottom: 24px;
  padding: 0 8px;
}
.rowdata {
  margin-left: 8px;
}

// 单元格
.cell {
  position: relative;
  flex: 1 1;
}

// 使用空标签撑起高度
.blank {
  padding-bottom: 100%;
}
.calendarPanel {
  margin: 0px;
}
// 实际内容
.item {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  border: none;
  background-color: transparent;
  font-size: 16px;
  &::after {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: -1;
    margin: auto;
    width: 75%;
    height: 75%;
    border-radius: 50%;
    background-color: #fff;
    content: "";
    box-sizing: border-box;
  }
}

.itemExclude {
  color: #dedede;
}
// /.itemToday
// // color #fff
// &::after
// // background-color #ffcf10
// border 2px solid #ea5947
.itemActive {
  color: #fff;
  border-radius: 50%;
  background-color: #ea5947;
  .itemActive::after {
    background-color: #ea5947;
  }
}

.itemRules {
  color: #aaa;
}

[lang="id"] .item {
  font-size: 14pxf;
}
</style>

