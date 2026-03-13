import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import pb from '../pb'
import type { Person } from '../types'

export const usePersonStore = defineStore('person', () => {
  const people = ref<Person[]>([])
  const activePersonId = ref<string>(localStorage.getItem('activePersonId') || '')
  const activePerson = ref<Person | null>(null)
  const loading = ref(false)

  watch(activePersonId, (id) => {
    localStorage.setItem('activePersonId', id)
    activePerson.value = people.value.find((p) => p.id === id) || null
  })

  async function loadPeople() {
    loading.value = true
    try {
      const records = await pb.collection('people').getFullList<Person>()
      people.value = records
      if (!activePersonId.value && records.length > 0) {
        activePersonId.value = records[0].id
      }
      activePerson.value = records.find((p) => p.id === activePersonId.value) || records[0] || null
      if (activePerson.value) {
        activePersonId.value = activePerson.value.id
      }
    } catch (e) {
      console.error('Failed to load people:', e)
    } finally {
      loading.value = false
    }
  }

  function setActivePerson(id: string) {
    activePersonId.value = id
  }

  return { people, activePersonId, activePerson, loading, loadPeople, setActivePerson }
})
