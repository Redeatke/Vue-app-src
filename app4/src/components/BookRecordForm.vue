<script setup>
import { ref } from 'vue'
import genres from '../models/genres.js'

const bookRecord = defineModel({ required: true })

const emit = defineEmits(['validated'])

const touched = ref({
  title: false,
  author: false,
  type: false,
  pubDate: false,
  description: false
})

function validate() {
  Object.keys(touched.value).forEach(key => {
    touched.value[key] = true
  })
  
  const isValid = 
    bookRecord.value.title.trim() !== '' &&
    bookRecord.value.author.trim() !== '' &&
    bookRecord.value.type !== '' &&
    bookRecord.value.pubDate !== '' &&
    bookRecord.value.description.trim() !== ''
  
  if (isValid) {
    emit('validated')
  }
}

function isFieldEmpty(field) {
  return touched.value[field] && bookRecord.value[field].trim() === ''
}

function isSelectEmpty(field) {
  return touched.value[field] && bookRecord.value[field] === ''
}
</script>

<template>
  <div class="form-box">
    <h3>Book Record</h3>

    <label for="title">Title</label><br>
    <input id="title" v-model="bookRecord.title" @input="touched.title = true">
    <span v-if="isFieldEmpty('title')" class="error">Required</span>
    <br>

    <label for="author">Author</label><br>
    <input id="author" v-model="bookRecord.author" @input="touched.author = true">
    <span v-if="isFieldEmpty('author')" class="error">Required</span>
    <br>

    <label for="type">Type</label><br>
    <select id="type" v-model="bookRecord.type" @change="touched.type = true">
      <option disabled value="">Select one</option>
      <option v-for="genre in genres" :key="genre">{{ genre }}</option>
    </select>
    <span v-if="isSelectEmpty('type')" class="error">Required</span>
    <br>

    <label for="pubDate">Date Published</label><br>
    <input id="pubDate" type="date" v-model="bookRecord.pubDate" @change="touched.pubDate = true">
    <span v-if="isSelectEmpty('pubDate')" class="error">Required</span>
    <br>

    <label for="description">Description</label><br>
    <textarea id="description" v-model="bookRecord.description" rows="3" @input="touched.description = true"></textarea>
    <span v-if="isFieldEmpty('description')" class="error">Required</span>
    <br><br>

    <button @click="validate">Validate</button>
  </div>
</template>

<style scoped>
.form-box {
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

.form-box:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
}

label {
  display: inline-block;
  margin-top: 10px;
}

input, select, textarea {
  margin-bottom: 5px;
}

.error {
  color: red;
  font-size: 0.9em;
}

button {
  padding: 5px 15px;
}
</style>
