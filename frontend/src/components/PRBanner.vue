<script setup lang="ts">
defineProps<{
  exerciseName: string
  estimated1rm: number
}>()
</script>

<template>
  <Transition name="pr-slide">
    <div class="fixed top-20 left-4 right-4 lg:left-auto lg:right-8 lg:w-96 z-50 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-xl p-4 shadow-2xl">
      <div class="flex items-center gap-3">
        <span class="text-3xl">🏆</span>
        <div>
          <p class="font-bold text-black text-lg">New PR!</p>
          <p class="text-black/80 text-sm">{{ exerciseName }}</p>
          <p class="text-black/70 text-xs">Est. 1RM: {{ estimated1rm }} lbs</p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.pr-slide-enter-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.pr-slide-leave-active {
  transition: all 0.3s ease-in;
}
.pr-slide-enter-from {
  transform: translateY(-100px) scale(0.8);
  opacity: 0;
}
.pr-slide-leave-to {
  transform: translateY(-50px);
  opacity: 0;
}
</style>
