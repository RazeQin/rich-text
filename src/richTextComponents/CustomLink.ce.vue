<script setup lang="ts">
import { onMounted, ref } from "vue";
defineProps({
  href: String,
  text: String
})

</script>
<template>
  <a contenteditable="true" class="link" :href="href" target="_blank">{{ text }}</a>
</template>

<script lang="ts">
export default {
  name: 'custom-link',
  type: 'inline'
}
</script>
<style lang="less" scoped>
// @import '~ant-desing-vue/dist/antd.less';
</style>

<style lang="less" scoped> .link {
   outline: 0px solid transparent
 }
</style>