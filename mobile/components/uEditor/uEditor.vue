<template>
  <div :class="uName" class="u-editor">
    <quill-editor
      :value="content"
      @input="onInput"
      :id="uName"
      :ref="uId"
      :options="editorOption"
      @blur="onEditorBlur($event)"
      @focus="onEditorFocus($event)"
      @ready="onEditorReady($event)"
    >
    </quill-editor>
    <div class="tool">
      <div class="pluginBox">
        <div class="left">
          <div class="inline" @click="handelClick(2)" v-if="puginFlag == 1">
            <span class="iconfont icon-fujian icon-zhaopian- color-gray"></span>
          </div>
          <span
            class="iconfont icon-luyin2 color-gray"
            @click="handelClick(1)"
            v-if="puginFlag == 1"
          ></span>
        </div>
        <span class="text-count">{{ content | getContent }}字</span>
      </div>
      <div class="limitBox" v-if="puginFlag == 1">超过200M的附件请从电脑端上传</div>
    </div>
    <Filelist
      :files="fileList"
      :mode="1"
      @cancelUpload="cancelUpload"
      @reUpload="reUpload"
      @deleteFile="deleteFile"
    />
    <ActionSheet
      :show="show"
      :actions="actions"
      @select="onSelect"
      cancle-text="取消"
      @cancel="show = false"
    />
    <div class="bottom">
      <ul-audio-panel
        :ul-file-path.sync="filePath"
        :ul-content.sync="audioContent"
        :ul-show-delete="true"
        :ul-show="audioShow"
        @onMobileSaveRecord="onMobileSaveRecord"
        @onClose="onClose"
        ref="audioManger"
        class="audio-input"
      ></ul-audio-panel>
    </div>
  </div>
</template>
<script type="text/ecmascript-6">
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";
import { quillEditor, Quill } from "vue-quill-editor";
import ActionSheet from "../ActionSheet";
import { device } from "@/utils/device";
import Attach from "@/model/attach";

import Filelist from "../FileList/index.vue";
import { formatSizeLimit, formatPath } from "@/utils/file";
import {
  getPictureFromMobile,
  selectFileFromAndroid,
  selectFileFromiOS,
  cancelUpload,
  createUploader,
  fileSize,
} from "@/plugins/cordova/index.js";
import { wordCount } from "@/utils/index.js";
const DATEREMOTEURL = "date-remotoUrl";
const IMGCONTENT = ".image-content";
const IMGFAILdMASK = ".image-content .image-mask";
const IMGFAILd = ".image-content .image-mask .upload-fail";
const IMGPROGRESS = ".image-content .progress";

