<template>
  <div ref="richtext" class="content richtext-container" v-html="content"></div>
</template>

<script>
import { ImagePreview } from 'vant'
export default {
  name: 'RichtextComponent',
  props: ['content'],
  data () {
    return {

    }
  },
  mounted () {
     try {
      MathJax.Hub.Queue(["Typeset", MathJax.Hub, ""]);
    } catch (error) {
      console.log(error)
    }
    var self = this
    //console.log('richtext--',this.$refs.richtext.getElementsByTagName('img'))
    this.$refs.richtext.getElementsByTagName('img').forEach(item => {
      item.addEventListener('click', () => {
        ImagePreview({
          images: [item.src],
          showIndex: false,
          onClose () {
            self.$emit('onClose')
          }
        })
        this.$emit('onOpen')
      })
    })
  }
}
</script>

<style>

</style>