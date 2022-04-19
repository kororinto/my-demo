<template>
  <div class="search-group">
    <div class="left" @click="search()">
      <i class="iconfont icon-quanshipei-sousuo"></i>
    </div>
    <input
      type="search"
      :value="value"
      :placeholder="placeholder"
      @input="onInput"
      @keydown="onKeydown"
      @compositionstart="compositionSatrt" 
      @compositionend="compositionEnd"
    />
  </div>
    <!-- @compositionstart="compositionSatrt" -->
      <!-- @compositionend="compositionEnd" -->
</template>

<script>
export default {
  name: "SearchComponent",
  props: ["placeholder", "value"],
  data() {
    return {
      flag: true,
      status:true
    };
  },
  methods: {
    onKeydown(e) {
      if (e.keyCode == "13") {
        e.preventDefault();
        this.search();
      }
    },
    onInput(e) {
      // this.$emit("input", e.target.value);
      //   this.$emit("search");
      setTimeout(() => {
        if (this.flag) {
          this.throttle(e)
        }
      }, 100);
    },
    throttle(e){
     if(!this.status){
       return 
     }
     this.status=false
     setTimeout(()=>{
        this.$emit("input", e.target.value);
        this.$emit("search");
       this.status=true
     },400)
    },
    search() {
      this.$emit("search");
    },
    compositionSatrt() {
      this.flag = false;
    },
    compositionEnd() {
      this.flag = true;
    },
  },
};
</script>

<style lang="scss" scoped>
.search-group {
  display: flex;
  padding: 0 12px;
  height: 36px;
  line-height: 36px;
  background-color: #f1f3f7;
  border-radius: 18px;
  .left {
    i {
      font-size: 18px;
      color: #dedede;
      margin-right: 4px;
    }
  }
  input {
    flex: 1;
    line-height: 1;
    padding: 10px 4px;
    border: none;
    outline: none;
    -webkit-appearance:none;
    background-color: transparent;
  }

  input[type="search"]::-webkit-search-cancel-button {
    -webkit-appearance: none;
    position: relative;
    height: 15px;
    width: 15px;
    background: url("../../../../assets/images/close.png") no-repeat center;
    background-size: 100% 100%;
  }
  input[type="search"]::-ms-clear {
    color: transparent;
    position: relative;
    height: 15px;
    width: 15px;
    background: url("../../../../assets/images/close.png") no-repeat center;
    background-size: 100% 100%;
  }
}
</style>