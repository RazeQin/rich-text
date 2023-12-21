<script setup lang="ts"></script>
<template>
  <div class="grid-item" v-cardShow>
    <div class="content">
      <img
        src="https://pic2.zhimg.com/v2-9d285389033685cbd624c4de811c08e9_r.jpg"
        style="width: 100%; height: 100%"
      />
    </div>
  </div>
</template>
<style scoped lang="less">
.grid-item {
  transform-style: preserve-3d;

  & > .content {
    height: 100%;
    transition: 0.5s box-shadow;
    background-color: #fff;
    box-shadow:
      rgba(50, 50, 93, 0.25) 0px 30px 60px -12px,
      rgba(0, 0, 0, 0.3) 0px 18px 36px -18px;
  }
}
</style>
