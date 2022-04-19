<template>
  <div
    class="files-wrapper"
    :class="'files-wrapper-mode' + mode"
    v-if="files.length > 0"
  >
    <div
      class="file-item"
      v-for="(item, index) in files"
      :key="item.fid || +new Date() + index"
    >
      <div class="file-type">
        <img
          :src="item.filePath | fullPath(item.fileType)"
          alt="icon"
          v-if="item.filePath && getImage(item.fileType)"
        />
        <img class="icon" :src="item.fileType | icon" alt="icon" v-else />
      </div>
      <div class="info" v-if="mode === 1" @click="goResourcesPreview(item)">
        <span class="name">{{ item.fileName }}</span>
        <div class="size-action">
          <span class="size">{{ item.fileSize | size }}</span>
          <span v-if="!isPreview">
            <span class="wait" v-if="item.status === 1">等待上传</span>
            <span class="progress-wrapper" v-if="item.status === 2">
              <b class="progress">
                <em
                  class="progress-bar"
                  :style="{ width: item.progress + '%' }"
                ></em>
              </b>
              <span class="percent">{{ item.progress + "%" }}</span>
            </span>
            <span
              class="action cancle"
              v-if="item.status === 2 || item.status === 1"
              @click="cancelUpload(item)"
              >取消</span
            >
            <span
              class="error"
              v-if="item.status === 3"
              @click="reUpload(item)"
            >
              <span class="iconfont"></span>
              <span class="action" @click="reUpload(item)">重传</span>
              <span class="action" @click.stop="deleteFile(item)">删除</span>
            </span>
            <span
              class="action"
              v-if="!item.status"
              @click.stop="deleteFile(item)"
              >删除</span
            >
          </span>
          <span v-else>
            <span class="action" @click="goResourcesPreview(item)">查看</span>
            <span class="action" @click="doDown(item)" v-if="!device.isMobile"
              >下载</span
            >
          </span>
        </div>
      </div>
      <div
        class="info"
        v-else-if="mode === 2"
        @click="goResourcesPreview(item)"
      >
        <span class="name">{{ item.fileName }}</span>
        <div class="right">
          <span class="size">{{ item.fileSize | size }}</span>
          <i class="iconfont icon-yemian-xiayiye"></i>
        </div>
      </div>
      <div class="info" v-else>
        <span
          class="name"
          @click="goResourcesPreview(item)"
          style="cursor: pointer"
          >{{ item.fileName }}</span
        >
        <span class="size">{{ item.fileSize | size }}</span>
        <span class="action-groups">
          <span class="action" @click="goResourcesPreview(item)">查看</span>
          <span class="action" @click="doDown(item)" v-if="!device.isMobile"
            >下载</span
          >
        </span>
      </div>
    </div>
  </div>
