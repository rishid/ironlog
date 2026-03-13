<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePersonStore } from '../stores/person'
import { useSessionStore } from '../stores/session'
import { storeToRefs } from 'pinia'
import { useWorkoutSession } from '../composables/useSession'
import { getRestSeconds } from '../composables/useProgression'
import ExerciseCard from '../components/ExerciseCard.vue'
import FinisherBlock from '../components/FinisherBlock.vue'
import RestTimer from '../components/RestTimer.vue'
import PRBanner from '../components/PRBanner.vue'
import pb from '../pb'
import type { ProgramSession, ExercisePoolExpanded, SetData } from '../types'

const route = useRoute()
const router = useRouter()
const personStore = usePersonStore()
const sessionStore = useSessionStore()
const { activePersonId, activePerson } = storeToRefs(personStore)
const { isActive, exercises, activeSession } = storeToRefs(sessionStore)

const { generating, saving, prAlert, startSession, completeSet, swapExercise, finishSession, saveExerciseData } = useWorkoutSession()

const programSession = ref<ProgramSession | null>(null)
const elapsedTimer = ref('')
let timerInterval: ReturnType<typeof setInterval> | null = null

// Exercise pool for rest seconds lookup
const poolMap = ref<Map<string, ExercisePoolExpanded>>(new Map())

onMounted(async () => {
  const sessionId = route.query.sessionId as string
  if (sessionId && !isActive.value) {
    await startNewSession(sessionId)
  }
  startElapsedTimer()
})

async function startNewSession(sessionId: string) {
  if (!activePersonId.value) return

  try {
    const ps = await pb.collection('program_sessions').getOne<ProgramSession>(sessionId)
    programSession.value = ps

    // Load pool for rest seconds
    const pool = await pb.collection('exercise_pool').getFullList<ExercisePoolExpanded>({
      filter: `program_session = "${ps.id}"`,
      expand: 'exercise',
    })
    poolMap.value = new Map(pool.map((p) => [p.exercise, p]))

    await startSession(activePersonId.value, ps)
  } catch (e) {
    console.error('Failed to start session:', e)
  }
}

function startElapsedTimer() {
  timerInterval = setInterval(() => {
    if (sessionStore.startTime) {
      const elapsed = Math.floor((Date.now() - sessionStore.startTime) / 1000)
      const mins = Math.floor(elapsed / 60)
      const secs = elapsed % 60
      elapsedTimer.value = `${mins}:${secs.toString().padStart(2, '0')}`
    }
  }, 1000)
}

function getExerciseRestSeconds(exerciseId: string): number {
  const poolEntry = poolMap.value.get(exerciseId)
  if (poolEntry) return getRestSeconds(poolEntry)
  return 90
}

async function onCompleteSet(exerciseIndex: number, setIndex: number) {
  const exercise = exercises.value[exerciseIndex]
  if (!exercise) return

  // Ensure reps_actual is set
  const set = exercise.sets_data[setIndex]
  if (!set.reps_actual) {
    sessionStore.updateSetData(exerciseIndex, setIndex, { reps_actual: set.reps_target })
  }

  const restSecs = getExerciseRestSeconds(exercise.exercise)
  await completeSet(exerciseIndex, setIndex, activePersonId.value, restSecs)
}

function onUpdateSet(exerciseIndex: number, setIndex: number, data: Partial<SetData>) {
  sessionStore.updateSetData(exerciseIndex, setIndex, data)
}

function onAddSet(exerciseIndex: number) {
  sessionStore.addSet(exerciseIndex)
}

function onRemoveSet(exerciseIndex: number, setIndex: number) {
  sessionStore.removeSet(exerciseIndex, setIndex)
}

async function onSwap(exerciseIndex: number) {
  if (!programSession.value || !activePersonId.value) return
  await swapExercise(exerciseIndex, programSession.value.id, activePersonId.value)
}

async function onFinisherToggle(exerciseIndex: number, completed: boolean) {
  const exercise = exercises.value[exerciseIndex]
  if (!exercise) return

  // Set all sets as completed
  for (let i = 0; i < exercise.sets_data.length; i++) {
    sessionStore.updateSetData(exerciseIndex, i, {
      completed,
      reps_actual: completed ? exercise.sets_data[i].reps_target : 0,
    })
  }
  await saveExerciseData(exerciseIndex)
}

async function onFinish() {
  if (!programSession.value || !activePersonId.value) return
  if (!confirm('Finish this workout?')) return
  await finishSession(activePersonId.value, programSession.value)
  if (timerInterval) clearInterval(timerInterval)
  router.push('/')
}

const regularExercises = computed(() =>
  exercises.value.filter((e) => !e.is_finisher)
)
const finisherExercises = computed(() =>
  exercises.value.filter((e) => e.is_finisher)
)

// Show the workout page heading
const sessionName = computed(() => programSession.value?.name || activeSession.value?.expand?.program_session?.name || 'Workout')
</script>

<template>
  <div class="p-4 max-w-2xl mx-auto">
    <!-- PR Banner -->
    <PRBanner
      v-if="prAlert"
      :exercise-name="prAlert.exerciseName"
      :estimated1rm="prAlert.newE1rm"
    />

    <!-- Generating state -->
    <div v-if="generating" class="flex flex-col items-center justify-center py-20">
      <div class="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full animate-spin mb-4"></div>
      <p class="text-gray-400">Generating workout...</p>
    </div>

    <!-- No active session -->
    <div v-else-if="!isActive" class="flex flex-col items-center justify-center py-20">
      <p class="text-gray-400 mb-4">No active workout session.</p>
      <button
        @click="router.push('/')"
        class="bg-accent hover:bg-accent-light text-white font-semibold py-3 px-6 rounded-lg min-h-[44px]"
      >
        Go to Dashboard
      </button>
    </div>

    <!-- Active session -->
    <template v-else>
      <!-- Session header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-xl font-bold">{{ sessionName }}</h1>
          <p class="text-sm text-gray-400">
            {{ activePerson?.name }} · {{ elapsedTimer || '0:00' }}
          </p>
        </div>
        <button
          @click="onFinish"
          :disabled="saving"
          class="bg-success/20 text-success hover:bg-success/30 font-semibold py-2 px-4 rounded-lg text-sm transition-colors min-h-[44px]"
        >
          {{ saving ? 'Saving...' : 'Finish' }}
        </button>
      </div>

      <!-- Exercise list -->
      <div class="space-y-4">
        <!-- Regular exercises (anchors + fills) -->
        <ExerciseCard
          v-for="(exercise, i) in regularExercises"
          :key="exercise.id"
          :exercise="exercise as any"
          :exercise-index="exercises.indexOf(exercise)"
          :can-swap="!exercise.is_anchor"
          @update-set="onUpdateSet"
          @complete-set="onCompleteSet"
          @add-set="onAddSet"
          @remove-set="onRemoveSet"
          @swap="onSwap"
        />

        <!-- Finisher block -->
        <div v-if="finisherExercises.length > 0" class="space-y-3">
          <FinisherBlock
            v-for="(exercise, i) in finisherExercises"
            :key="exercise.id"
            :exercise-name="(exercise as any).expand?.exercise?.name || 'Finisher'"
            :completed="exercise.sets_data.every(s => s.completed)"
            @toggle="(completed) => onFinisherToggle(exercises.indexOf(exercise), completed)"
          />
        </div>
      </div>

      <!-- Rest Timer -->
      <RestTimer />
    </template>
  </div>
</template>
