<template>
  <div class="mb-page">
    <NavigationBar :title="resource.fileName"></NavigationBar>
    <div class="mb-body">
      <div class="resoceContent">
        <div class="resDoc" v-if="flag == 2">
          <iframe :src="url" frameborder="0"></iframe>
        </div>
        <div class="res-image" v-else-if="flag == 1">
          <img
            :src="resource.filePath | fullPath(resource.filePath)"
            @click="previewImg(resource)"
            alt=""
          />
        </div>
        <div class="res-audio" v-else-if="flag == 4">
          <audio
            :id="resource.fid"
            :src="resource.filePath | fullPath(resource.filePath)"
            controls="controls"
          ></audio>
        </div>
        <div class="res-video" v-else-if="flag == 3">
          <div class="video-wrapper">
            <video
              width="100%"
              height="100%"
              :id="resource.fid"
              :src="resource | videoPath"
              controls="controls"
            ></video>
          </div>
        </div>
        <div class="res-other" v-else>
          <img src="@/assets/svg/other.svg" alt="" />
          <div class="name">{{ resource.fileName }}</div>
          <div class="size">{{ resource.fileSize | size }}</div>
        </div>
        <div class="download" @click="doDownload(resource.filePath)">
          <span v-if="!isDownload"
            ><span>下载</span>
            <span v-if="resource.fileSize"
              >（{{ resource.fileSize | size }}）</span
            ></span
          >
          <span v-else
            ><span>下载中</span>
            <span>（{{ downloadFile.progress }}%）</span></span
          >
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { formatSize, formatPath } from "@/utils/file";
import { device } from "@/utils/device";
import { exitApp, download } from "@/plugins/cordova/index.js";
import { ImagePreview, Progress } from "vant";
import "mediaelement";
import "mediaelement/build/mediaelementplayer.min.css";
export default {
  name: "resourcesPreview",
  data() {
    return {
      resource: null,
      flag: null,
      url: null,
      isIos: false,
      isDownload: false,
      downloadFile: {
        filePath: "",
        progress: 0,
      },
    };
  },
  filters: {
    size(size) {
      return formatSize(size);
    },
    fullPath(path, type) {
      return formatPath(path, type);
    },
    videoPath(file) {
      let path = formatPath(file.filePath, file.fileType);
      // if (path.toLowerCase().indexOf('.mp4') > -1 || path.toLowerCase().indexOf('.mov') > -1) {
      //   return path
      // }
      return path.substring(0, path.lastIndexOf(".")) + ".mp4";
    },
  },
  created() {
    if (device.platform.ios) {
      this.isIos = true;
    }

    this.resource = JSON.parse(localStorage.getItem("resource"));
    this.getFileType()
    // this.resource = {
    //   fid: "1626163684946",
    //   fileName: "《有匪》by+Priest.txt",
    //   filePath: "https://leicloud.ulearning.cn/discussion/web/1111/1626163684948/848.zip",
    //   fileSize: 1422446,
    //   fileType: "other",
    //   postID: 460042,
    //   status: 0
    // }
    // var type = this.resource.fileType;
    // if (
    //   type == "png" ||
    //   type == "jpg" ||
    //   type == "jpeg" ||
    //   type == "bmp" ||
    //   type == "gif" ||
    //   type == "image"
    // ) {
    //   this.flag = 1;
    // } else if (
    //   type == "pdf" ||
    //   type == "doc" ||
    //   type == "docx" ||
    //   type == "ppt" ||
    //   type == "pptx" ||
    //   type == "txt" ||
    //   type == "xls" ||
    //   type == "xlsx"
    // ) {
    //   this.flag = 2;
    //   this.url =
    //     "https://docs.ulearning.cn" +
    //     "?ssl=1&furl=" +
    //     encodeURIComponent(formatPath(this.resource.filePath));
    // } else if (
    //   type == "mp4" ||
    //   type == "avi" ||
    //   type == "mpg" ||
    //   type == "mpeg" ||
    //   type == "rm" ||
    //   type == "rmvb" ||
    //   type == "wmv" ||
    //   type == "mov" ||
    //   type == "video"
    // ) {
    //   this.flag = 3;
    // } else if (type == "mp3" || type == "wav" || type == "audio") {
    //   this.flag = 4;
    // }
    //console.log(this.resource);
  },
  mounted() {
    if (this.flag == 3 || this.flag == 4) {
      this.player = new MediaElementPlayer(`#${this.resource.fid}`, {
        pluginPath: " /path/to/shims/",
        videoWidth: document.getElementById(this.resource.fid).offsetWidth,
        videoHeight: document.getElementById(this.resource.fid).offsetHeight,
        success: (mediaElement) => {},
      });
    }
  },
  methods: {
    getFileType() {
      const imgList = ["png", "jpg", "jpeg", "bmp", "gif", "image"];
      const documentList = [
        "pdf",
        "doc",
        "docx",
        "ppt",
        "pptx",
        "txt",
        "xls",
        "xlsx",
      ];
      const mp3List = ["mp3", "wav", "audio"];
      const mp4List = [
        "mp4",
        "avi",
        "mpg",
        "mpeg",
        "rm",
        "rmvb",
        "wmv",
        "mov",
        "video",
      ];
      var type = this.resource.fileType;
      if (imgList.includes(type)) {
        this.flag = 1;
      } else if (documentList.includes(type)) {
        this.flag = 2;
        this.url =
          "https://docs.ulearning.cn" +
          "?ssl=1&furl=" +
          encodeURIComponent(formatPath(this.resource.filePath));
      } else if (mp3List.includes(type)) {
        this.flag = 4;
      } else if (mp4List.includes(type)) {
        this.flag = 3;
      }
    },
    closeWindow() {
      window.close();
    },
    previewImg(item) {
      ImagePreview({
        images: [formatPath(item.filePath)],
        showIndex: false,
      });
    },
    down(url, name) {
      var url1 = formatPath(url);
      window.open(url1 + `?attname=${name}`);
    },
    doDownload(filePath) {
      if (this.flag == 3) {
        var path = filePath.substring(0, filePath.lastIndexOf(".")) + ".mp4";
      } else if (this.flag == 4) {
        var path = filePath.substring(0, filePath.lastIndexOf(".")) + ".mp3";
      }
      if (path) {
        this.downloadFile.filePath = path;
      } else {
        this.downloadFile.filePath = filePath;
      }

      this.isDownload = true;
      var self = this;
      console.log(this.downloadFile);
      window.FilePugin.download(
        this.downloadFile.filePath,
        true,
        function (filePath, progress, b, c) {
          self.downloadFile.progress = progress;
          if (progress == 100) {
            self.isDownload = false;
            self.$message({
              type: "success",
              message: "下载成功",
            });
          }
        },
        function (filePath, localFilePath) {},
        function (filePath, error) {}
      );
      //  download(this.resource)
    },
    onBackClick() {
      exitApp();
    },
  },
};
</script>
<style lang="scss" scoped>
audio,
canvas,
iframe,
img,
svg,
video {
  vertical-align: middle;
}
video,
audio,
img,
svg {
  max-width: 100%;
}
*:focus {
  outline: none;
}

