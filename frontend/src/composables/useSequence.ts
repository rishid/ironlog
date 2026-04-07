import { ref, shallowRef, watch } from 'vue'
import pb from '../pb'
import type { PersonProgram, ProgramSession } from '../types'
import { usePersonStore } from '../stores/person'
import { storeToRefs } from 'pinia'

export function useSequence() {
  const personStore = usePersonStore()
  const { activePersonId } = storeToRefs(personStore)

  const personProgram = ref<PersonProgram | null>(null)
  const sessions = ref<ProgramSession[]>([])
  const suggestedSession = ref<ProgramSession | null>(null)
  const loading = shallowRef(false)

  async function load() {
    if (!activePersonId.value) return
    loading.value = true

    try {
      // Get active person_program
      const pps = await pb.collection('person_programs').getFullList<PersonProgram>({
        filter: `person = "${activePersonId.value}" && active = true`,
      })

      if (pps.length === 0) {
        personProgram.value = null
        sessions.value = []
        suggestedSession.value = null
        return
      }

      personProgram.value = pps[0]

      // Get all sessions for this program
      const programSessions = await pb.collection('program_sessions').getFullList<ProgramSession>({
        filter: `program = "${personProgram.value.program}"`,
        sort: 'sequence_order',
      })

      sessions.value = programSessions

      // Find suggested session based on cursor
      const pos = personProgram.value.current_sequence_position || 1
      suggestedSession.value = programSessions.find((s) => s.sequence_order === pos) || programSessions[0] || null
    } catch (e) {
      console.error('Failed to load sequence:', e)
    } finally {
      loading.value = false
    }
  }

  async function advanceCursor(completedSession: ProgramSession) {
    // May be called from a fresh instance (e.g. useWorkoutSession) — load if needed
    if (!personProgram.value) {
      await load()
    }
    if (!personProgram.value) return

    const totalSessions = sessions.value.length
    const currentPos = personProgram.value.current_sequence_position || 1
    const nextPos = (currentPos % totalSessions) + 1

    const skipped = suggestedSession.value?.id !== completedSession.id

    await pb.collection('person_programs').update(personProgram.value.id, {
      current_sequence_position: nextPos,
    })

    personProgram.value.current_sequence_position = nextPos

    return { skipped, suggestedSessionId: suggestedSession.value?.id }
  }

  watch(activePersonId, () => {
    load()
  })

  return { personProgram, sessions, suggestedSession, loading, load, advanceCursor }
}
