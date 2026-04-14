<script setup lang="ts">
import type { SetData } from '../types'

defineProps<{
  set: SetData
  setNumber: number
  useRepInput?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  update: [data: Partial<SetData>]
  complete: []
  skip: []
  partial: []
}>()
</script>

<template>
  <div
    class="flex items-center gap-2 py-1.5"
    :class="{ 'opacity-40': set.skipped }"
  >
    <!-- Set number -->
    <span
      class="text-xs font-bold w-6 text-center flex-shrink-0"
      :class="set.completed ? 'text-success' : set.skipped ? 'text-gray-500' : set.partial ? 'text-amber-400' : 'text-accent'"
    >{{ setNumber }}</span>

    <!-- Weight or reps input -->
    <input
      type="number"
      :value="useRepInput ? (set.reps_actual || '') : (set.weight_lbs || '')"
      @input="emit('update', useRepInput
        ? { reps_actual: parseFloat(($event.target as HTMLInputElement).value) || 0 }
        : { weight_lbs: parseFloat(($event.target as HTMLInputElement).value) || 0 }
      )"
      class="flex-1 min-w-0 bg-surface-light border rounded px-3 py-2 text-sm font-semibold text-center focus:outline-none transition-colors"
      :class="[
        set.completed
          ? 'border-success/40 text-success bg-success/5'
          : set.skipped
            ? 'border-gray-700 line-through text-gray-500'
            : set.partial
              ? 'border-amber-500/40 text-amber-300 bg-amber-500/5'
              : 'border-gray-700 focus:border-accent text-gray-100'
      ]"
      :disabled="set.completed || set.skipped || disabled"
      :placeholder="useRepInput ? 'reps' : 'lbs'"
      :step="useRepInput ? 1 : 2.5"
      :inputmode="useRepInput ? 'numeric' : 'decimal'"
    />

    <!-- Complete toggle -->
    <button
      @click="emit('complete')"
      :disabled="set.skipped || !!set.partial || disabled"
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

    <!-- Partial toggle -->
    <button
      @click="emit('partial')"
      :disabled="set.completed || set.skipped || disabled"
      class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
      :class="set.partial
        ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/10'
        : 'bg-surface-light text-gray-600 hover:text-amber-400 hover:bg-amber-500/10'"
      :title="set.partial ? 'Unmark partial' : 'Mark as partial (fewer reps than target)'"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M4 12c1.5-3 3-3 4.5 0s3 3 4.5 0 3-3 4.5 0" />
      </svg>
    </button>

    <!-- Skip button -->
    <button
      @click="emit('skip')"
      :disabled="set.completed || !!set.partial || disabled"
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
