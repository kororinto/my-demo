<template>
  <van-action-sheet
    v-model="Show"
    class="ul-audio-panel"
    :class="{ min: type == 0 && filePath }"
  >
    <span class="content normal">
      <span class="record" v-show="status === 1">
        <button @click="onStartRecord" class="iconfont icon-zhunbeiluyin"></button
        ><br />
        <span>点击开始录音</span>
      </span>
      <span class="recording" v-show="status === 2">
        <span class="duration">{{ duration | timeFilter }}</span>
        <span class="wave" @click="onStopRecord">
          <img :src="loading" />
        </span>
        <span class="desc">录音中，点击波纹停止</span>
      </span>
      <span class="top" v-show="status === 3 && ulShowDelete">
        <!--  -->
        <ul-audio-tag :ul-path="formatPath(filePath)" :ul-duration="parseInt(totalDuration)" v-if="filePath!=''"></ul-audio-tag>
        <button
          class="again"
          @click="onAgainRecord"
          v-show="
            filePath &&
            (!uploadStatus || uploadStatus === 4 || uploadStatus === 1)
          "
        >
          <i class="iconfont icon-xuanzhuan1"></i><br />
          <span>重录</span>
        </button>
        <button
          class="save"
          @click="onSaveRecord"
          v-show="!uploadStatus || uploadStatus === 4 || uploadStatus === 1"
        >
          <i class="iconfont icon-zhengque"></i><br />
          <span>保存</span>
        </button>
        <!--v-show="uploadStatus !==1"-->
        <!--v-show="uploadStatus ===2"-->
        <!--v-show="uploadStatus ===3"-->
        <span v-show="uploadStatus !== 1">
          <span class="saving" v-show="uploadStatus === 2"
            >保存中{{ parseInt(uploadProcess) }}%...</span
          >
          <button class="cancel" v-show="uploadStatus === 2">取消</button>
          <button
            class="upload-again"
            @click="onReUpload"
            v-show="uploadStatus === 3"
          >
            重新上传
          </button>
          <button
            class="record-again"
            @click="onAgainRecord"
            v-show="uploadStatus === 3"
          >
            重录
          </button>
        </span>
      </span>
    </span>
    <!--v-show="filePath && status === 3"-->
    <div class="recorded" v-show="status === 3 && !ulShowDelete">
      <!--<preview-audio class="record-file"></preview-audio>-->
      <div class="top">
        <ul-audio-tag
           v-if="filePath!=''"
          :ul-path="formatPath(filePath)"
          :ul-duration="parseInt(totalDuration)"
        ></ul-audio-tag>
        <button
          v-show="uploadStatus === 1"
          class="again"
          @click="onAgainRecord"
        >
          <i class="iconfont icon-zhongxin"></i><br />
          <span class="record-again">重录</span>
        </button>
      </div>
      <div class="bottom">
        <slot>
          <textarea
            class="remark"
            v-model="content"
            :placeholder="'备注，非必填，不超过200字'"
          ></textarea>
        </slot>
      </div>
    </div>
    <span
      v-show="ulShowDelete"
      class="close iconfont icon-guanbi1"
      @click="onClose"
    ></span>
  </van-action-sheet>
</template>

<script type="text/ecmascript-6">
//  import PreviewAudio from 'homework/components/universal/worKRecordDetail/previewaudio'
// import { getPlatform } from 'common/utils/platform'
import { device } from "@/utils/device";
import { formatPath } from "@/utils/file"
import {
  creatRecord,
  createUploade,
  fileSize
  // selectFileFromiOS,
  // cancelUpload,
  // createUploader,
  // fileSize,
} from "@/plugins/cordova/index.js";
//import { creatRecord, createUploade } from 'common/js/mobilePlugin'
//import UpRecord from "@/utils/UlRecord.js";
//import Uploader from 'common/js/UUpload'
//import { showConfirm, showAlert } from 'common/js/UDialog'
//import AttachModel from 'homework/model/attachModel'
import UlAudioTag from "../ulAudioTag/ulAudioTag.vue";
import loading from "./pf_recording.gif";

const RECORD_STAR = 1;
const RECORD_ING = 2;
const RECORD_END = 3;
const UPLOAD_STAR = 1;
const UPLOAD_ING = 2;
const UPLOAD_FAILURE = 3;
const UPLOAD_SUCCESS = 4;

