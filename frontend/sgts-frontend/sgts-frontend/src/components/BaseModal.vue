<script setup>
import { onMounted, onUnmounted } from 'vue'

// Modal reutilizable. Uso:
// <BaseModal v-model="abierto" title="Nuevo ticket">
//   contenido...
//   <template #footer> botones </template>
// </BaseModal>
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  width: { type: String, default: '520px' }
})
const emit = defineEmits(['update:modelValue', 'close'])

function close() {
  emit('update:modelValue', false)
  emit('close')
}

function onKey(e) {
  if (e.key === 'Escape' && props.modelValue) close()
}
onMounted(() => document.addEventListener('keydown', onKey))
onUnmounted(() => document.removeEventListener('keydown', onKey))
</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue" class="backdrop" @click.self="close">
      <div class="modal" role="dialog" aria-modal="true" :style="{ maxWidth: width }">
        <header>
          <h3>{{ title }}</h3>
          <button class="x" aria-label="Cerrar" @click="close">✕</button>
        </header>
        <section class="body">
          <slot />
        </section>
        <footer v-if="$slots.footer">
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  display: grid;
  place-items: center;
  padding: 16px;
  z-index: 100;
}
.modal {
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border-radius: var(--radius);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
}
header,
footer {
  padding: 14px 18px;
}
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
}
.x {
  border: none;
  background: none;
  font-size: 16px;
  cursor: pointer;
  color: var(--color-muted);
}
.body {
  padding: 18px;
  overflow-y: auto;
}
footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  border-top: 1px solid var(--color-border);
}
</style>
