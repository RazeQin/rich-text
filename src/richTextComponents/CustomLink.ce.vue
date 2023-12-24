<script setup lang="ts">

import { defineProps, ref } from "vue";
const props = defineProps({
  href: String,
  text: String
})
const hrefRef = ref(props.href || ' ')
const textRef = ref(props.text || props.href || '  ')

const updateText = (e: Event) => {
  textRef.value = (e.target as HTMLLinkElement).textContent || ''
}

// 组件向外暴露的变量在这里定义，这是运行时能拿到的
defineExpose({
  href: hrefRef, text: textRef
})
</script>
<template>
  <a contenteditable="true" class="link" :href="hrefRef" target="_blank" @input="updateText">{{ textRef }}</a>
</template>

<script lang="ts">
// 组件静态属性要在这里定义，这是编译时能拿到的
export default {
  name: 'custom-link',
  type: 'inline',
}
</script>

<style lang="less" scoped>
.link {
  outline: 0px solid transparent
}
</style>