export default {
  data() {
    return {
      filePath: this.ulFilePath,
      status: this.ulFilePath ? RECORD_END : RECORD_STAR,
      //        根据有无删除生成类型
      type: this.ulShowDelete ? 1 : 0,
      recording: false,
      uploadStatus: UPLOAD_STAR,
      uploadProcess: 0,
      //        时长
      duration: "",
      totalDuration: 0,
      content: this.ulContent,
      //        录音管理者
      recoder: '',
      loading: loading,
      groupShow: true,
      Show:this.ulShow,
    };
  },
  created() {
    //console.log("show",this.Show);
    //console.log("点击开始录音");
    //console.log(device);
    let _this = this;
    // let platform = getPlatform()
    let isMobile = device.isMobile;
    //          根据平台生成不同的录音对象
    if (isMobile) {
      this.recoder = creatRecord();
      this.recoder.filePath = this.filePath;
    } else {
      this.recoder = UpRecord;
      //console.log("123", this.ulShowDelete);
      if (!this.ulShowDelete) {
        //UpRecord.encoderMp3 = true
      }
    }
    this.recoder.onBeforeStartRecord = function () {
      this.status = RECORD_ING;
    };
    //      录音完成
    this.recoder.onRecordCompleteSuccess = function (url, duration) {
      _this.$emit("onRecordComplete", url);
      _this.filePath = url;
      _this.totalDuration = duration;
    };
  },
  props: {
    //      是否有删除
    ulShowDelete: {
      default: true,
    },
    //      音频路径
    ulFilePath: "",
    ulContent: "",
    ulShow:{
      default:false
    }
  },
  methods: {
    onStartRecord: function () {
      let _this = this;
      this.recoder.startRecord(
        () => {
          // 初始化成功
          _this.$emit("onInitSuccess");
        },
        (msg) => {
          if (!getPlatform().isIOS) {
            showAlert(this, {
              content: msg,
            });
          }
          _this.$emit("onInitFailure", "");
        },
        (duration) => {
          this.$emit("onStartRecord");
          _this.duration = duration;
        }
      );
    },
    formatPath(path){
      return formatPath(path)
    },
    onStopRecord: function () {
      this.$emit("onStopRecord");
      this.recoder.stopRecord();
    },
    onReUpload: function () {
      this.startUploadAudioByPc();
    },
    //      重录
    onAgainRecord: function () {
      //console.log(this.filePath);
      let self = this;
      if (!this.ulShowDelete) {
        showConfirm(this, {
          // content: self.$t('m.reRecord'),
          content: "重录",
          onConfirm() {
            self.$emit("onAgainRecord");
            self.recoder.clearRecord();
            self.filePath = "";
            self.content = "";
            self.status = RECORD_STAR;
          },
        });
        return;
      }
      this.$emit("onAgainRecord");
      this.recoder.clearRecord();
    },
    //      保存录音
    onSaveRecord: function () {
      //        this.$emit('saveRecord', fileName)
      //        this.$emit('onSaveRecord')
      var self=this;
      if (device.isMobile) {
        //console.log("123",this.filePath);
        self.$emit("onMobileSaveRecord",self.filePath);
        self.recoder.clearRecord();
      } else {
        let timestamp = new Date().getTime();
        let fileName = `web/voice/audio${timestamp}${parseInt(
          Math.random() * 10000
        )}.${this.recoder.fileType}`;
        let self = this;
        Uploader.startUpload(this.recoder.fileBlob, fileName);
        Uploader.onUploadProgress = function (total) {
          self.uploadStatus = UPLOAD_ING;
          if (total.percent >= 100) {
            self.uploadStatus = UPLOAD_SUCCESS;
          }
          self.uploadProcess = total.percent;
        };
        Uploader.onInitFailure = function () {
          self.uploadStatus = UPLOAD_FAILURE;
          self.$emit("onUploadFailure");
        };
        Uploader.onUploadCompleteFailure = function () {
          self.uploadStatus = UPLOAD_FAILURE;
          self.$emit("onUploadFailure");
        };
        Uploader.onUploadCompleteSuccess = function (filePath) {
          self._setUploadSuccess(filePath.key);
        };
      }
    },
    startUploadAudioByMobile(success, failure) {
      let self = this;
      let uploader = createUploade();
      uploader.uploadFile(
        this.filePath,
        () => {
          // 进度
        },
        (filePath, remotePath) => {
          //          上传成功回调
          self._setUploadSuccess(remotePath, success);
        },
        () => {
          //          上传失败回调
          self._setUploadFailure(failure);
        }
      );
    },
    startUploadAudio(success, failure) {
      if (getPlatform().isMobile) {
        this.startUploadAudioByMobile(success, failure);
      } else {
        this.startUploadAudioByPc(success, failure);
      }
    },
    startUploadAudioByPc(success, failure) {
      let timestamp = new Date().getTime();
      //let type = this.recoder.encoderMp3 ? 'mp3' : 'wav'
      let fileName = `web/voice/audio${timestamp}${parseInt(
        parseInt(Math.random() * 10000)
      )}.${type}`;
      let self = this;
      Uploader.startUpload(this.recoder.fileBlob, fileName);
      Uploader.onUploadProgress = function (total) {
        self.uploadStatus = UPLOAD_ING;
        if (total.percent >= 100) {
          self.uploadStatus = UPLOAD_SUCCESS;
        }
        self.uploadProcess = total.percent;
      };
      Uploader.onUploadCompleteFailure = function () {
        self._setUploadFailure(failure);
      };
      Uploader.onUploadCompleteSuccess = function (filePath) {
        self._setUploadSuccess(filePath.key, success);
      };
    },
    _setUploadFailure(failure) {
      this.uploadStatus = UPLOAD_FAILURE;
      failure && failure();
      this.$emit("onUploadFailure");
    },
    _setUploadSuccess(filePath, success) {
      //            上传录音成功了
      let fileName = filePath.split("/").pop();
      let model = new AttachModel({
        filePath: filePath,
        fileType: "audio",
        fileName: fileName,
      });
      success && success(model);
      this.$emit("onUploadSuccess", model);
      this.uploadStatus = UPLOAD_SUCCESS;
      if (this.ulShowDelete) {
        this.recoder.clearRecord();
      }
    },

    //      关闭录音
    onClose: function () {
      this.$emit("onClose");
      this.clear();
    },
    //      让组件回到初始可录音状态
    clear: function () {
      if (this && this.recoder) {
        this.recoder.clearRecord();
      }
    },
  },
  filters: {
    timeFilter: function (value) {
      function PrefixInteger(num, n) {
        return (Array(n).join(0) + num).slice(-n);
      }

      var num = value / 60;
      var min = PrefixInteger(parseInt(num), 2);
      var sec = PrefixInteger(parseInt((num % 1) * 60), 2);
      return min + ":" + sec;
    },
   
  },
  computed: {
    recordStuatus() {
      return this.recoder.status;
    },
  },
  watch: {
    recordStuatus(newValue, oldValue) {
      if (newValue === 2) {
        this.status = RECORD_ING;
      } else if (this.recoder.filePath && this.recoder.filePath.length !== 0) {
        this.status = RECORD_END;
      } else {
        this.status = RECORD_STAR;
      }
      this.duration = this.recoder.currentDuration;
    },
    filePath: function (newvlaue) {
      this.$emit("update:ulFilePath", newvlaue);
    },
    content: function (newValue) {
      this.$emit("update:ulContent", newValue);
    },
    ulShow:function(){
     // console.log(this.ulShow);
      this.Show=this.ulShow
    },
    Show:function(){
     if( this.Show==false){
       this.onClose()
     }
    }
  },
  components: {
    UlAudioTag,
  },
};
</script>

