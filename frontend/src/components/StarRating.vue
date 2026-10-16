<script setup>
import { ref } from 'vue'
const props = defineProps({ modelValue: { type: Number, default: 0 }, readonly: Boolean, size: { type: Number, default: 24 } })
const emit = defineEmits(['update:modelValue'])
const hover = ref(0)
</script>

<template>
  <div class="inline-flex gap-0.5" @mouseleave="hover = 0">
    <button v-for="n in 5" :key="n" type="button" :disabled="readonly" :aria-label="`${n} de 5`"
            class="disabled:cursor-default" @mouseenter="!readonly && (hover = n)" @click="emit('update:modelValue', n)">
      <svg :width="size" :height="size" viewBox="0 0 20 20" :fill="n <= (hover || modelValue) ? '#f59e0b' : '#d1d5db'">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    </button>
  </div>
</template>
