import { ref, shallowRef, watch } from 'vue'
import pb from '../pb'
import type { WorkoutSession, WeightEntry } from '../types'
import { usePersonStore } from '../stores/person'
import { storeToRefs } from 'pinia'

export function usePerson() {
  const personStore = usePersonStore()
  const { activePersonId, activePerson } = storeToRefs(personStore)

  const recentSessions = ref<WorkoutSession[]>([])
  const recentWeights = ref<WeightEntry[]>([])
  const sessionsThisWeek = shallowRef(0)
  const loading = shallowRef(false)

  async function loadDashboardData() {
    if (!activePersonId.value) return
    loading.value = true

    try {
      // Last 7 days sessions for consistency ring
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const weekSessions = await pb.collection('workout_sessions').getFullList<WorkoutSession>({
        filter: `person = "${activePersonId.value}" && completed = true && date >= "${weekAgo.toISOString()}"`,
        sort: '-date',
      })
      sessionsThisWeek.value = weekSessions.length

      // Last 5 sessions for recent history
      const recent = await pb.collection('workout_sessions').getList<WorkoutSession>(1, 5, {
        filter: `person = "${activePersonId.value}" && completed = true`,
        sort: '-date',
        expand: 'program_session',
      })
      recentSessions.value = recent.items

      // Last 14 days of weight entries
      const twoWeeksAgo = new Date()
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
      const weights = await pb.collection('weight_entries').getFullList<WeightEntry>({
        filter: `person = "${activePersonId.value}" && date >= "${twoWeeksAgo.toISOString()}"`,
        sort: 'date',
      })
      recentWeights.value = weights
    } catch (e) {
      console.error('Failed to load dashboard data:', e)
    } finally {
      loading.value = false
    }
  }

  watch(activePersonId, () => {
    loadDashboardData()
  })

  return { activePerson, recentSessions, recentWeights, sessionsThisWeek, loading, loadDashboardData }
}