<style lang="scss" scoped>
// @import "common/stylus/variable.styl"
.ul-audio-panel {
  height: 200px;
  text-align: center;
  background: white;
  .again {
    margin-left: 8px;
    color: #969696;
     border: none;
     background-color: #fff;
  }

  .save {
    margin-left: 8px;
    color: #ea5947;
     border: none;
     background-color: #fff;
  }

  .content {
    font-size: 14px;
    max-height: 180px;
    position: absolute;
    top: 50%;
    width: 100%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .record button {
    font-size: 48px;
    color: #ea5947;
    background-color: #fff;
    border: none;
    margin-bottom: 8px;
  }

  .top .cancel {
    color: #ea5947;
  }

  * {
    vertical-align: middle;
  }

  .recording {
    display: inline-block;
    width: 100%;
    max-height: 180px;
    padding: 20px 0px;
    position: relative;
  }
  .duration {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    font-size: 18px;
    color: #444;
  }
  .wave {
    padding: 8px 0px;
    display: inline-block;
    width: 100%;
  }

  img {
    width: 100%;
    height: 100%;
  }
  .desc {
    position: absolute;
    left: 0;
    bottom: 0;
    right: 0;
    font-size: 14px;
    color: #969696;
  }
}

.recorded {
  text-align: left;
  height: 100%;
  font-size: 12px;
  padding-top: 88px;
  box-sizing: border-box;
  .top {
    position: absolute;
    left: 0;
    top: 0;
    height: 88px;
    width: 100%;
    border-bottom: 1px solid #e3e3e9;
    line-height: 88px;
    * {
      vertical-align: middle;
    }
  }
  .record-file {
    display: inline;
  }

  .again {
    margin-left: 8px;
  }

  .save {
    margin-left: 8px;
    color: #ea5947;
  }

  .bottom {
    height: 100%;
  }

  .remark {
    width: 100%;
    height: 100%;
  }
}

.close {
  position: absolute;
  right: 10px;
  top: 10px;
  width: 20px;
  height: 20px;
  cursor: pointer;
}
</style>
