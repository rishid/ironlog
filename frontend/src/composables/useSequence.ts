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
  const optionalSessions = ref<ProgramSession[]>([])
  const loading = shallowRef(false)

  async function load() {
    if (!activePersonId.value) return
    loading.value = true

    try {
      const pps = await pb.collection('person_programs').getFullList<PersonProgram>({
        filter: `person = "${activePersonId.value}" && active = true`,
      })

      if (pps.length === 0) {
        personProgram.value = null
        sessions.value = []
        optionalSessions.value = []
        suggestedSession.value = null
        return
      }

      personProgram.value = pps[0]

      const programSessions = await pb.collection('program_sessions').getFullList<ProgramSession>({
        filter: `program = "${personProgram.value.program}"`,
        sort: 'sequence_order',
      })

      // Split into scheduled (non-optional) and optional add-ons
      const scheduled = programSessions.filter((s) => !s.is_post_workout_conditioning)
      const optional = programSessions.filter((s) => s.is_post_workout_conditioning)

      sessions.value = scheduled
      optionalSessions.value = optional

      // Suggested session is always among scheduled sessions only
      const pos = personProgram.value.current_sequence_position || 1
      suggestedSession.value = scheduled.find((s) => s.sequence_order === pos) || scheduled[0] || null
    } catch (e) {
      console.error('Failed to load sequence:', e)
    } finally {
      loading.value = false
    }
  }

  async function advanceCursor(completedSession: ProgramSession) {
    if (!personProgram.value) {
      await load()
    }
    if (!personProgram.value) return

    // Only cycle through non-optional sessions
    const scheduled = sessions.value.filter((s) => !s.is_post_workout_conditioning)
    const totalSessions = scheduled.length
    if (totalSessions === 0) return

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

  return { personProgram, sessions, optionalSessions, suggestedSession, loading, load, advanceCursor }
}
