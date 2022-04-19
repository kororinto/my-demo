<template>
  <div class="ul-audio-tag" @click="handleAudio($event)">
    <audio ref='player' v-if="ulPath" v-bind:src="ulPath">
      <source v-bind:src="ulPath" type="audio/mpeg">
    </audio>
    <span class="audioicon " :class="{playingicon:isPlaying}"></span>
    <span class="duration">{{residueduration}}</span>
  </div>
</template>
<script type="text/ecmascript-6">
  import { playAudio, stopAudio } from '@/plugins/cordova/index.js'
import { device } from "@/utils/device";

  export default {
    data () {
      return {
        curtime: null,
        duration: this.ulDuration || 0,
        isPlaying: false,
        isMobile: device.isMobile,
        isEnd: false,
        isBind: false,
        isLocal: this.ulPath.indexOf('cdvfile://') === -1 || this.ulPath.indexOf('file:///') === -1
      }
    },
    props: {
//      音频的路径
      ulPath: {
        default: '',
        type:
        String
      },
//      音频的时间
      ulDuration: {
        default:
          0,
        type:
        Number
      }
    },
    methods: {
      handleAudio (event) {
        var el = event.currentTarget
        var audio = el.querySelector('audio')
        if (el && !this.isBind && !(this.isLocal && this.isMobile)) {
          this.addEvent4AudioListeners()
        }
        if (!this.isPlaying) {
          if (this.isLocal && this.isMobile) {
//            alert(this.ulPath)
            playAudio(this.ulPath, this._endplay, this._currentTime)
          } else {
            audio.play()
          }

          this.isPlaying = true
        } else {
//          audio.pause()
          if (this.isLocal && this.isMobile) {
            stopAudio()
          } else {
            audio.pause()
          }
          this.isPlaying = false
        }
      },
      addEvent4AudioListeners () {
        const self = this
        self.$refs.player.addEventListener('timeupdate', self._currentTime)
        self.$refs.player.addEventListener('canplay', self._durationTime)
        self.$refs.player.addEventListener('ended', self._endplay)
      },
      remove4AudioListeners () {
        const self = this
        self.$refs.player.addEventListener('timeupdate', self._currentTime)
        self.$refs.player.addEventListener('canplay', self._durationTime)
      },
      _currentTime (currtime) {
        const self = this
        if (this.isLocal && this.isMobile) {
          self.curtime = parseInt(currtime)
        } else {
          self.curtime = parseInt(self.$refs.player.currentTime)
        }
      },
      _durationTime () {
        const self = this
        self.duration = parseInt(self.$refs.player.duration)
      },
      _endplay () {
        this.isPlaying = false
        self.ended = true
        self.curtime = -1
      }
    },
    watch: {
      ulDuration: function () {
        this.duration = this.ulDuration
      }
    },
    computed: {
      residueduration () {
        let result = ''
        let time = -1
        if (this.curtime >= 0) {
          time = this.duration - this.curtime
        } else {
          time = this.duration
        }
        if (time === 0) {
          time = this.duration
        }
        if (time > -1) {
          let min = Math.floor(time / 60) % 60
          let sec = time % 60
          if (min > 0) {
            result = min + '\''
          }
          if (sec > 0) {
            result += sec + '"'
          }
        }
        return result
      }
    },
    beforeDestroyed () {
      this.remove4AudioListeners()
    }
  }
</script>
<style scoped lang="scss" >
  //@import "common/stylus/variable.styl"
  .ul-audio-tag{
    width:120px;
    height:44px;
    background-color:#f3f3f3;
    border-radius :30px;
    display: inline-block;
    position: relative;
    border: 1px solid #e3e3e9;
    .duration{
      position:absolute;
      right:8px;
      top:15px;
      line-height:1;
      font-size:12px;
      color:#969696;
    }
     
    .audioicon{
       position:absolute;
      top: 50%;
      margin: -16px 0 0 0;
      left: 11px;
      width: 28px;
      height:28px;
      line-height:1;
      &:after{
       content:'\e63a';
        line-height:1;
        font-family:'iconfont';
        color:#ea5947;
        font-size:28px;
      }
        
    }
    .playingicon{
       background:url('/assets/images/audio_play.gif') no-repeat center;
      &:after{
         content:'';
      }
       
    }
     
}
</style>
