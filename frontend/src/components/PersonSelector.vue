<script setup lang="ts">
import { usePersonStore } from '../stores/person'
import { storeToRefs } from 'pinia'

const personStore = usePersonStore()
const { people, activePersonId } = storeToRefs(personStore)
</script>

<template>
  <div class="flex items-center gap-1 bg-surface-light rounded-lg p-1">
    <button
      v-for="person in people"
      :key="person.id"
      @click="personStore.setActivePerson(person.id)"
      class="px-4 py-2 rounded-md text-sm font-medium transition-all min-h-[44px] min-w-[44px]"
      :class="activePersonId === person.id
        ? 'text-white shadow-md'
        : 'text-gray-400 hover:text-gray-200'"
      :style="activePersonId === person.id
        ? { backgroundColor: person.avatar_color }
        : {}"
    >
      {{ person.name }}
    </button>
  </div>
</template>
