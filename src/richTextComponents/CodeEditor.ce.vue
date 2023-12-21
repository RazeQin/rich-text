<script setup lang="ts">
import { onMounted, ref, onBeforeUnmount } from 'vue'

const props = defineProps({
    mode: String,
    defaultContent: String
})

const content = ref(props.defaultContent)
const code = ref()
const textarea = ref()
let rowNumber = ref(1)

const setLineHeight = () => {
    const activeEl = code.value ?? textarea.value.$el
    const height = parseInt(getComputedStyle(activeEl).height)
    rowNumber.value = Math.ceil(height / 24)
}
const observer = new ResizeObserver(setLineHeight)

onMounted(() => {
    if (code.value) {
        observer.observe(code.value, { box: 'border-box' });
    }
    if (textarea.value) {
        observer.observe(textarea.value.$el, { box: 'border-box' });
    }
})

onBeforeUnmount(() => {
    if (code.value) {
        observer.unobserve(code.value)
    }
    if (textarea.value) {
        observer.unobserve(textarea.value.$el)
    }
})

</script>

<template>
    <div class="code-container">
        <ul class="list-number">
            <li v-for="num in rowNumber" :key="num">{{ num }}</li>
        </ul>
        <pre class="code" v-if="mode === 'show'"><code><div  tabindex="0" ref="code">{{ content }}</div></code></pre>
        <a-textarea ref="textarea" v-else v-model:value="content" placeholder="请输入/粘贴代码" auto-size />
    </div>
</template>

<script lang="ts">
export default {
    name: 'code-editor',
    type: 'block'
}
</script>
<style lang="less">
.code-container {
    background-color: rgb(31, 31, 31);
    color: rgb(204, 204, 204);
    font-family: Consolas, 'Courier New', monospace;
    font-size: 18px;
    position: relative;
    display: flex;
    padding: 5px 0;
}

.code {
    flex: 1;
    width: calc(100% - 48px);
    line-height: 24px;
    margin: 0;
    background-color: rgb(31, 31, 31);
    padding: 0 8px;
    box-sizing: border-box;

    div {
        overflow-x: auto;
    }
}

textarea {
    padding: 0 8px;
    box-sizing: border-box;
    width: 100%;
    background-color: rgb(31, 31, 31);
    line-height: 24px;
    font-size: 18px;
    color: rgb(204, 204, 204);
    font-family: Consolas, 'Courier New', monospace;
    outline: none;
    border: none;
}

.list-number {
    overflow-x: auto;
    list-style: none;
    width: 48px;
    margin: 0;
    padding: 0 8px;
    box-sizing: border-box;
    text-align: right;
    border-right: 1px #ebebeb solid;
    background-color: rgb(31, 31, 31);

    &>li {

        line-height: 24px;
    }
}
</style>