.resoceContent {
  height: 100%;
  position: relative;
  .resDoc {
    height: 100%;
    background-color: #fff;
    iframe {
      border: none;
      width: 100%;
      height: 100%;
      vertical-align: middle;
      background-color: #fff;
    }
  }
  .res-image {
    text-align: center;
    img {
      max-width: 100%;
    }
  }
  .res-audio {
    padding: 24px;
    text-align: center;
  }
}
.download {
  height: 50px;
  background-color: #ffffff;
  position: fixed;
  width: 100%;
  font-size: 18px;
  color: #ea5947;
  text-align: center;
  font-weight: 400;
  line-height: 50px;
  z-index: 9999;
  bottom: 0px;
}
@supports (top: constant(safe-area-inset-top)) or
  (top: env(safe-area-inset-top)) {
  .download {
    bottom: constant(safe-area-inset-bottom) !important;
    bottom: env(safe-area-inset-bottom) !important;
  }
}
.res-other {
  padding-top: 42px;
  text-align: center;
  .size {
    padding: 0 20px;
    font-size: 14px;
    color: #969696;
  }
  .name {
    padding: 16px 20px 8px;
  }
}
.res-video {
  position: relative;
  height: 0;
  padding-bottom: 56.25%;
  .video-wrapper {
    position: absolute;
    display: flex;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    justify-content: center;
    align-items: center;
    background-color: #000;
    video {
      max-width: 100%;
      max-height: 100%;
    }
  }
}
</style>