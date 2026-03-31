<script setup>
import logoPath from '@/assets/logo.svg'
</script>

<template>
  <div class="landing-view">
    <div class="landing-content">
      <img :src="logoPath" alt="MsgApp Neon Logo" class="neon-logo" />
      <p class="tagline">Connect and chat with friends</p>
    </div>
  </div>
</template>

<style scoped>
.landing-view {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-color: #000;
  color: #fff;
}
.landing-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.neon-logo {
  width: 160px;
  height: auto;
  margin-bottom: 20px;
  animation: float 3s ease-in-out infinite, neonPulse 1.5s infinite alternate;
}

h1 {
  font-size: 3rem;
  margin: 0;
  color: #fff;
  text-shadow: 0 0 8px #ff1111, 0 0 20px #ff1111;
  letter-spacing: 2px;
}
.tagline {
  color: #aaa;
  font-size: 1.1rem;
  margin-top: 10px;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes neonPulse {
  0% { filter: drop-shadow(0 0 5px #ff0000); }
  100% { filter: drop-shadow(0 0 15px #ff3333); }
}
</style>
