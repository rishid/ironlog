<script setup lang="ts">
import { onMounted, computed, ref, shallowRef } from 'vue'
import { useRouter } from 'vue-router'
import { usePersonStore } from '../stores/person'
import { storeToRefs } from 'pinia'
import { useSequence } from '../composables/useSequence'
import { usePerson } from '../composables/usePerson'
import SessionPicker from '../components/SessionPicker.vue'
import WeightChart from '../components/WeightChart.vue'
import pb from '../pb'
import type { ProgramSession, WorkoutSessionExpanded, ExercisePoolExpanded } from '../types'

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

const weightInput = shallowRef('')
const showWeightInput = shallowRef(false)
const savingWeight = shallowRef(false)

// Session preview modal
const previewSession = shallowRef<ProgramSession | null>(null)
const previewPool = ref<ExercisePoolExpanded[]>([])
const loadingPreview = shallowRef(false)

async function onPreview(session: ProgramSession) {
  previewSession.value = session
  previewPool.value = []
  loadingPreview.value = true
  try {
    previewPool.value = await pb.collection('exercise_pool').getFullList<ExercisePoolExpanded>({
      filter: `program_session = "${session.id}"`,
      expand: 'exercise',
      sort: 'sort_hint',
    })
  } catch (e) {
    console.error('Failed to load preview:', e)
  } finally {
    loadingPreview.value = false
  }
}

const previewAnchors = computed(() => previewPool.value.filter(p => p.is_anchor && !p.is_finisher))
const previewPool_ = computed(() => previewPool.value.filter(p => !p.is_anchor && !p.is_finisher))
const previewFinishers = computed(() => previewPool.value.filter(p => p.is_finisher))

// Quick log modal
const showQuickLog = shallowRef(false)
const quickLogLabel = shallowRef('')
const quickLogDuration = shallowRef('')
const quickLogNotes = shallowRef('')
const quickLogDate = shallowRef(new Date().toISOString().split('T')[0])
const savingQuickLog = shallowRef(false)

function quickLogDateAsISO(): string {
  const today = new Date().toISOString().split('T')[0]
  if (quickLogDate.value === today) {
    return new Date().toISOString()
  }
  // Previous day: use noon to avoid timezone issues
  return `${quickLogDate.value}T12:00:00.000Z`
}

async function saveQuickLog() {
  if (!quickLogLabel.value.trim() || !activePersonId.value) return
  savingQuickLog.value = true
  try {
    await pb.collection('workout_sessions').create({
      person: activePersonId.value,
      date: quickLogDateAsISO(),
      completed: true,
      duration_minutes: quickLogDuration.value ? parseInt(quickLogDuration.value) : null,
      notes: quickLogNotes.value.trim() || null,
      template_snapshot: { freeform_label: quickLogLabel.value.trim() },
    })
    showQuickLog.value = false
    quickLogLabel.value = ''
    quickLogDuration.value = ''
    quickLogNotes.value = ''
    quickLogDate.value = new Date().toISOString().split('T')[0]
    loadDashboardData()
  } catch (e) {
    console.error('Failed to save quick log:', e)
  } finally {
    savingQuickLog.value = false
  }
}

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

