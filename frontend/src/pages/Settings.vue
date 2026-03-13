<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { usePersonStore } from '../stores/person'
import { storeToRefs } from 'pinia'
import pb from '../pb'
import type { ExerciseLibrary, Person } from '../types'

const personStore = usePersonStore()
const { people } = storeToRefs(personStore)

const activeTab = ref<'library' | 'people' | 'export'>('library')

// Exercise library
const exercises = ref<ExerciseLibrary[]>([])
const exerciseFilter = ref('')
const typeFilter = ref('')
const loadingExercises = ref(false)

async function loadExercises() {
  loadingExercises.value = true
  try {
    exercises.value = await pb.collection('exercise_library').getFullList<ExerciseLibrary>({
      filter: 'archived = false',
      sort: 'name',
    })
  } catch (e) {
    console.error('Failed to load exercises:', e)
  } finally {
    loadingExercises.value = false
  }
}

const filteredExercises = computed(() => {
  return exercises.value.filter((ex) => {
    const nameMatch = !exerciseFilter.value || ex.name.toLowerCase().includes(exerciseFilter.value.toLowerCase())
    const typeMatch = !typeFilter.value || ex.type === typeFilter.value
    return nameMatch && typeMatch
  })
})

const exerciseTypes = ['strength', 'cardio', 'plyometric', 'core']

const muscleGroupColors: Record<string, string> = {
  chest: 'bg-red-500/20 text-red-400',
  back: 'bg-blue-500/20 text-blue-400',
  shoulders: 'bg-yellow-500/20 text-yellow-400',
  biceps: 'bg-green-500/20 text-green-400',
  triceps: 'bg-purple-500/20 text-purple-400',
  quads: 'bg-orange-500/20 text-orange-400',
  hamstrings: 'bg-pink-500/20 text-pink-400',
  glutes: 'bg-rose-500/20 text-rose-400',
  core: 'bg-cyan-500/20 text-cyan-400',
  calves: 'bg-teal-500/20 text-teal-400',
  forearms: 'bg-lime-500/20 text-lime-400',
  traps: 'bg-indigo-500/20 text-indigo-400',
  legs: 'bg-orange-500/20 text-orange-400',
  adductors: 'bg-fuchsia-500/20 text-fuchsia-400',
  obliques: 'bg-emerald-500/20 text-emerald-400',
}

// CSV Export
const exporting = ref(false)

async function exportCSV(collection: string, filename: string) {
  exporting.value = true
  try {
    const records = await pb.collection(collection).getFullList()
    if (records.length === 0) {
      alert('No data to export')
      return
    }

    const headers = Object.keys(records[0]).filter((k) => !k.startsWith('collectionId') && !k.startsWith('collectionName'))
    const rows = records.map((r) =>
      headers.map((h) => {
        const val = (r as any)[h]
        if (typeof val === 'object') return JSON.stringify(val)
        return String(val ?? '')
      })
    )

    const csv = [headers.join(','), ...rows.map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(','))].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  } catch (e) {
    console.error('Export failed:', e)
    alert('Export failed')
  } finally {
    exporting.value = false
  }
}

onMounted(loadExercises)
</script>

