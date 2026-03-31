<script setup>
import { routeError } from '@/router'
import NavBar from '@/components/NavBar.vue'
</script>

<template>
  <div class="app">
    <NavBar />
    <div v-if="routeError" class="route-error">
      {{ routeError }}
    </div>
    <RouterView class="view" />
  </div>
</template>

<style>
body, html {
  margin: 0;
  padding: 0;
  font-family: sans-serif;
  overflow: hidden;
  background-color: #000;
  color: #fff;
}
</style>

<style scoped>
.app {
  height: 100vh;
  width: 100vw;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.view {
  flex: 1;
  overflow: auto;
}
.route-error {
  background-color: #f8d7da;
  color: #842029;
  padding: 8px 16px;
  text-align: center;
  font-size: 14px;
}
</style>
