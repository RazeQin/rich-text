<script setup lang="ts">
import { reactive, ref, computed } from "vue"
import generateGrid from '@/utils/generateGrid'
import GridItemVue from './GridItem.vue'

const rows = ref(1)
const cols = ref(6)

const area = computed(() => {
    const { length, grid } = generateGrid(rows.value, cols.value)
    let areaStr = grid.map(item => (`"${item.join(' ')}"`)).join(' ')
    return {
        length, grid, areaStr
    }
})
</script>

<template>
    <div class="grid" :style="{
        gridTemplateAreas: area.areaStr,
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 200px)`
    }">
        <GridItemVue :style="{ gridArea: `item_${index}` }" v-for="(item, index) of area.length" :key="index">
            {{ index }}
        </GridItemVue>
    </div>
</template>
<style scoped lang="less">
.grid {
    height: 100%;
    display: grid;
    grid-gap: 5px;
}
</style>