<script setup>
import BookRecordForm from './components/BookRecordForm.vue';
import BookPreview from './components/BookPreview.vue';
import { ref } from 'vue'

import Book from './models/Book';

const book = ref(new Book())
const isValidated = ref(false)

function handleValidated() {
  isValidated.value = true
}

</script>

<template>
  <main>

    <section class="book">
      <BookRecordForm 
        v-model="book"
        @validated="handleValidated" />
      <BookPreview 
        :book-record="book" 
        :is-validated="isValidated" />
    </section>

  </main>
</template>

<style scoped>
main {
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
  min-height: 100vh;
  padding: 20px;
}

main::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/bookshelf-bg.jpg');
  background-size: cover;
  background-position: center;
  filter: blur(6px);
  
}

section {
  display: flex;
  justify-content: center;
  gap: 20px;
  position: relative;
 
}

section > * {
  width: 100%;
}

</style>
