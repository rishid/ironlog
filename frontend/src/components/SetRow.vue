<script setup lang="ts">
import { computed } from 'vue'
import type { SetData } from '../types'

const props = defineProps<{
  set: SetData
  disabled?: boolean
}>()

const emit = defineEmits<{
  update: [data: Partial<SetData>]
  complete: []
  remove: []
}>()

const typeBadge = computed(() => {
  switch (props.set.type) {
    case 'warmup': return { label: 'W', class: 'bg-blue-500/30 text-blue-300' }
    case 'drop': return { label: 'D', class: 'bg-purple-500/30 text-purple-300' }
    case 'failure': return { label: 'F', class: 'bg-red-500/30 text-red-300' }
    default: return null
  }
})

const typeOptions: { value: SetData['type']; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'warmup', label: 'Warmup' },
  { value: 'drop', label: 'Drop Set' },
  { value: 'failure', label: 'Failure' },
]

function cycleType() {
  const types: SetData['type'][] = ['normal', 'warmup', 'drop', 'failure']
  const currentIndex = types.indexOf(props.set.type)
  const nextType = types[(currentIndex + 1) % types.length]
  emit('update', { type: nextType })
}
</script>

<template>
  <div
    class="flex items-center gap-2 py-2 px-1 rounded-lg transition-colors"
    :class="{
      'opacity-50': set.type === 'warmup',
      'bg-surface-lighter/50': set.completed,
    }"
  >
    <!-- Set number -->
    <span class="text-xs text-gray-500 w-5 text-center">{{ set.set }}</span>

    <!-- Type badge (clickable to cycle) -->
    <button
      v-if="typeBadge"
      @click="cycleType"
      class="text-[10px] font-bold w-6 h-6 rounded flex items-center justify-center min-w-[24px]"
      :class="typeBadge.class"
    >
      {{ typeBadge.label }}
    </button>
    <button
      v-else
      @click="cycleType"
      class="w-6 h-6 rounded flex items-center justify-center min-w-[24px] text-gray-600 hover:text-gray-400"
    >
      <span class="text-[10px]">·</span>
    </button>

    <!-- Weight input -->
    <div class="flex-1 min-w-0">
      <input
        type="number"
        :value="set.weight_lbs"
        @input="emit('update', { weight_lbs: parseFloat(($event.target as HTMLInputElement).value) || 0 })"
        class="w-full bg-surface-light border border-gray-700 rounded px-2 py-1.5 text-sm text-center focus:border-accent focus:outline-none"
        :disabled="set.completed || disabled"
        placeholder="lbs"
        step="2.5"
        inputmode="decimal"
      />
    </div>

    <span class="text-gray-500 text-sm">×</span>

    <!-- Reps input -->
    <div class="flex-1 min-w-0">
      <input
        type="number"
        :value="set.reps_actual || set.reps_target"
        @input="emit('update', { reps_actual: parseInt(($event.target as HTMLInputElement).value) || 0 })"
        class="w-full bg-surface-light border border-gray-700 rounded px-2 py-1.5 text-sm text-center focus:border-accent focus:outline-none"
        :disabled="set.completed || disabled"
        :placeholder="String(set.reps_target)"
        inputmode="numeric"
      />
    </div>

    <!-- Complete button -->
    <button
      @click="emit('complete')"
      :disabled="set.completed || disabled"
      class="w-10 h-10 rounded-lg flex items-center justify-center transition-colors min-w-[44px] min-h-[44px]"
      :class="set.completed
        ? 'bg-success/20 text-success'
        : 'bg-surface-light text-gray-400 hover:text-white hover:bg-accent/30'"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </button>
  </div>
</template>
