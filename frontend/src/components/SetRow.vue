<script setup lang="ts">
import type { SetData } from '../types'

defineProps<{
  set: SetData
  setNumber: number
  disabled?: boolean
}>()

const emit = defineEmits<{
  update: [data: Partial<SetData>]
  complete: []
  skip: []
}>()
</script>

<template>
  <div
    class="flex items-center gap-2 py-1.5"
    :class="{ 'opacity-40': set.skipped }"
  >
    <!-- Set number -->
    <span class="text-xs text-gray-500 w-6 text-center flex-shrink-0">{{ setNumber }}</span>

    <!-- Weight input -->
    <input
      type="number"
      :value="set.weight_lbs || ''"
      @input="emit('update', { weight_lbs: parseFloat(($event.target as HTMLInputElement).value) || 0 })"
      class="flex-1 min-w-0 bg-surface-light border rounded px-3 py-2 text-sm text-center focus:outline-none transition-colors"
      :class="[
        set.completed
          ? 'border-success/40 text-success bg-success/5'
          : set.skipped
            ? 'border-gray-700 line-through text-gray-500'
            : 'border-gray-700 focus:border-accent text-gray-100'
      ]"
      :disabled="set.completed || set.skipped || disabled"
      placeholder="lbs"
      step="2.5"
      inputmode="decimal"
    />

    <!-- Complete toggle -->
    <button
      @click="emit('complete')"
      :disabled="set.skipped || disabled"
      class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
      :class="set.completed
        ? 'bg-success/20 text-success hover:bg-success/10'
        : 'bg-surface-light text-gray-500 hover:text-success hover:bg-success/10'"
      :title="set.completed ? 'Unmark complete' : 'Mark complete'"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </button>

    <!-- Skip button -->
    <button
      @click="emit('skip')"
      :disabled="set.completed || disabled"
      class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
      :class="set.skipped
        ? 'bg-gray-500/20 text-gray-300 hover:bg-gray-500/10'
        : 'bg-surface-light text-gray-600 hover:text-gray-300 hover:bg-gray-500/10'"
      :title="set.skipped ? 'Unskip set' : 'Skip set'"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>
