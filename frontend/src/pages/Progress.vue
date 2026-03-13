<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { usePersonStore } from '../stores/person'
import { storeToRefs } from 'pinia'
import pb from '../pb'
import WeightChart from '../components/WeightChart.vue'
import type { WeightEntry, Measurement, PersonalRecord, ExerciseLibrary } from '../types'

const personStore = usePersonStore()
const { activePersonId } = storeToRefs(personStore)

const weightEntries = ref<WeightEntry[]>([])
const measurements = ref<Measurement[]>([])
const personalRecords = ref<(PersonalRecord & { expand?: { exercise?: ExerciseLibrary } })[]>([])
const loading = ref(false)
const activeTab = ref<'weight' | 'measurements' | 'records'>('weight')
const weightRange = ref<'30' | '90' | 'all'>('30')

// Measurement form
const showMeasurementForm = ref(false)
const measurementForm = ref({ waist_in: '', chest_in: '', left_arm_in: '', right_arm_in: '', notes: '' })
const savingMeasurement = ref(false)

async function loadData() {
  if (!activePersonId.value) return
  loading.value = true

  try {
    // Weight entries
    let weightFilter = `person = "${activePersonId.value}"`
    if (weightRange.value !== 'all') {
      const daysAgo = new Date()
      daysAgo.setDate(daysAgo.getDate() - parseInt(weightRange.value))
      weightFilter += ` && date >= "${daysAgo.toISOString()}"`
    }
    weightEntries.value = await pb.collection('weight_entries').getFullList<WeightEntry>({
      filter: weightFilter,
      sort: 'date',
    })

    // Measurements
    measurements.value = await pb.collection('measurements').getFullList<Measurement>({
      filter: `person = "${activePersonId.value}"`,
      sort: '-date',
    })

    // Personal Records
    personalRecords.value = await pb.collection('personal_records').getFullList({
      filter: `person = "${activePersonId.value}"`,
      sort: '-estimated_1rm',
      expand: 'exercise',
    }) as any[]
  } catch (e) {
    console.error('Failed to load progress data:', e)
  } finally {
    loading.value = false
  }
}

async function saveMeasurement() {
  if (!activePersonId.value) return
  savingMeasurement.value = true

  try {
    await pb.collection('measurements').create({
      person: activePersonId.value,
      date: new Date().toISOString(),
      waist_in: parseFloat(measurementForm.value.waist_in) || null,
      chest_in: parseFloat(measurementForm.value.chest_in) || null,
      left_arm_in: parseFloat(measurementForm.value.left_arm_in) || null,
      right_arm_in: parseFloat(measurementForm.value.right_arm_in) || null,
      notes: measurementForm.value.notes,
    })
    measurementForm.value = { waist_in: '', chest_in: '', left_arm_in: '', right_arm_in: '', notes: '' }
    showMeasurementForm.value = false
    loadData()
  } catch (e) {
    console.error('Failed to save measurement:', e)
  } finally {
    savingMeasurement.value = false
  }
}

// Group PRs by muscle group
const prsByMuscleGroup = computed(() => {
  const groups: Record<string, typeof personalRecords.value> = {}
  for (const pr of personalRecords.value) {
    const muscleGroups = pr.expand?.exercise?.muscle_groups || ['other']
    const primary = muscleGroups[0] || 'other'
    if (!groups[primary]) groups[primary] = []
    groups[primary].push(pr)
  }
  return groups
})

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

onMounted(loadData)
watch(activePersonId, loadData)
watch(weightRange, loadData)
</script>

