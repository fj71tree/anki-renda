import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useStudyStore = defineStore('study', () => {
  const hasShownSplitGuide = ref(false)
  const hasShownCenterGuide = ref(false)

  const markSplitGuideShown = () => {
    hasShownSplitGuide.value = true
  }

  const markCenterGuideShown = () => {
    hasShownCenterGuide.value = true
  }

  return {
    hasShownSplitGuide,
    hasShownCenterGuide,
    markSplitGuideShown,
    markCenterGuideShown,
  }
})
