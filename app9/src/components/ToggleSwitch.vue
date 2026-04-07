<script setup>
defineProps({
  modelValue: Boolean
})
defineEmits(['update:modelValue'])
</script>

<template>
  <label class="switch">
    <input 
      type="checkbox" 
      :checked="modelValue" 
      @change="$emit('update:modelValue', $event.target.checked)" 
    />
    <span class="slider"></span>
  </label>
</template>

<style scoped>
.switch {
  position: relative;
  display: inline-block;
  width: 30px;
  height: 17px;
}
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 17px;
}
.slider:before {
  position: absolute;
  content: '';
  height: 13px;
  width: 14px;
  left: 2px;
  bottom: 2px;
  background-color: #fff;
  transition: 0.4s;
  border-radius: 50%;
}
input:checked + .slider {
  background-color: #f00;
}
input:checked + .slider:before {
  transform: translate(13px);
}
</style>
