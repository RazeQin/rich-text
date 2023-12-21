<script setup lang="ts">
import {
  computed,
  onMounted,
  onBeforeUnmount,
  ref,
  watch,
  type StyleValue,
  onBeforeMount
} from 'vue'
import { generateRandomString } from '@/utils/utils'

const props = withDefaults(
  defineProps<{
    data: any[]
    activeFooter?: number
    autoplay?: boolean
    intervals?: number
    direction?: 'horizontal' | 'vertical'
    loop?: boolean
    scrollDirection?: -1 | 1
    defaultFooter?: number
    duration?: string
    showDoc?: boolean
  }>(),
  {
    autoplay: true,
    intervals: 1000,
    direction: 'horizontal',
    loop: true,
    scrollDirection: -1,
    duration: '.3s',
    showDoc: true
  }
)

let stepper: number | undefined
const swiper = ref<HTMLElement | null>(null)
const container = ref<HTMLElement | null>(null)
const footer = ref(0)
const virtualFooter = ref(0)

// 计算后的数据类型
const computedData = computed(() => {
  if (!props.data.length || !Array.isArray(props.data)) return []
  const data = [...props.data]
  if (props.loop) {
    const firstData = data[0]
    const lastData = data[data.length - 1]
    data.unshift(lastData)
    data.push(firstData)
  }
  data.forEach((item) => {
    !item.__key && (item.__key = generateRandomString(8))
  })
  return data
})

// 计算后的container高度和宽度
const computedStyle = computed(() => {
  const styles = {
    width: '',
    height: '',
    flexDirection: '',
    left: '0',
    top: '0'
  }
  if (props.direction === 'horizontal') {
    styles.width = `${computedData.value.length * 100}%`
    styles.flexDirection = 'row'
    styles.height = '100%'
    styles.left = `${virtualFooter.value * 100}%`
  } else {
    styles.width = '100%'
    styles.height = `${computedData.value.length * 100}%`
    styles.flexDirection = 'column'
    styles.top = `${virtualFooter.value * 100}%`
  }
  return styles
})

const computedTransition = computed(() => {
  return `${props.duration} ${props.direction === 'horizontal' ? 'left' : 'top'}`
})

watch(computedData, async () => {
  clearTimeout(stepper)
  setDefaultFooter()
  await 1
  props.autoplay && (stepper = setTimeout(stepperFn, props.intervals))
})

function stepperFn() {
  footer.value -= props.scrollDirection
  if (footer.value >= props.data.length) {
    footer.value = 0
  }
  if (footer.value < 0) {
    footer.value = props.data.length - 1
  }
  container.value!.style.transition = computedTransition.value
  if (!props.loop) {
    virtualFooter.value = -1 * footer.value
  } else {
    virtualFooter.value += props.scrollDirection
  }
}

const setDefaultFooter = () => {
  if (typeof props.activeFooter === 'number') {
    footer.value = props.activeFooter
    virtualFooter.value = (footer.value + +props.loop) * -1
  } else {
    if (
      props.defaultFooter &&
      Number.isInteger(props.defaultFooter) &&
      props.defaultFooter < props.data.length &&
      props.defaultFooter >= 0
    ) {
      footer.value = props.defaultFooter
      virtualFooter.value = (footer.value + +props.loop) * -1
    } else {
      if (props.scrollDirection > 0) {
        footer.value = props.data.length - 1
        virtualFooter.value = 1 + +props.loop - computedData.value.length
      } else {
        footer.value = 0
        virtualFooter.value = -1 * +props.loop
      }
    }
  }
}

const setActiveFooter = (num: number) => {
  clearTimeout(stepper)
  container.value!.style.transition = computedTransition.value
  footer.value = num
  virtualFooter.value = (footer.value + +props.loop) * -1
  props.autoplay && (stepper = setTimeout(stepperFn, props.intervals))
}

if (Number.isInteger(props.activeFooter)) {
  watch(
    () => props.activeFooter,
    (newVal) => {
      typeof newVal === 'number' && setActiveFooter(newVal)
    }
  )
}

const getFooter = () => {
  return { footer: footer.value, virtualFooter: virtualFooter.value }
}

onBeforeMount(() => {
  setDefaultFooter()
})

onMounted(() => {
  if (container.value) {
    container.value.addEventListener('transitionend', () => {
      clearTimeout(stepper)
      container.value!.style.transition = 'none'
      // 循环类型延迟判断，非循环类型判断再做动画
      if (props.loop) {
        if (virtualFooter.value * -1 >= computedData.value.length - 1) {
          virtualFooter.value = -1
        } else if (virtualFooter.value >= 0) {
          virtualFooter.value = 2 - computedData.value.length
        }
      }
      props.autoplay && (stepper = setTimeout(stepperFn, props.intervals))
    })
    props.autoplay && (stepper = setTimeout(stepperFn, props.intervals))
  }
})

onBeforeUnmount(() => {
  clearTimeout(stepper)
})

defineExpose({
  setActiveFooter,
  getFooter
})
</script>
<template>
  <div class="swiper" ref="swiper" v-if="computedData && computedData.length">
    <div class="swiper-container" :style="computedStyle as StyleValue" ref="container">
      <div
        class="swiper-items"
        :style="{ height: direction === 'horizontal' ? '100%' : 'auto' }"
        v-for="(item, index) of computedData"
        :key="index"
        @dragstart="() => false"
      >
        <slot :data="item" :index="index"></slot>
      </div>
    </div>
    <div class="doc-container" v-if="showDoc">
      <div
        class="doc"
        :class="{ 'doc-active': item.__key === data[footer].__key }"
        v-for="(item, index) of data"
        :key="index"
        @click="setActiveFooter(index)"
      ></div>
    </div>
  </div>
</template>
<script lang="ts">
export default { customElement: true }
</script>
<style lang="less" scoped>
.swiper {
  position: relative;
  overflow: hidden;

  &-container {
    position: absolute;
    will-change: auto;
    display: flex;
  }

  &-items {
    flex: 1;
    overflow: hidden;
  }

  .doc-container {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(128, 128, 128, 0.85);
    padding: 5px 10px;
    border-radius: 50px;
    display: flex;

    .doc {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #fff;
      margin: 0 2px;
      transition: 0.3s;
    }

    .doc-active {
      background-color: blue;
    }
  }
}
</style>
