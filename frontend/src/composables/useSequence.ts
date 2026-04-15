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

      // Fetch only sequenced sessions — conditioning add-ons are excluded
      const programSessions = await pb.collection('program_sessions').getFullList<ProgramSession>({
        filter: `program = "${personProgram.value.program}" && is_post_workout_conditioning = false`,
        sort: 'sequence_order',
      })

      sessions.value = programSessions

      const pos = personProgram.value.current_sequence_position || 1
      suggestedSession.value =
        programSessions.find((s) => s.sequence_order === pos) ?? programSessions[0] ?? null
    } catch (e) {
      console.error('Failed to load sequence:', e)
    } finally {
      loading.value = false
    }
  }

  async function advanceCursor(completedSession: ProgramSession) {
    if (!personProgram.value) await load()
    if (!personProgram.value) return

    const total = sessions.value.length
    if (total === 0) return

    // Advance from the completed session's sequence position so that picking a
    // different session than suggested doesn't cause a wrap-around back to the
    // same session.
    const nextPos = (completedSession.sequence_order % total) + 1
    const skipped = suggestedSession.value?.id !== completedSession.id

    await pb.collection('person_programs').update(personProgram.value.id, {
      current_sequence_position: nextPos,
    })

    personProgram.value.current_sequence_position = nextPos
    return { skipped, suggestedSessionId: suggestedSession.value?.id }
  }

  watch(activePersonId, () => { load() })

  return { personProgram, sessions, suggestedSession, loading, load, advanceCursor }
}
