<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { usePersonStore } from '../stores/person'
import { storeToRefs } from 'pinia'
import pb from '../pb'
import type { WorkoutSessionExpanded, SessionExerciseExpanded } from '../types'

const personStore = usePersonStore()
const { activePersonId } = storeToRefs(personStore)

const sessions = ref<WorkoutSessionExpanded[]>([])
const loading = ref(false)
const expandedSessionId = ref<string | null>(null)
const sessionExercises = ref<SessionExerciseExpanded[]>([])
const loadingExercises = ref(false)

const currentMonth = ref(new Date())
const sessionDates = ref<Map<string, { type: string; count: number }>>(new Map())

async function loadSessions() {
  if (!activePersonId.value) return
  loading.value = true

  try {
    const result = await pb.collection('workout_sessions').getFullList<WorkoutSessionExpanded>({
      filter: `person = "${activePersonId.value}" && completed = true`,
      sort: '-date',
      expand: 'program_session',
    })
    sessions.value = result

    const dateMap = new Map<string, { type: string; count: number }>()
    for (const s of result) {
      const dateKey = new Date(s.date).toISOString().split('T')[0]
      const existing = dateMap.get(dateKey)
      if (existing) {
        existing.count++
      } else {
        dateMap.set(dateKey, {
          type: s.expand?.program_session?.session_type || 'strength',
          count: 1,
        })
      }
    }
    sessionDates.value = dateMap
  } catch (e) {
    console.error('Failed to load sessions:', e)
  } finally {
    loading.value = false
  }
}

async function loadSessionExercises(sessionId: string) {
  if (expandedSessionId.value === sessionId) {
    expandedSessionId.value = null
    return
  }

  expandedSessionId.value = sessionId
  loadingExercises.value = true

  try {
    const result = await pb.collection('session_exercises').getFullList<SessionExerciseExpanded>({
      filter: `session = "${sessionId}"`,
      sort: 'sort_order',
      expand: 'exercise',
    })
    sessionExercises.value = result
  } catch (e) {
    console.error('Failed to load exercises:', e)
  } finally {
    loadingExercises.value = false
  }
}

const calendarDays = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startPadding = firstDay.getDay()
  const days: (number | null)[] = []

  for (let i = 0; i < startPadding; i++) days.push(null)
  for (let i = 1; i <= lastDay.getDate(); i++) days.push(i)

  return days
})

const monthLabel = computed(() =>
  currentMonth.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
)

function prevMonth() {
  const d = new Date(currentMonth.value)
  d.setMonth(d.getMonth() - 1)
  currentMonth.value = d
}

function nextMonth() {
  const d = new Date(currentMonth.value)
  d.setMonth(d.getMonth() + 1)
  currentMonth.value = d
}

