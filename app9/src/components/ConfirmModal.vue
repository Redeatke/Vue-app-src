<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-backdrop" @click.self="$emit('update:modelValue', false)">
        <div class="modal-box">
          <p class="modal-message">{{ message }}</p>
          <div class="modal-actions">
            <button class="btn-cancel" @click="$emit('update:modelValue', false)">Cancel</button>
            <button class="btn-confirm" @click="confirm">{{ confirmLabel }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  modelValue: Boolean,
  message: { type: String, default: 'Are you sure?' },
  confirmLabel: { type: String, default: 'Confirm' },
})
const emit = defineEmits(['update:modelValue', 'confirmed'])

function confirm() {
  emit('confirmed')
  emit('update:modelValue', false)
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-box {
  background: rgba(18, 18, 18, 0.92);
  border: 1px solid rgba(255, 51, 51, 0.35);
  border-radius: 12px;
  padding: 28px 32px;
  min-width: 280px;
  max-width: 380px;
  box-shadow: 0 0 40px rgba(255, 51, 51, 0.15), 0 8px 32px rgba(0,0,0,0.7);
  text-align: center;
}
.modal-message {
  color: #ddd;
  font-size: 15px;
  margin: 0 0 22px;
  line-height: 1.5;
}
.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}
.btn-cancel {
  padding: 8px 20px;
  border: 1px solid #444;
  background: transparent;
  color: #aaa;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}
.btn-cancel:hover {
  border-color: #888;
  color: #fff;
}
.btn-confirm {
  padding: 8px 20px;
  border: 1px solid #ff3333;
  background: rgba(255, 51, 51, 0.15);
  color: #ff4444;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
}
.btn-confirm:hover {
  background: #ff3333;
  color: #fff;
}

/* Transition */
.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to       { opacity: 0; transform: scale(0.95); }
</style>