<template>
  <div class="p-4 max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">Progress</h1>

    <!-- Tab selector -->
    <div class="flex gap-1 bg-surface-light rounded-lg p-1 mb-6">
      <button
        v-for="tab in (['weight', 'measurements', 'records'] as const)"
        :key="tab"
        @click="activeTab = tab"
        class="flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors capitalize min-h-[44px]"
        :class="activeTab === tab ? 'bg-accent text-white' : 'text-gray-400 hover:text-gray-100'"
      >
        {{ tab }}
      </button>
    </div>

    <div v-if="loading" class="space-y-4">
      <div class="bg-surface-lighter rounded-xl p-5 animate-pulse h-48"></div>
    </div>

    <template v-else>
      <!-- Weight Tab -->
      <div v-if="activeTab === 'weight'">
        <!-- Range toggle -->
        <div class="flex gap-2 mb-4">
          <button
            v-for="range in (['30', '90', 'all'] as const)"
            :key="range"
            @click="weightRange = range"
            class="px-3 py-1.5 rounded text-xs font-medium transition-colors"
            :class="weightRange === range ? 'bg-accent/20 text-accent' : 'text-gray-500 hover:text-gray-300'"
          >
            {{ range === 'all' ? 'All' : `${range}d` }}
          </button>
        </div>

        <WeightChart :entries="weightEntries" :height="250" />

        <div v-if="weightEntries.length === 0" class="text-center py-8">
          <p class="text-gray-400">No weight data for this period.</p>
        </div>
      </div>

      <!-- Measurements Tab -->
      <div v-if="activeTab === 'measurements'">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-sm text-gray-400 uppercase tracking-wider">Body Measurements</h2>
          <button
            @click="showMeasurementForm = !showMeasurementForm"
            class="text-sm text-accent min-h-[44px] flex items-center"
          >
            {{ showMeasurementForm ? 'Cancel' : '+ Log' }}
          </button>
        </div>

        <!-- Measurement form -->
        <div v-if="showMeasurementForm" class="bg-surface-lighter rounded-xl p-4 mb-4 space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs text-gray-400 block mb-1">Waist (in)</label>
              <input
                v-model="measurementForm.waist_in"
                type="number" step="0.1" inputmode="decimal"
                class="w-full bg-surface-light border border-gray-700 rounded px-2 py-1.5 text-sm focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label class="text-xs text-gray-400 block mb-1">Chest (in)</label>
              <input
                v-model="measurementForm.chest_in"
                type="number" step="0.1" inputmode="decimal"
                class="w-full bg-surface-light border border-gray-700 rounded px-2 py-1.5 text-sm focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label class="text-xs text-gray-400 block mb-1">Left Arm (in)</label>
              <input
                v-model="measurementForm.left_arm_in"
                type="number" step="0.1" inputmode="decimal"
                class="w-full bg-surface-light border border-gray-700 rounded px-2 py-1.5 text-sm focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label class="text-xs text-gray-400 block mb-1">Right Arm (in)</label>
              <input
                v-model="measurementForm.right_arm_in"
                type="number" step="0.1" inputmode="decimal"
                class="w-full bg-surface-light border border-gray-700 rounded px-2 py-1.5 text-sm focus:border-accent focus:outline-none"
              />
            </div>
          </div>
          <input
            v-model="measurementForm.notes"
            type="text" placeholder="Notes (optional)"
            class="w-full bg-surface-light border border-gray-700 rounded px-2 py-1.5 text-sm focus:border-accent focus:outline-none"
          />
          <button
            @click="saveMeasurement"
            :disabled="savingMeasurement"
            class="w-full bg-accent text-white py-2 rounded-lg font-medium min-h-[44px]"
          >
            {{ savingMeasurement ? 'Saving...' : 'Save Measurement' }}
          </button>
        </div>

        <!-- Measurement history -->
        <div v-if="measurements.length === 0" class="text-center py-8">
          <p class="text-gray-400">No measurements logged yet.</p>
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="m in measurements"
            :key="m.id"
            class="bg-surface-lighter rounded-xl p-4"
          >
            <p class="text-xs text-gray-500 mb-2">{{ formatDate(m.date) }}</p>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <span v-if="m.waist_in" class="text-gray-300">Waist: <strong>{{ m.waist_in }}"</strong></span>
              <span v-if="m.chest_in" class="text-gray-300">Chest: <strong>{{ m.chest_in }}"</strong></span>
              <span v-if="m.left_arm_in" class="text-gray-300">L Arm: <strong>{{ m.left_arm_in }}"</strong></span>
              <span v-if="m.right_arm_in" class="text-gray-300">R Arm: <strong>{{ m.right_arm_in }}"</strong></span>
            </div>
            <p v-if="m.notes" class="text-xs text-gray-500 mt-2 italic">{{ m.notes }}</p>
          </div>
        </div>
      </div>

      <!-- Records Tab -->
      <div v-if="activeTab === 'records'">
        <div v-if="personalRecords.length === 0" class="text-center py-8">
          <p class="text-gray-400">No personal records yet. Complete some workouts!</p>
        </div>

        <div v-else class="space-y-6">
          <div v-for="(prs, group) in prsByMuscleGroup" :key="group">
            <h3 class="text-sm font-medium text-gray-300 uppercase tracking-wider mb-2 capitalize">{{ group }}</h3>
            <div class="space-y-2">
              <div
                v-for="pr in prs"
                :key="pr.id"
                class="bg-surface-lighter rounded-lg p-3 flex items-center justify-between"
              >
                <div>
                  <p class="font-medium text-sm">{{ pr.expand?.exercise?.name || 'Exercise' }}</p>
                  <p class="text-xs text-gray-500">{{ formatDate(pr.date) }}</p>
                </div>
                <div class="text-right">
                  <p class="font-bold text-accent">{{ pr.weight_lbs }} lbs × {{ pr.reps }}</p>
                  <p class="text-xs text-gray-400">Est 1RM: {{ Math.round(pr.estimated_1rm) }} lbs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
