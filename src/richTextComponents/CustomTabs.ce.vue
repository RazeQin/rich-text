<script setup lang="ts">
import CustomSwiper from '@/components/CustomSwiper.ce.vue'
import { computed, watch, onMounted, reactive, ref, nextTick, getCurrentInstance } from 'vue'
import { RichText } from '@/utils/richText/RichText';
import { type RichTextVirtualDOM } from '@/types/customComponent'

const props = withDefaults(
  defineProps<{ data: Array<{ title: string; content: RichTextVirtualDOM }>; mode: 'edit' | 'show' }>(),
  {
    mode: 'edit'
  }
)

const instance = getCurrentInstance()

// 这个用来同步页数和title
const editData = reactive(props.data.map(item => {
  return { title: item.title }
}))


const swiper: any = ref(null)
const footer = ref(0)

const addTab = () => {
  editData.push(getDefaultTab())
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
  return { title: '' }
}

const getData = () => {
  return editData.map(item => ({
    content: RichText.jsonize(instance?.refs?.[item.__key] as HTMLElement),
    title: item.title
  }))
}


watch(footer, (newVal) => {
  console.log('tab--->', newVal)
})

onMounted(() => {
  if (!editData.length) {
    editData.push(getDefaultTab())
  } else {
    editData.forEach((item, index) => {
      const containerEl = instance?.refs[item.__key]
      const defaultData = props.data?.[index]
      if (containerEl && defaultData?.content) {
        const defaultContainer = (containerEl as HTMLElement).querySelector('.default-container')
        if (typeof defaultData.content === 'string') {
          defaultContainer && defaultContainer.appendChild(document.createTextNode(defaultData.content));
        } else {
          defaultContainer && (containerEl as HTMLElement).removeChild(defaultContainer);
          (containerEl as HTMLElement).appendChild(RichText.parse2DOM(defaultData.content))
        }
      }
    })
  }

})

defineExpose({
  data: getData
})
</script>
<template>
  <div class="tabs">
    <ul class="tabs-container">
      <li :class="{ 'tab-active': index === footer }" v-for="(item, index) of editData" :key="index"
        @click="footer = index">
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
    <CustomSwiper class="swiper" :data="editData" :autoplay="false" :showDoc="false" :loop="false" :activeFooter="footer"
      ref="swiper">
      <template #default="{ data }">
        <div :key="data.__key" class="swiper-item" :ref="data.__key">
          <div class="default-container" :contenteditable="mode === 'edit'"></div>
        </div>
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


    .default-container {
      height: 100%;
      overflow: auto;
    }
  }
}
</style>
