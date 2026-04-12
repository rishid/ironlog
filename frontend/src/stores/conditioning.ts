import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ConditioningConfig, ConditioningFormatOption } from '../types'

export const useConditioningStore = defineStore('conditioning', () => {
  // Set when a strength session finishes — triggers the offer overlay in App.vue
  const pendingProgramSessionId = ref<string | null>(null)
  // Loaded format options (the 3 cards shown on the offer screen)
  const offerOptions = ref<ConditioningFormatOption[]>([])
  // Set when user picks a format — consumed by /conditioning page
  const activeConfig = ref<ConditioningConfig | null>(null)

  const showOffer = computed(
    () => pendingProgramSessionId.value !== null && offerOptions.value.length > 0,
  )

  function setPending(programSessionId: string) {
    pendingProgramSessionId.value = programSessionId
    offerOptions.value = []
  }

  function setOfferOptions(options: ConditioningFormatOption[]) {
    offerOptions.value = options
  }

  function dismissOffer() {
    pendingProgramSessionId.value = null
    offerOptions.value = []
  }

  function startConditioning(config: ConditioningConfig) {
    activeConfig.value = config
    dismissOffer()
  }

  function clearActiveConfig() {
    activeConfig.value = null
  }

  return {
    pendingProgramSessionId,
    offerOptions,
    activeConfig,
    showOffer,
    setPending,
    setOfferOptions,
    dismissOffer,
    startConditioning,
    clearActiveConfig,
  }
})
