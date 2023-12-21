<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { RichText } from '@/utils/richText/RichText'
import { customComponentsStore } from '@/stores/customComponents'

const customComponents = customComponentsStore().getComponents

let handleClickBtn: (styles: any) => void
let insertLink: (text: string, href: string) => void
let insertCodeBlock: () => void
let insertTabs: () => void
let insertImg: () => void
const parent = ref()
onMounted(() => {
  const richText = new RichText(parent.value, 'edit')
  handleClickBtn = (styles) => richText.getCustomSelection(styles)
  insertLink = (text, href) => {
    richText.insertCustomElement('custom-link', { href, text })
  }
  insertCodeBlock = () => {
    richText.insertCustomElement('code-editor', {
      'default-content': `console.log('Hello World!')`
    })
  }
  insertTabs = () => {
    const data = reactive([{title:'qwe',content:'<custom-img src="https://img-home.csdnimg.cn/images/20230817060237.png"/>'}])
    richText.insertCustomElement('custom-tabs', { data })
  }
  insertImg = () => {
    richText.insertCustomElement('custom-img', {
      src: 'https://img-home.csdnimg.cn/images/20230817060237.png',
      name: 'qwe',
      alt: '123'
    })
  }
})
</script>

<template>
  <button @click="handleClickBtn({ textAlign: 'right', color: 'rgb(255, 0, 0)' })">
    更改文字为红色
  </button>
  <button @click="insertLink('baidu', '//www.baidu.com')">插入链接</button>
  <button @click="insertCodeBlock">插入代码块</button>
  <button @click="insertTabs">插入Tab</button>
  <button @click="insertImg">插入图片</button>
  <div ref="parent" class="parent"></div>
</template>

<style lang="less" scoped>
.parent {
  padding: 15px;
  box-sizing: border-box;
}
</style>
