<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePersonStore } from '../stores/person'
import { storeToRefs } from 'pinia'
import { useSequence } from '../composables/useSequence'
import { usePerson } from '../composables/usePerson'
import SessionPicker from '../components/SessionPicker.vue'
import WeightChart from '../components/WeightChart.vue'
import pb from '../pb'
import type { ProgramSession, WorkoutSessionExpanded } from '../types'

const router = useRouter()
const personStore = usePersonStore()
const { activePerson, activePersonId } = storeToRefs(personStore)
const { suggestedSession, sessions, loading: seqLoading, load: loadSequence } = useSequence()
const { recentSessions, recentWeights, sessionsThisWeek, loading: dataLoading, loadDashboardData } = usePerson()

onMounted(() => {
  loadSequence()
  loadDashboardData()
})

const loading = computed(() => seqLoading.value || dataLoading.value)

const weeklyTarget = computed(() => activePerson.value?.sessions_per_week_target || 0)
const weeklyProgress = computed(() => {
  if (!weeklyTarget.value) return 0
  return Math.min(100, (sessionsThisWeek.value / weeklyTarget.value) * 100)
})

const latestWeight = computed(() => {
  if (recentWeights.value.length === 0) return null
  return recentWeights.value[recentWeights.value.length - 1]
})

const lastSession = computed(() => {
  return recentSessions.value[0] as WorkoutSessionExpanded | undefined
})

const weightInput = ref('')
const showWeightInput = ref(false)
const savingWeight = ref(false)

function onSessionSelect(session: ProgramSession) {
  router.push({ path: '/workout', query: { sessionId: session.id } })
}

async function saveWeight() {
  const val = parseFloat(weightInput.value)
  if (!val || !activePersonId.value) return
  savingWeight.value = true
  try {
    await pb.collection('weight_entries').create({
      person: activePersonId.value,
      date: new Date().toISOString(),
      weight_lbs: val,
    })
    weightInput.value = ''
    showWeightInput.value = false
    loadDashboardData()
  } catch (e) {
    console.error('Failed to save weight:', e)
  } finally {
    savingWeight.value = false
  }
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / 86400000)

  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr)
  const dateStr2 = formatDate(dateStr)
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  return `${dateStr2} at ${time}`
}
</script>

<template>
  <div class="p-4 max-w-2xl mx-auto">
    <!-- Greeting -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold">
        Hey {{ activePerson?.name || '...' }}
      </h1>
      <p class="text-gray-400 text-sm mt-1">Let's get to work.</p>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="space-y-4">
      <div class="bg-surface-lighter rounded-xl p-5 animate-pulse h-48"></div>
      <div class="bg-surface-lighter rounded-xl p-5 animate-pulse h-24"></div>
    </div>

    <template v-else>
      <!-- Session Picker -->
      <SessionPicker
        :suggested-session="suggestedSession"
        :sessions="sessions"
        @select="onSessionSelect"
      />

      <!-- Stats row -->
      <div class="grid grid-cols-2 gap-3 mt-6">
        <!-- Weekly consistency -->
        <div class="bg-surface-lighter rounded-xl p-4">
          <p class="text-xs text-gray-400 uppercase tracking-wider mb-2">This Week</p>
          <div class="flex items-center gap-3">
            <!-- Ring -->
            <div class="relative w-12 h-12">
              <svg class="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                <circle
                  class="text-gray-700"
                  stroke="currentColor"
                  stroke-width="3"
                  fill="none"
                  cx="18" cy="18" r="15.5"
                />
                <circle
                  class="text-accent"
                  stroke="currentColor"
                  stroke-width="3"
                  fill="none"
                  cx="18" cy="18" r="15.5"
                  :stroke-dasharray="`${weeklyProgress * 0.974} 100`"
                  stroke-linecap="round"
                />
              </svg>
              <span class="absolute inset-0 flex items-center justify-center text-xs font-bold">
                {{ sessionsThisWeek }}/{{ weeklyTarget }}
              </span>
            </div>
            <div>
              <p class="text-sm font-medium">
                {{ sessionsThisWeek >= weeklyTarget ? 'Target hit!' : `${weeklyTarget - sessionsThisWeek} to go` }}
              </p>
              <p class="text-xs text-gray-500">sessions</p>
            </div>
          </div>
        </div>

        <!-- Body weight -->
        <div class="bg-surface-lighter rounded-xl p-4">
          <p class="text-xs text-gray-400 uppercase tracking-wider mb-2">Weight</p>
          <div v-if="latestWeight && !showWeightInput">
            <p class="text-2xl font-bold">{{ latestWeight.weight_lbs }}</p>
            <p class="text-xs text-gray-500">lbs · {{ formatDate(latestWeight.date) }}</p>
            <button
              @click="showWeightInput = true"
              class="text-xs text-accent mt-1"
            >
              + Log
            </button>
          </div>
          <div v-else>
            <div class="flex gap-2">
              <input
                v-model="weightInput"
                type="number"
                step="0.1"
                inputmode="decimal"
                placeholder="lbs"
                class="flex-1 bg-surface-light border border-gray-700 rounded px-2 py-1.5 text-sm focus:border-accent focus:outline-none"
                @keyup.enter="saveWeight"
              />
              <button
                @click="saveWeight"
                :disabled="savingWeight"
                class="bg-accent text-white px-3 py-1.5 rounded text-sm min-h-[36px]"
              >
                Save
              </button>
            </div>
            <button
              v-if="latestWeight"
              @click="showWeightInput = false"
              class="text-xs text-gray-500 mt-1"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <!-- Weight chart -->
      <div v-if="recentWeights.length > 1" class="mt-6">
        <WeightChart :entries="recentWeights" :height="150" />
      </div>

      <!-- Last session -->
      <div v-if="lastSession" class="mt-6">
        <h2 class="text-sm text-gray-400 uppercase tracking-wider mb-2">Last Session</h2>
        <div class="bg-surface-lighter rounded-xl p-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-semibold">
                {{ (lastSession as any).expand?.program_session?.name || 'Workout' }}
              </h3>
              <p class="text-sm text-gray-400">
                {{ formatDateTime(lastSession.date) }}
                <span v-if="lastSession.duration_minutes"> · {{ lastSession.duration_minutes }} min</span>
              </p>
            </div>
            <button
              @click="router.push('/history')"
              class="text-accent text-sm min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              View all
            </button>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="sessions.length === 0 && !loading" class="mt-8 text-center">
        <p class="text-gray-400">No program configured yet.</p>
        <p class="text-sm text-gray-500 mt-1">Run the seed script to set up exercises and programs.</p>
      </div>
    </template>
  </div>
</template>
