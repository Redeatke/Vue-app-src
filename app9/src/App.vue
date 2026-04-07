<script setup>
import { routeError } from '@/router'
import NavBar from '@/components/NavBar.vue'
import logoPath from '@/assets/logo.svg'
</script>

<template>
  <div class="app">
    <NavBar />
    <div v-if="routeError" class="route-error">
      {{ routeError }}
    </div>
    <div class="view">
      <!-- Centered watermark behind all page content -->
      <img :src="logoPath" class="watermark" aria-hidden="true" />
      <RouterView />
    </div>
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
  position: relative;
}
.view {
  flex: 1;
  overflow: auto;
  position: relative;
}
.watermark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 55vmin;
  height: auto;
  opacity: 0.045;
  pointer-events: none;
  user-select: none;
  z-index: 0;
  filter: drop-shadow(0 0 30px #ff3333);
}
.route-error {
  background-color: #f8d7da;
  color: #842029;
  padding: 8px 16px;
  text-align: center;
  font-size: 14px;
}
</style>
