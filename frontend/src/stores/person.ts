import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import pb from '../pb'
import type { Person } from '../types'

const EQUIPMENT_KEY = 'ironlog-equipment'

function loadEquipmentMap(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(EQUIPMENT_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveEquipmentMap(map: Record<string, string[]>) {
  localStorage.setItem(EQUIPMENT_KEY, JSON.stringify(map))
}

export const usePersonStore = defineStore('person', () => {
  const people = ref<Person[]>([])
  const activePersonId = ref<string>(localStorage.getItem('activePersonId') || '')
  const activePerson = ref<Person | null>(null)
  const loading = ref(false)

  // Per-person equipment profile: personId → Set of owned optional equipment
  const _equipmentMap = ref<Record<string, string[]>>(loadEquipmentMap())

  const ownedEquipment = computed<Set<string>>(() => {
    const id = activePersonId.value
    return new Set(_equipmentMap.value[id] || [])
  })

  function toggleEquipment(eq: string) {
    const id = activePersonId.value
    if (!id) return
    const current = new Set(_equipmentMap.value[id] || [])
    if (current.has(eq)) {
      current.delete(eq)
    } else {
      current.add(eq)
    }
    _equipmentMap.value = { ..._equipmentMap.value, [id]: Array.from(current) }
    saveEquipmentMap(_equipmentMap.value)
  }

  function hasEquipment(eq: string): boolean {
    return ownedEquipment.value.has(eq)
  }

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

  return {
    people,
    activePersonId,
    activePerson,
    loading,
    ownedEquipment,
    loadPeople,
    setActivePerson,
    toggleEquipment,
    hasEquipment,
  }
})
