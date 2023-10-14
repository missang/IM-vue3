<template>
    <div class="test">test</div>
  按钮
    <div class="card">
      <button type="button" @click="count++">count is {{ count }}</button>
    </div>
  </template>
  
  <script setup lang="ts">
  import { onMounted,ref } from 'vue'
  import IndexApi from '/@/service/api/Index'
  IndexApi.login({
    isTakeaway: true,
    latitude: 1,
    longitude: 1,
    orderBy: 1,
    page: 1,
    regionId: 1,
    size: 1,
  }).then((res) => {
    console.log(res)
  })
  const count = ref(0)
  </script>
  
  <style lang="scss" scoped>
  .test {
    font-size: 50px;
    color: $test-color;
  }
  </style>
  