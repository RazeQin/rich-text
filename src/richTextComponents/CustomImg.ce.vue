<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(
  defineProps<{ src?: string; file?: File; title?: string; alt?: string }>(),
  {
    src: '',
    title: '',
    alt: ''
  }
)

const url = ref('')
if (props.src) {
  try {
    // let image = new Image();
    // // 解决跨域 Canvas 污染问题
    // image.setAttribute("crossOrigin", "anonymous");
    // image.setAttribute('referrerpolicy', 'no-referrer')
    // image.onload = function () {
    //     let canvas = document.createElement("canvas");
    //     canvas.width = image.width;
    //     canvas.height = image.height;
    //     let context = canvas.getContext("2d");
    //     context!.drawImage(image, 0, 0, image.width, image.height);
    //     let imgSrc = canvas.toDataURL("image/png"); //得到图片的base64编码数据
    //     url.value = imgSrc
    // };
    // image.src = props.src
    url.value = props.src
  } catch (e) {
    console.log(e)
  }
} else if (props.file) {
  try {
    const reader = new FileReader()
    reader.readAsDataURL(props.file)
    reader.onload = function () {
      if (reader.result) {
        url.value = reader.result
      }
    }
  } catch (e) {
    console.log(e)
  }
}

defineExpose({
  src: url,
  title: props.title,
  alt: props.alt
})
</script>
<template>
  <img class="image" crossorigin="anonymous" referrerpolicy="no-referrer" v-if="url" :src="url" :title="title"
    :alt="alt" />
  <!-- </div> -->
</template>
<script lang="ts">
export default {
  name: 'custom-img',
  type: 'block'
}
</script>
<style lang="less">
.image {
  display: block;
  margin: 0 auto;
}
</style>
