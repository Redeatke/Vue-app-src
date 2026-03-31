<template>
  <div class="footer-view">
    <RouterLink :to="{ name: 'about' }" class="link">About</RouterLink>
  </div>
</template>

<style>
.footer-view {
  background-color: #dcdcdc;
  padding: 10px;
  display: flex;
  justify-content: center;
}
.link {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 999px;
  color: #000;
}
.router-link-active {
  background-color: gray;
  color: #fff;
  transition: background-color 0.25s ease-in, color 0s ease-in 0.25s;
}
</style>