<template>
  <div class="p-4 max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">Settings</h1>

    <!-- Tab selector -->
    <div class="flex gap-1 bg-surface-light rounded-lg p-1 mb-6">
      <button
        v-for="tab in (['library', 'people', 'export'] as const)"
        :key="tab"
        @click="activeTab = tab"
        class="flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors capitalize min-h-[44px]"
        :class="activeTab === tab ? 'bg-accent text-white' : 'text-gray-400 hover:text-white'"
      >
        {{ tab === 'library' ? 'Exercises' : tab }}
      </button>
    </div>

    <!-- Exercise Library Tab -->
    <div v-if="activeTab === 'library'">
      <!-- Filters -->
      <div class="flex gap-2 mb-4">
        <input
          v-model="exerciseFilter"
          type="text"
          placeholder="Search exercises..."
          class="flex-1 bg-surface-light border border-gray-700 rounded-lg px-3 py-2 text-sm focus:border-accent focus:outline-none"
        />
        <select
          v-model="typeFilter"
          class="bg-surface-light border border-gray-700 rounded-lg px-3 py-2 text-sm focus:border-accent focus:outline-none"
        >
          <option value="">All types</option>
          <option v-for="t in exerciseTypes" :key="t" :value="t">{{ t }}</option>
        </select>
      </div>

      <p class="text-xs text-gray-500 mb-3">{{ filteredExercises.length }} exercises</p>

      <div v-if="loadingExercises" class="space-y-2">
        <div v-for="i in 5" :key="i" class="bg-surface-lighter rounded-lg p-3 animate-pulse h-14"></div>
      </div>

      <div v-else class="space-y-2">
        <div
          v-for="ex in filteredExercises"
          :key="ex.id"
          class="bg-surface-lighter rounded-lg p-3"
        >
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-medium">{{ ex.name }}</h3>
              <div class="flex items-center gap-1 mt-1 flex-wrap">
                <span
                  v-for="mg in ex.muscle_groups"
                  :key="mg"
                  class="text-[10px] px-1.5 py-0.5 rounded"
                  :class="muscleGroupColors[mg] || 'bg-gray-500/20 text-gray-400'"
                >
                  {{ mg }}
                </span>
              </div>
            </div>
            <div class="text-right">
              <span
                class="text-[10px] px-2 py-1 rounded capitalize"
                :class="{
                  'bg-blue-500/20 text-blue-400': ex.type === 'strength',
                  'bg-green-500/20 text-green-400': ex.type === 'cardio',
                  'bg-orange-500/20 text-orange-400': ex.type === 'plyometric',
                  'bg-cyan-500/20 text-cyan-400': ex.type === 'core',
                }"
              >
                {{ ex.type }}
              </span>
              <p v-if="ex.default_increment_lbs > 0" class="text-[10px] text-gray-500 mt-1">
                +{{ ex.default_increment_lbs }} lbs
              </p>
            </div>
          </div>
          <div v-if="ex.equipment.length > 0" class="mt-1">
            <span class="text-[10px] text-gray-500">
              {{ ex.equipment.join(', ') }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- People Tab -->
    <div v-if="activeTab === 'people'">
      <div class="space-y-3">
        <div
          v-for="person in people"
          :key="person.id"
          class="bg-surface-lighter rounded-xl p-4 flex items-center gap-4"
        >
          <div
            class="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white"
            :style="{ backgroundColor: person.avatar_color }"
          >
            {{ person.name[0] }}
          </div>
          <div>
            <h3 class="font-semibold">{{ person.name }}</h3>
            <p class="text-sm text-gray-400">
              Target: {{ person.sessions_per_week_target }} sessions/week
            </p>
          </div>
        </div>
      </div>

      <p class="text-xs text-gray-500 mt-4">
        People and programs are managed via the PocketBase admin panel.
      </p>
    </div>

    <!-- Export Tab -->
    <div v-if="activeTab === 'export'">
      <p class="text-sm text-gray-400 mb-4">Export your data as CSV files for analysis in Excel or Numbers.</p>

      <div class="space-y-3">
        <button
          v-for="exp in [
            { collection: 'workout_sessions', label: 'Workout Sessions', filename: 'sessions' },
            { collection: 'session_exercises', label: 'Session Exercises', filename: 'exercises' },
            { collection: 'weight_entries', label: 'Weight Entries', filename: 'weights' },
            { collection: 'measurements', label: 'Measurements', filename: 'measurements' },
            { collection: 'personal_records', label: 'Personal Records', filename: 'records' },
          ]"
          :key="exp.collection"
          @click="exportCSV(exp.collection, exp.filename)"
          :disabled="exporting"
          class="w-full bg-surface-lighter hover:bg-surface-light rounded-xl p-4 text-left flex items-center justify-between transition-colors min-h-[44px]"
        >
          <span class="font-medium text-sm">{{ exp.label }}</span>
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
        </button>
      </div>

      <div class="mt-8 p-4 bg-surface-lighter rounded-xl">
        <h3 class="text-sm font-medium mb-2">PocketBase Admin</h3>
        <p class="text-xs text-gray-400 mb-3">
          For advanced data management, exercise pool editing, and program changes,
          use the PocketBase admin panel.
        </p>
        <a
          href="/_/"
          target="_blank"
          class="text-accent text-sm hover:underline"
        >
          Open Admin Panel &rarr;
        </a>
      </div>
    </div>
  </div>
</template>
