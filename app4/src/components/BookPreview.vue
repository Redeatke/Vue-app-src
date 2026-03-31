<script setup>
defineProps({
  bookRecord: {
    type: Object,
    required: true
  },
  isValidated: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <div class="preview-box">
    <h3>Preview <span v-if="isValidated" class="checkmark">✓</span></h3>

    <ul>
      <li>Title: {{ bookRecord.title }}</li>
      <li>Author: {{ bookRecord.author }}</li>
      <li>Type: {{ bookRecord.type }}</li>
      <li>Pub date: {{ bookRecord.pubDate }}</li>
      <li>Description: {{ bookRecord.description }}</li>
    </ul>
  </div>
</template>

<style scoped>
.preview-box {
  background: rgba(220, 220, 220, 0.85);
  backdrop-filter: blur(10px);
  padding: 20px;
  height: 100%;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.preview-box:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
}

.checkmark {
  color: green;
  font-weight: bold;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  margin: 5px 0;
}
</style>
