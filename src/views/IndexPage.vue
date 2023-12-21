<script setup lang="ts">
import PostsGridVue from '@/components/PostsGrid.vue'
import RichEditor from '@/components/RichEditor.vue'
import CustomSwiper from '@/components/CustomSwiper.ce.vue'
import { RouterLink } from 'vue-router'
import { reactive, ref } from 'vue'

const data = reactive([
  { id: 1, color: 'red' },
  { id: 2, color: 'blue' },
  { id: 3, color: 'green' }
])

setTimeout(() => {
  data.push({ id: 4, color: 'gray' })
}, 3000)

setTimeout(() => {
  // data.push({ id: 5, color: 'yellow' })
  // swiper.value.setActiveFooter(2)
}, 4000)
const swiper = ref()
</script>

<template>
  <a-layout class="index-page">
    <a-layout-header class="page-header">
      <RouterLink to="/" class="logo"> 风行无缺 </RouterLink>
    </a-layout-header>
    <a-layout-content class="page-content">
      <div class="content-container">
        <RichEditor />
        <!-- <PostsGridVue /> -->
        <!-- <CustomSwiper
          :data="data"
          style="height: 100px; width: 200px"
          :autoplay="false"
          ref="swiper"
        >
          <template #default="{ data, index }">
            <div :style="{ backgroundColor: data.color, height: '100%' }">{{ index }}</div>
          </template>
        </CustomSwiper> -->
      </div>
      <a-layout-footer class="page-footer">
        <div class="footer-container">
          <span>Copyright S.J 2023</span>
        </div>
      </a-layout-footer>
    </a-layout-content>
  </a-layout>
</template>
<style scoped lang="less">
.index-page {
  min-height: 100%;
  background-color: #f1f1f1;
}

.page-header {
  height: auto;
  background-color: #fff;
  text-align: center;
  padding: 30px 0;

  & > .logo {
    font-size: 40px;
    color: #616161;
  }
}

.page-content {
  height: auto;
  background-color: #f1f1f1;
  padding-top: 15px;

  & > .content-container {
    max-width: 1370px;
    min-height: calc(100% - 71px);
    margin: 0 auto;
  }
}

.page-footer {
  background-color: #f1f1f1;

  & > .footer-container {
    max-width: 1370px;
    margin: 0 auto;
    text-align: right;
  }
}
</style>