const buildInfo = `${__BUILD_DATE__} · ${__GIT_HASH__}`
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
        @preview="onPreview"
      />

      <!-- Quick log button -->
      <button
        @click="showQuickLog = true"
        class="w-full mt-3 py-2.5 rounded-xl text-sm text-gray-400 border border-gray-700/50 hover:border-gray-600 hover:text-gray-300 transition-colors"
      >
        + Log a free workout (YouTube, class, etc.)
      </button>

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

      <!-- Build info -->
      <p class="mt-8 text-center text-[10px] text-gray-800 select-none">{{ buildInfo }}</p>
    </template>

    <!-- Session Preview Modal -->
    <Teleport to="body">
      <div v-if="previewSession" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="previewSession = null"></div>
        <div class="relative w-full max-w-md bg-surface rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[80vh] flex flex-col">
          <div class="p-5 border-b border-gray-700/50 flex items-center justify-between flex-shrink-0">
            <div>
              <p class="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Session preview</p>
              <h2 class="text-lg font-bold">{{ previewSession.name }}</h2>
            </div>
            <button @click="previewSession = null" class="text-gray-500 hover:text-gray-200 w-10 h-10 flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <div class="overflow-y-auto p-5 space-y-4">
            <div v-if="loadingPreview" class="text-center py-8 text-gray-500 text-sm">Loading...</div>
            <template v-else>
              <!-- Anchors -->
              <div v-if="previewAnchors.length">
                <p class="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">Always included</p>
                <div class="space-y-1.5">
                  <div v-for="p in previewAnchors" :key="p.id" class="flex items-center justify-between bg-surface-lighter rounded-lg px-3 py-2">
                    <span class="text-sm font-medium">{{ p.expand?.exercise?.name }}</span>
                    <span class="text-xs text-gray-500">{{ p.sets_target }}×{{ p.rep_min }}–{{ p.rep_max }}</span>
                  </div>
                </div>
              </div>

              <!-- Pool -->
              <div v-if="previewPool_.length">
                <p class="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Random pick · {{ previewSession.target_exercise_count - previewAnchors.length - previewFinishers.length }} of {{ previewPool_.length }} selected
                </p>
                <div class="space-y-1.5">
                  <div v-for="p in previewPool_" :key="p.id" class="flex items-center justify-between bg-surface-lighter rounded-lg px-3 py-2">
                    <span class="text-sm text-gray-300">{{ p.expand?.exercise?.name }}</span>
                    <span class="text-xs text-gray-500">{{ p.sets_target }}×{{ p.rep_min }}–{{ p.rep_max }}</span>
                  </div>
                </div>
              </div>

              <!-- Finishers -->
              <div v-if="previewFinishers.length">
                <p class="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">Finishers</p>
                <div class="space-y-1.5">
                  <div v-for="p in previewFinishers" :key="p.id" class="flex items-center justify-between bg-surface-lighter rounded-lg px-3 py-2">
                    <span class="text-sm text-gray-300">{{ p.expand?.exercise?.name }}</span>
                    <span class="text-xs text-gray-500">{{ p.rep_min }}–{{ p.rep_max }}</span>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <div class="p-4 border-t border-gray-700/50 flex-shrink-0">
            <button
              @click="onSessionSelect(previewSession!); previewSession = null"
              class="w-full bg-accent hover:bg-accent-light text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Start Workout
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Quick Log Modal -->
    <Teleport to="body">
      <div
        v-if="showQuickLog"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        @click.self="showQuickLog = false"
      >
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showQuickLog = false; quickLogDate = new Date().toISOString().split('T')[0]"></div>
        <div class="relative w-full max-w-md bg-surface rounded-t-2xl sm:rounded-2xl p-6 shadow-xl">
          <h2 class="text-lg font-bold mb-4">Log Free Workout</h2>

          <div class="space-y-3">
            <div>
              <label class="text-xs text-gray-400 uppercase tracking-wider block mb-1">What did you do? <span class="text-red-400">*</span></label>
              <input
                v-model="quickLogLabel"
                type="text"
                placeholder="e.g. ATHLEAN-X Full Body, Yoga Flow, Bike ride"
                class="w-full bg-surface-lighter border border-gray-700 rounded-xl px-4 py-3 text-sm focus:border-accent focus:outline-none"
                autofocus
              />
            </div>

            <div class="flex gap-3">
              <div class="flex-1">
                <label class="text-xs text-gray-400 uppercase tracking-wider block mb-1">Date</label>
                <input
                  v-model="quickLogDate"
                  type="date"
                  :max="new Date().toISOString().split('T')[0]"
                  class="w-full bg-surface-lighter border border-gray-700 rounded-xl px-4 py-3 text-sm focus:border-accent focus:outline-none"
                />
              </div>
              <div>
                <label class="text-xs text-gray-400 uppercase tracking-wider block mb-1">Duration</label>
                <div class="flex items-center gap-2">
                  <input
                    v-model="quickLogDuration"
                    type="number"
                    inputmode="numeric"
                    placeholder="45"
                    class="w-20 bg-surface-lighter border border-gray-700 rounded-xl px-4 py-3 text-sm focus:border-accent focus:outline-none"
                  />
                  <span class="text-sm text-gray-500">min</span>
                </div>
              </div>
            </div>

            <div>
              <label class="text-xs text-gray-400 uppercase tracking-wider block mb-1">Notes (optional)</label>
              <textarea
                v-model="quickLogNotes"
                placeholder="How did it feel? Any details worth noting..."
                rows="2"
                class="w-full bg-surface-lighter border border-gray-700 rounded-xl px-4 py-3 text-sm focus:border-accent focus:outline-none resize-none"
              ></textarea>
            </div>
          </div>

          <div class="flex gap-3 mt-5">
            <button
              @click="showQuickLog = false"
              class="flex-1 py-3 rounded-xl border border-gray-700 text-sm text-gray-400 hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              @click="saveQuickLog"
              :disabled="!quickLogLabel.trim() || savingQuickLog"
              class="flex-1 py-3 rounded-xl bg-accent text-white font-semibold text-sm disabled:opacity-40 transition-opacity"
            >
              {{ savingQuickLog ? 'Saving...' : 'Log Workout' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