function getDayDot(day: number): string | null {
  const year = currentMonth.value.getFullYear()
  const month = (currentMonth.value.getMonth() + 1).toString().padStart(2, '0')
  const dayStr = day.toString().padStart(2, '0')
  const dateKey = `${year}-${month}-${dayStr}`
  const info = sessionDates.value.get(dateKey)
  if (!info) return null

  switch (info.type) {
    case 'strength': return 'bg-blue-400'
    case 'cardio': return 'bg-green-400'
    case 'recovery': return 'bg-purple-400'
    case 'mixed': return 'bg-yellow-400'
    default: return 'bg-gray-400'
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function formatSetsSummary(setsData: any[]): string {
  if (!setsData || setsData.length === 0) return ''
  const completed = setsData.filter((s: any) => s.completed)
  if (completed.length === 0) return 'No sets completed'
  const maxWeight = Math.max(...completed.map((s: any) => s.weight_lbs || 0))
  return `${completed.length} sets · ${maxWeight} lbs`
}

onMounted(loadSessions)
watch(activePersonId, loadSessions)
</script>

<template>
  <div class="p-4 max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">History</h1>

    <!-- Calendar -->
    <div class="bg-surface-lighter rounded-xl p-4 mb-6">
      <div class="flex items-center justify-between mb-4">
        <button @click="prevMonth" class="p-2 text-gray-400 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <h3 class="font-medium">{{ monthLabel }}</h3>
        <button @click="nextMonth" class="p-2 text-gray-400 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        </button>
      </div>

      <div class="grid grid-cols-7 text-center text-[10px] text-gray-500 mb-2">
        <span v-for="d in ['S','M','T','W','T','F','S']" :key="d">{{ d }}</span>
      </div>

      <div class="grid grid-cols-7 gap-1">
        <div
          v-for="(day, i) in calendarDays"
          :key="i"
          class="aspect-square flex flex-col items-center justify-center text-sm relative"
        >
          <span v-if="day" :class="getDayDot(day) ? 'text-white' : 'text-gray-500'">{{ day }}</span>
          <span
            v-if="day && getDayDot(day)"
            class="w-1.5 h-1.5 rounded-full absolute bottom-0.5"
            :class="getDayDot(day)!"
          ></span>
        </div>
      </div>

      <div class="flex items-center gap-3 mt-3 text-[10px] text-gray-500">
        <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-blue-400"></span> Strength</span>
        <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-green-400"></span> Cardio</span>
        <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-purple-400"></span> Recovery</span>
        <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-yellow-400"></span> Mixed</span>
      </div>
    </div>

    <!-- Session list -->
    <div v-if="loading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="bg-surface-lighter rounded-xl p-4 animate-pulse h-20"></div>
    </div>

    <div v-else-if="sessions.length === 0" class="text-center py-12">
      <p class="text-gray-400">No completed sessions yet.</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="session in sessions"
        :key="session.id"
        class="bg-surface-lighter rounded-xl overflow-hidden"
      >
        <button
          @click="loadSessionExercises(session.id)"
          class="w-full p-4 text-left flex items-center justify-between min-h-[44px]"
        >
          <div>
            <h3 class="font-semibold">
              {{ session.expand?.program_session?.name || 'Workout' }}
            </h3>
            <p class="text-sm text-gray-400">
              {{ formatDate(session.date) }}
              <span v-if="session.duration_minutes"> · {{ session.duration_minutes }} min</span>
              <span v-if="session.sequence_skipped" class="text-yellow-400 ml-1">
                (skipped suggested)
              </span>
            </p>
          </div>
          <svg
            class="w-5 h-5 text-gray-400 transition-transform"
            :class="{ 'rotate-180': expandedSessionId === session.id }"
            fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div v-if="expandedSessionId === session.id" class="px-4 pb-4 border-t border-gray-700/30">
          <div v-if="loadingExercises" class="py-4 text-center text-gray-500 text-sm">Loading...</div>
          <div v-else class="space-y-3 mt-3">
            <div
              v-for="ex in sessionExercises"
              :key="ex.id"
              class="flex items-start justify-between"
            >
              <div>
                <p class="text-sm font-medium">
                  {{ ex.expand?.exercise?.name || 'Exercise' }}
                  <span v-if="ex.is_anchor" class="text-[10px] text-accent ml-1">Anchor</span>
                  <span v-if="ex.is_finisher" class="text-[10px] text-amber-400 ml-1">Finisher</span>
                </p>
                <p class="text-xs text-gray-500">{{ formatSetsSummary(ex.sets_data) }}</p>
              </div>
              <div class="text-right">
                <div
                  v-for="(set, si) in (ex.sets_data || []).filter((s: any) => s.completed)"
                  :key="si"
                  class="text-xs text-gray-400"
                >
                  {{ set.weight_lbs }}lbs × {{ set.reps_actual }}
                  <span v-if="set.type !== 'normal'" class="text-[10px] ml-0.5"
                    :class="{
                      'text-blue-400': set.type === 'warmup',
                      'text-purple-400': set.type === 'drop',
                      'text-red-400': set.type === 'failure',
                    }"
                  >({{ set.type[0].toUpperCase() }})</span>
                </div>
              </div>
            </div>

            <p v-if="session.notes" class="text-sm text-gray-400 italic mt-2">{{ session.notes }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
