<script setup lang="ts">
import CustomSwiper from '@/components/CustomSwiper.ce.vue'
import { computed, watch, onMounted, reactive, ref, nextTick } from 'vue'

const props = withDefaults(
  defineProps<{ data: Array<{ title: string; content: string }>; mode: 'edit' | 'show' }>(),
  {
    mode: 'edit'
  }
)

// 这个用来同步页数和title
const editData = reactive(props.data)
if (!editData.length) {
  editData.push(getDefaultTab())
}

const swiper: any = ref(null)
const footer = ref(0)

const addTab = () => {
  editData.push({ title: '', content: '' })
  footer.value = editData.length - 1
}

const removeTab = async (index: number) => {
  editData.splice(index, 1)
  !editData.length && addTab()
  // 新建一个宏任务来延迟执行
  setTimeout(() => {
    console.log(swiper)

    swiper.value!.setActiveFooter(0)
    footer.value = index ? index - 1 : index
  })
}

function getDefaultTab() {
  return { title: '', content: '' }
}

watch(footer, (newVal) => {
  console.log('tab--->', newVal)
})
onMounted(() => {})
</script>
<template>
  <div class="tabs">
    <ul class="tabs-container">
      <li
        :class="{ 'tab-active': index === footer }"
        v-for="(item, index) of editData"
        :key="index"
        @click="footer = index"
      >
        <span v-if="mode === 'edit'">
          <input v-model="item.title" placeholder="请输入标签名" />
          <button type="button" @click="removeTab(index)">×</button>
        </span>
        <span v-else>{{ item.title ?? '--' }}</span>
      </li>
      <li class="add-tab" v-if="mode === 'edit'">
        <button type="button" @click="addTab">+</button>
      </li>
    </ul>
    <CustomSwiper
      class="swiper"
      :data="editData"
      :autoplay="false"
      :showDoc="false"
      :loop="false"
      :activeFooter="footer"
      ref="swiper"
    >
      <template #default="{ data }">
        <div
          :key="data.__key"
          class="swiper-item"
          :contenteditable="mode === 'edit'"
          v-html="data.content"
        ></div>
      </template>
    </CustomSwiper>
  </div>
</template>
<script lang="ts">
export default {
  name: 'custom-tabs',
  type: 'block',
  nestable: true,
  customStyles: [...CustomSwiper.styles]
}
</script>
<style lang="less">
.tabs {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 15px 40px;

  &-container {
    display: flex;
    list-style: none;
    padding: 0;

    li {
      flex: 1;
      line-height: 28px;
      text-align: center;
      box-sizing: border-box;
      cursor: pointer;
    }

    .add-tab {
      flex: 0 0 28px;
    }

    .tab-active {
      color: #1677ff;
      border-bottom: 2px solid #1677ff;
    }
  }

  .swiper {
    min-height: 300px;
  }

  .swiper-item {
    height: 100%;
    box-sizing: border-box;
    padding: 15px;
    border: 1px solid black;
    overflow: auto;
  }
}
</style>