export default {
  data() {
    return {
      instance: null,
      editorOption: {
        modules: {
          toolbar: [],
          clipboard: {
            // 粘贴板，处理粘贴时候的自带样式
            matchers: [[Node.TEXT_NODE, this.handleCustomMatcher]],
            matchVisual: false,
          },
        },
        placeholder: this.uPlaceholder,
      },
      // content: this.uContent,
      textContent: "",
      editor: {},
      imgCount: 0,
      uploadManger: createUploader(),
      actions: [],
      show: false,
      files: [],
      once: true, //第一次编辑时不调用handleCustomMatcher
      audioShow: false,
      audioContent: "",
      filePath: "",
      uploadList: [],
      qlHeight: "",
    };
  },
  props: {
    uName: {
      type: String,
      defalut: "uEditor",
    },
    uPlaceholder: {
      type: String,
      defalut() {
        return this.$t("resource.placeholder"); // '请输入占位字'
      },
    },
    textLength: {
      type: Number,
      defalut: 0,
    },
    /* 当前编辑器的标签 */
    uId: {
      type: String,
      defalut: "uEditor",
    },
    /* 编辑器的内容 */
    uContent: {
      type: String,
      default: "",
    },
    uMaxLength: {
      type: Number,
      default: -1,
    },
    fileList: {
      type: Array,
      default() {
        return [];
      },
    },
    numLimit: {
      type: Number,
      default: 10,
    },
    /* 附件限制类型， eg: [document, image] */
    fileTypeLimit: {
      type: Array,
      default() {
        return [];
      },
    },
    /* 自定义限制类型， eg: .png,.gif */
    accept: {
      type: String,
      default: "",
    },
    name: {
      type: String,
      default: "fileInput",
    },
    multiple: {
      type: Boolean,
      default: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    copyPaste: {
      type: Number,
      default: 0,
    },
    puginFlag: {
      type: Number,
      default: 1,
    },
  },
  computed: {
    content() {
      var container = document.querySelector(".ql-container");
      if (container) {
        this.hasScroll();
      }
      setTimeout(() => {
        this.once = false;
      });
      return this.uContent;
    },
  },
  watch: {
    content: function (oldValue,newValue) {
      if(wordCount(oldValue)==wordCount(newValue)){
        this.$emit("update:uContent", oldValue);
        this.uContent=oldValue
      }else{
       this.$emit("update:uContent", newValue);
      }
      if (newValue && newValue.length !== 0 && newValue !== null) {
        if (newValue.match(/<img/gi) !== null) {
          this.imgCount = newValue.match(/<img/gi).length;
        }
      } else {
        this.imgCount = 0;
      }
    },
    fileList() {
      this.initData();
    },
  },
  created() {
    window.editor = this;
    this.initData();
  },
  methods: {
    initData() {
      if (this.fileList.length != 0) {
        this.files = [];
        this.fileList.forEach((item) => {
          this.files.push(item);
        });
      } else {
        this.files = [];
      }
    },
    hasScroll() {
      var container = document.querySelector(".ql-container");
      var qlContainer = document.querySelector(".quill-editor");
      qlContainer.scrollTop = container.offsetHeight;
    },
    handelClick(type) {
      // if (this.realNumLimit > 0) {
      if (type == 1) {
        this.audioShow = true;
      } else {
        //console.log(device.platform.ios);
        if (device.platform.ios) {
          this.actions = [
            {
              index: 1,
              //name: this.$t("拍照"),
              name: "拍照",
            },
            {
              index: 2,
              //name: this.$t("选择相册"),
              name: "选择相册",
            },
            {
              index: 3,
              //name: this.$t("选择文件"),
              name: "选择文件",
            },
          ];
        } else {
          this.actions = [
            {
              index: 1,
              //name: this.$t("拍照"),
              name: "拍照",
            },
            {
              index: 2,
              //name: this.$t("从本机选择"),
              name: "从本机选择",
            },
          ];
        }

        this.show = true;
      }

      // } else {
      //   this.$emit("fileCheckError", `附件最多上传${this.numLimit}个`);
      // }
    },
    onSelect(item) {
      if (item.index === 1) {
        const options = {
          srcType: 1,
          mediaType: 2,
          cameraDirection: 0,
          isAndroid: device.platform.android,
        };
        getPictureFromMobile(
          (fileList) => {
            this.beforeUpload(fileList);
          },
          (err) => {
            this.$emit("uploadErr", "上传失败");
          },
          options
        );
      } else if (item.index === 2) {
        const options = {
          srcType: 0,
          mediaType: 2,
          cameraDirection: 0,
          isAndroid: false,
          maxCount: 5 - (this.files.length ? this.files.length : 0),
        };
        if (device.platform.android) {
          const options = {
            maxCount: 5 - (this.files.length ? this.files.length : 0),
          };
          selectFileFromAndroid(
            (fileList) => {
              this.beforeUpload(fileList);
            },
            (err) => {
              this.$emit("uploadErr", "上传失败");
            },
            options
          );
        } else {
          getPictureFromMobile(
            (fileList) => {
              this.beforeUpload(fileList);
            },
            (err) => {
              this.$emit("uploadErr", "上传失败");
            },
            options
          );
        }
      } else if (item.index === 3) {
        if (device.platform.android) {
          const params = {
            typeLimit: this.accept.replace(/,/g, ";"),
          };
          selectFileFromAndroid(
            (fileList) => {
              this.beforeUpload(fileList);
            },
            (err) => {
              this.$emit("uploadErr", "上传失败");
            },
            params
          );
        } else {
          selectFileFromiOS(
            (fileList) => {
              this.beforeUpload(fileList);
            },
            (err) => {
              this.$emit("uploadErr", "上传失败");
            }
          );
        }
      }

      this.show = false;
    },
    onInput(v) {
      this.$emit("onTextChange", v);
    },
    // getEditorContent() {
    //   let content = this.content;
    //   //        console.log(self.editor)
    //   if (this.editor && this.editor.getContents) {
    //     let ele = document.createElement("div");
    //     ele.innerHTML = content;
    //     let nodeArr = ele.querySelectorAll(IMGCONTENT);
    //     if (nodeArr) {
    //       ele.querySelectorAll(IMGCONTENT).forEach(function (item) {
    //         let newNode = document.createElement("img");
    //         if (item.getAttribute(DATEREMOTEURL)) {
    //           newNode.setAttribute("src", item.getAttribute(DATEREMOTEURL));
    //         }
    //         ele.insertBefore(newNode, item);
    //         ele.removeChild(item);
    //       });
    //       content = ele.innerHTML;
    //     }
    //   }
    //   return content;
    // },
    //      获得文本的文字内容
    getEditorText() {
      if (this.editor && this.editor.getText) {
        return this.editor.getText();
      } else {
        return "";
      }
    },
    onEditorBlur: function () {},
    onEditorFocus: function () {
      // console.log("onEditorFocus");
    },
    onEditorReady: function (e) {
      let self = this;
      //console.log(document.querySelector(".ql-editor").className);
      this.editor = this.$refs[this.uId].quill;
      //        this.$refs[this.uId].quill.focus()
      // this.editor.on("text-change", function (delta, oldDelta, source) {
      //   self.$emit("onTextChange", self.content);
      // });
      // 注册blot
      let BlockEmbed = Quill.import("blots/block/embed");

      class LinkBlot extends BlockEmbed {
        static create(value) {
          let node = super.create();
          if (Object.prototype.toString.call(value).slice(8, -1) === "Object") {
            node.setAttribute("class", value.class);
            node.innerHTML = value.innerHTML;
            node.setAttribute("id", value.id);
            node.setAttribute("data-url", value.url);
            node.setAttribute("contenteditable", false);
          } else {
            // 保留原linkblot功能
            node.setAttribute("class", value);
            node.setAttribute("title", node.textContent);
          }
          return node;
        }

        static value(node) {
          return {
            class: node.getAttribute("class"),
            data: node.getAttribute("data"),
            innerHTML: node.innerHTML,
          };
        }
      }

      LinkBlot.blotName = "link";
      LinkBlot.tagName = "section";
      Quill.register(LinkBlot);
    },
    _inserImg(fileList) {
      this.editor.focus();
      let path = formatPath(fileList[0].filePath);
      let id = "image" + new Date().getTime();
      this.editor.insertEmbed(
        this.editor.getSelection().index
          ? this.editor.getSelection().index + 1
          : 1,
        "link",
        {
          class: "image-content",
          id: id,
          url: fileList[0].filePath,
          innerHTML:
            `<img src="${path}" /><div class="image-mask"><button class="upload-fail">` +
            this.$t("upload.fail2") +
            `<i class="iconfont icon-shuaxin1"></i></button></span></div><span class="progress" contenteditable="false">0%</span>`,
        }
      );
      let ele = document.getElementById(id);
      if (!ele.nextSibling) {
        let p = document.createElement("p");
        ele.parentNode.appendChild(p);
      }
      ele.addEventListener("click", () => {
        this.editor.focus();
      });
      this.editor.setSelection(this.editor.getSelection().index + 1, 1);
      this._uploadFile(fileList[0].filePath, ele);
      document.querySelector(IMGFAILd).addEventListener("click", function () {
        this._uploadFile(fileList[0].filePath, ele);
        ele.querySelector(IMGPROGRESS).style.display = "none";
        ele.querySelector(IMGFAILdMASK).style.display = "none";
      });
      setTimeout(() => {
        this._scrollToBottom();
        this.editor.setSelection(this.editor.getSelection().index, 1);
      }, 1000);
    },
    //      上传图片具体实现
    _uploadFile(filePath, ele) {
      this.uploadManger.uploadFile(
        filePath,
        (file, progress) => {
          //console.log("progress", progress);
          ele.querySelector(IMGPROGRESS).style.display = "block";
          ele.querySelector(IMGFAILdMASK).style.display = "none";
          ele.querySelector(IMGPROGRESS).innerHTML =
            parseInt(progress * 100) + "%";
        },
        (file, remotePath) => {
         // console.log("remotePath", remotePath);
          ele.setAttribute(DATEREMOTEURL, remotePath);
          ele.querySelector(IMGPROGRESS).remove();
          ele.querySelector(IMGFAILdMASK).remove();
          ele.querySelector("img").setAttribute("src", remotePath);
        },
        () => {
         // console.log("upload-fail");
          ele.querySelector(IMGPROGRESS).style.display = "none";
          ele.querySelector(IMGFAILdMASK).style.display = "block";
        },
        true
      );
    },
    _scrollToBottom() {
      let ele = document.querySelector(".ql-container");
      let scrollHeight = ele.scrollHeight;
      let clientHight = ele.clientHeight;
      if (scrollHeight > clientHight) {
        ele.scrollTop = scrollHeight - clientHight;
      }
    },
    cancelUpload(file) {
      cancelUpload(file.filePath);
      this.deleteFile(file);
    },
    reUpload(file) {
      setTimeout(() => {
        this.uploadFile(file, true);
      }, 0);
    },
    deleteFile(file) {
      this.files.forEach((item, index) => {
        if (file.filePath == item.filePath) {
          this.files.splice(index, 1);
        }
      });
      this.$emit("update:fileList", this.files);
    },
    uploadFile(file, isReUpload, fileSize) {
      let curfile = file;
      if (!isReUpload) {
        curfile = new Attach({
          fid: Date.now(),
          filePath: file.filePath,
          fileName: file.fileName,
          fileSize: fileSize,
          fileType: file.fileType,
          status: 1,
        });
        this.files.push(curfile);
        //console.log(this.files);
       // console.log("123", this.uploadList);
        this.$emit("update:fileList", this.files);
      }
     // console.log(file);
      this.uploadManger.uploadFile(
        file.filePath,
        (file, progress) => {
          // 上传进度
          curfile.status = 2;
          curfile.progress = parseInt(progress * 100);
        },
        (file, filePath) => {
          //上传成功
          curfile.status = 0;
          curfile.filePath = filePath;
          this.uploadList.push({
            filePath: filePath,
            fileName: curfile.fileName,
            fileSize: curfile.fileSize,
          });
          //console.log(file, curfile);
        },
        (file, status) => {
          //上传失败
          curfile.status = 3;
          //console.log("失败");
        },
        (file, percent) => {
          // 取消上传成功
          curfile.status = 0;
        }
      );
    },
    checkUpload(file, fileSize) {
      const _this = this;
      if (_this.realNumLimit === 0) {
        _this.$emit("fileCheckError", `附件最多上传${_this.numLimit}个`);
        return false;
      }
      // let isInAccept = false;
      // const acceptList = _this.accept.split(",");
      // file.ext = file.fileName
      //   .substring(file.fileName.lastIndexOf("."))
      //   .toLowerCase();
      // for (let i = 0; i < acceptList.length; i++) {
      //   if (acceptList[i] === file.ext) {
      //     isInAccept = true;
      //     break;
      //   }
      // }
      // if (!isInAccept) {
      //   _this.$emit("fileCheckError", `上传附件类型只能是${_this.accept}`);
      //   return false;
      // }
      const message = formatSizeLimit(file.ext, fileSize || 0);
      if (message) {
        _this.$emit("fileCheckError", `上传附件大小只能是${message}`);
        return false;
      }
      return true;
    },
    deleteElement() {
      let ele = document.querySelector(".ql-editor");
      //  console.log();
      // console.log(ele.children[ele.children.length-1]);
      if(ele.children[ele.children.length-1].childNodes[0].nodeType==1&&ele.children[ele.children.length-2].childNodes[0].nodeType!=3){
         if(ele.lastChild.childNodes[0].nodeType==1){
          ele.removeChild(ele.lastChild);
      }
      // console.log(ele.lastChild.childNodes[0]);
      // console.log(ele.lastChild.childNodes[0].nodeType);
      }
     
    },
    beforeUpload(files) {
      //console.log("files",files);
      const _this = this;
     // console.log("buforeupload", files);
      if (this.files.length + files.length > 5) {
        return this.$toast("最多上传5个附件");
      }
      files.forEach((file) => {
        //console.log("123",file);
        var fileUploadSize = "";
        fileSize(
          file.filePath,
          function (fileSize) {
            fileUploadSize = fileSize;
            if (fileUploadSize) {
              const checkResult = _this.checkUpload(file, fileUploadSize);
              if (checkResult) {
                _this.uploadFile(file, false, fileUploadSize);
              }
            }
          },
          function (err) {
           // console.log("err", err);
          }
        );
      });
    },
    //复制时保留图片跟空格，清除其余所有样式
    handleCustomMatcher(node, delta) {
      if (this.once == false) {
        if (this.copyPaste == 0) {
          const opsList = [];
          delta.ops.forEach((op) => {
            if (op.insert && typeof op.insert === "string") {
              opsList.push({
                insert: op.insert,
               // attributes: op.attributes,
              });
            }
          });
          delta.ops = opsList;
          return delta;
        } else {
          //console.log("不允许粘贴");
          this.editor.enable(false)
          const opsList = [];
          delta.ops.forEach((op) => {
            if (op.insert && typeof op.insert === "string") {
              opsList.push({
                insert: '',
                attributes: {copyElemnt:1},
              });
            }
          });
           delta.ops = opsList;
            setTimeout(() => {
              this.editor.enable(true)
              this.editor.focus()
          },500);
          return delta;
        }
      } else {
        return delta;
      }
    },
   
    onMobileSaveRecord(filePath, fileSize) {
      var file = {
        filePath: filePath,
        fileName: `${+new Date()}${parseInt(Math.random() * 10000)}.mp3`,
        fileType: "audio",
      };
      setTimeout(() => {
        this.beforeUpload([file]);
      }, 0);
      this.audioShow = false;
    },
    onClose() {
      this.audioShow = false;
    },
  },
  filters: {
    getContent(content) {
      return wordCount(content);
    },
  },
  components: {
    quillEditor,
    ActionSheet,
    Filelist,
    UlAudioPanel: () => import("../ulAudioPanel/ulAudioPanel.vue"),
  },
};
</script>
<style lang="scss" scoped>
.u-editor {
  min-height: 100px;
  position: relative;
  padding-top: 16px;
  // max-height: 200px;
  // overflow: auto;
}
.homework-editor {
  min-height: 370px;
  .quill-editor {
    max-height: 370px;
    height: 370px;
  }
}
.inline {
  display: inline-block;
  margin-right: 15px;
}
.quill-editor {
  max-height: 200px;
  overflow: scroll;
  ::v-deep {
    .ql-container {
      * {
        -webkit-user-select: text;
        -khtml-user-select: text;
        -moz-user-select: text;
        -ms-user-select: text;
        user-select: text;
      }
    }
    .ql-container.ql-snow {
      border: none;
    }

    .ql-toolbar.ql-snow {
      display: none;
    }

    .ql-editor {
      -webkit-user-select: auto !important;
      -khtml-user-select: auto !important;
      -moz-user-select: auto !important;
      -ms-user-select: auto !important;
      user-select: auto !important;
      padding: 0px 0px;
      font-size: 16px;
      min-height: 120px;
      &.ql-editor.ql-blank::before {
        left: 0px !important;
        font-style: normal;
        color: #dedede;
      }
      img {
        padding: 16px 0px 0px 0px;
      }
    }
    .image-content {
      position: relative;
      p {
        padding-top: 16px;
      }
      & + p {
        padding-top: 0px;
      }

      img {
        padding: 0px;
      }
    }

    .ql-editor {
      height: auto;
      word-break: break-all;
      .progress {
        position: absolute;
        left: 50%;
        top: 50%;
        width: 44px;
        height: 44px;
        line-height: 44px;
        text-align: center;
        transform: translate(-22px, -22px);
        border-radius: 50%;
        font-size: 14px;
        color: white;
        line-height: 44px;
        background: rgba(255, 255, 255, 0);
        border: 2px solid #ffffff;
        box-shadow: 0 2px 4px 0 rgba(255, 255, 255, 0.6);
      }
    }

    .image-mask {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      right: 0;
      background: rgba(0, 0, 0, 0.5);
      .upload-fail {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, 50%);
        background: transparent;
        font-size: 14px;
        line-height: 20px;
        color: #ea5947;
        display: none;
      }
    }
  }
}

.files-wrapper {
  max-height: 400px;
  overflow: auto;
}

.tool {
  .pluginBox {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 52px;
  }
  .left {
    display: flex;
    align-items: center;
    justify-content: center;
    .iconfont {
      font-size: 20px;
    }
  }

  .text-count {
    font-size: 14px;
    color: #969696;
  }
  .limitBox {
    height: 32px;
    line-height: 22px;
    color: #969696;
    font-size: 14px;
  }
}
</style>


