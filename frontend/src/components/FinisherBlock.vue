<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  exerciseName: string
  completed: boolean
}>()

const emit = defineEmits<{
  toggle: [completed: boolean]
}>()
</script>

<template>
  <div class="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <span class="text-xs font-bold uppercase text-amber-400 tracking-wider">Finisher</span>
        <h4 class="font-medium text-amber-100">{{ exerciseName }}</h4>
      </div>
      <button
        @click="emit('toggle', !completed)"
        class="w-10 h-10 rounded-lg flex items-center justify-center transition-colors min-w-[44px] min-h-[44px]"
        :class="completed
          ? 'bg-success/20 text-success'
          : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </button>
    </div>
  </div>
</template>
