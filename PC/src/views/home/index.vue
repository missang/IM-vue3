<template>
    <div class="test">test</div>
  按钮
    <div class="card">
      <button type="button" @click="count++">count is {{ count }}</button>
    </div>
  </template>
  
  <script setup lang="ts">
  import { onMounted,ref } from 'vue'
  const count = ref(0)
  </script>
  
  <style lang="scss" scoped>
  .test {
    font-size: 50px;
    color: $test-color;
  }
  </style>
  