</template>
<script>
import { formatSize, formatPath } from "@/utils/file";
import { device } from "@/utils/device";
const fileIconJson = {
  video: "video",
  audio: "audio",
  image: "image",
  doc: "doc",
  xls: "xls",
  pdf: "pdf",
  ppt: "ppt",
  zip: "zip",
  txt: "txt",
  other: "other",
};
export default {
  name: "files",
  props: {
    files: {
      type: Array,
      default() {
        return [];
      },
    },
    mode: {
      type: Number,
      default: 1, // 三种模式的附件显示方式
    },
    isPreview: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      device: device,
    };
  },
  mounted() {
    if (this.files.length != 0) {
      this.files.forEach((item) => {
        if (!item.fileType) {
          item.fileType = item.filePath.substr(
            item.filePath.lastIndexOf(".") + 1
          );
        }
      });
    }
  },
  filters: {
    size(size) {
      return formatSize(size);
    },
    icon(type) {
      var fileType = "";
      if (
        type == "png" ||
        type == "jpg" ||
        type == "jpeg" ||
        type == "bmp" ||
        type == "gif" ||
        type == "image"
      ) {
        fileType = "image";
      } else if (type == "pdf") {
        fileType = "pdf";
      } else if (type == "doc" || type == "docx") {
        fileType = "doc";
      } else if (type == "xls" || type == "xlsx") {
        fileType = "xls";
      } else if (type == "ppt" || type == "pptx") {
        fileType = "ppt";
      } else if (type == "zip") {
        fileType = "zip";
      } else if (type == "txt") {
        fileType = "txt";
      } else if (
        type == "mp4" ||
        type == "avi" ||
        type == "mpg" ||
        type == "mpeg" ||
        type == "rm" ||
        type == "rmvb" ||
        type == "wmv" ||
        type == "rmvb" ||
        type == "mov" ||
        type == "mpg" ||
        type == "mkv" ||
        type == "flv" ||
        type == "video"
      ) {
        fileType = "video";
      } else if (
        type == "mp3" ||
        type == "wav" ||
        type == "wma" ||
        type == "audio"
      ) {
        fileType = "audio";
      }
      return require(`@/assets/svg/${fileIconJson[fileType] || "other"}.svg`);
    },
    fullPath(path, type) {
      return formatPath(path, type);
    },
  },
  methods: {
    cancelUpload(file) {
      this.$emit("cancelUpload", file);
    },
    reUpload(file) {
      this.$emit("reUpload", file);
    },
    deleteFile(file) {
      this.$dialog
        .confirm({
          title: "提示",
          message: "确定删除吗？",
          confirmButtonText: "确定",
        })
        .then(() => {
          this.$emit("deleteFile", file);
        })
        .catch(() => {});
      // on confirm
    },
    getImage(type) {
      const imgList = ["png", "jpg", "jpeg", "bmp", "gif", "image"];
      let falg = imgList.includes(type) ? true : false;
      return falg;
    },
    doDown(item) {
      const src = getFullPath(item.filePath);
      window.open(src + `?attname=${encodeURIComponent(item.fileName.trim())}`);
    },
    goResourcesPreview(item) {
      if (!item.status) {
        localStorage.setItem("resource", JSON.stringify(item));
        if (device.isMobile) {
          window.ULplugin.UApp.openNewWindow(
            this.buildLinkPath("/mobile.html#/resourcesPreview"),
            true
          );
          //window.open("/mobile.html#/resourcesPreview")
        } else {
          const { href } = this.$router.resolve({
            name: "ResourcesPreview",
          });
          window.open(href, "_blank");
        }
      }
    },
    buildLinkPath: function (url) {
      return (
        location.origin +
        location.pathname.substring(0, location.pathname.lastIndexOf("/")) +
        url
      );
    },
  },
};
</script>
<style lang="scss" scoped>
@import "~../../styles/variables.scss";
@import "~../../styles/mixin.scss";
.files-wrapper-mode1 {
  // border-top: solid 1px #f1f3f7;
  .file-item {
    display: flex;
    width: 100%;
    &:last-child {
      margin-bottom: 0;
      .info {
        border-bottom: none;
      }
    }
    .file-type {
      margin-right: 12px;
      padding: 14px 0;
      img {
        height: 36px;
        width: 36px;
      }
    }
    .info {
      flex: 1;
      width: 0;
      border-bottom: solid 1px #f1f3f7;
      padding: 14px 0;
      .name {
        display: block;
        @include ellipsis-one(100%);
        color: $--color-text-regular;
        font-size: 16px;
        line-height: 24px;
      }
      .size-action {
        line-height: 22px;
        font-size: 14px;
        .size,
        .wait,
        .percent {
          margin-right: 20px;
          color: $--color-text-secondary;
        }
        .progress-wrapper {
          .progress {
            position: relative;
            display: inline-block;
            margin-right: 10px;
            width: 100px;
            height: 8px;
            background-color: #f3f3f3;
            border-color: $--background-color-base;
            border-radius: 5px;
            vertical-align: middle;
            .progress-bar {
              position: absolute;
              width: 0;
              height: 100%;
              left: 0;
              top: 0;
              background-color: $--color-primary;
              border-radius: 5px;
            }
          }
          .percent {
            display: inline-block;
            vertical-align: middle;
          }
        }
        .action {
          margin-right: 20px;
          @include link;
        }
        .cancle {
          margin-right: 0px;
        }
      }
    }
  }
}
.files-wrapper-mode2 {
  background-color: #fafafa;
  border-radius: 4px;
  .file-item {
    display: flex;
    height: 48px;
    padding: 0 8px;
    align-items: center;
    .file-type {
      margin-right: 8px;
      @include file-type(20px);
    }
    .info {
      display: flex;
      flex: 1;
      align-items: center;
      border-bottom: 1px solid #f1f3f7;
      height: 100%;
      .name {
        flex: 1;
        color: $--color-text-secondary;
        width: 0;
        @include ellipsis-one(none);
      }
      .right {
        margin-left: 16px;
        font-size: 12px;
        .size,
        .iconfont {
          color: $--color-text-secondary;
          display: inline-block;
          vertical-align: middle;
        }
        .size {
          margin-right: 8px;
        }
      }
    }
    &:last-child .info {
      border-bottom: 0;
    }
  }
}
.files-wrapper-mode3 {
  .file-item {
    margin-bottom: 12px;
    @include clearfix;
    cursor: pointer;
    .file-type {
      margin-right: 10px;
      @include file-type(18px);
    }
    .info {
      float: left;
      width: calc(100% - 28px);
      font-size: 12px;
      line-height: 18px;
      @include clearfix;
      .name,
      .size {
        float: left;
        display: block;
        line-height: 18px;
      }
      .name {
        margin-right: 10px;
        @include ellipsis-one(350px);
      }
      .size {
        margin-right: 20px;
        color: $--color-text-secondary;
      }
      .action-groups {
        float: left;
        display: none;
        .action {
          margin-right: 20px;
          @include link;
        }
      }
    }
    &:hover .action-groups {
      display: block;
    }
  }
}
</style>