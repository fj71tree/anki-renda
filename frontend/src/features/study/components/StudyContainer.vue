<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useDeckStore } from '@/features/deck/deck.store'
import { useCardStore } from '@/features/card/card.store'
import { useStudyStore } from '@/features/study/study.store'
import StudyFooter from './StudyFooter.vue'
import FlashCard from './FlashCard.vue'

const route = useRoute()
const deckStore = useDeckStore()
const cardStore = useCardStore()
const studyStore = useStudyStore()
const deckId = computed(() => Number(route.params.deckId))
const deck = computed(() => deckStore.getDeckById(deckId.value))

const count = ref(0)
const isSettingsOpen = ref(false)
const minCount = 0
const maxCount = computed(() => cardStore.cards.length - 1)
const card = computed(() => cardStore.cards[count.value])
const isAnswerVisible = ref(false)
const displayMode = ref<'split' | 'center'>('split')

watch(
  deckId,
  async (id) => {
    if (!Number.isFinite(id)) return

    count.value = 0
    isAnswerVisible.value = false
    cardStore.resetCards()

    if (!deckStore.decks.length) {
      await deckStore.fetchDecks()
    }

    await cardStore.fetchCards(id)
  },
  { immediate: true },
)

const moveCard = (direction: 'next' | 'prev') => {
  if (direction === 'next') {
    if (count.value >= maxCount.value) return
    count.value++
  } else {
    if (count.value <= minCount) return
    count.value--
  }
  isAnswerVisible.value = false
}

const revealOrMoveNext = () => {
  if (!isAnswerVisible.value) {
    isAnswerVisible.value = true
    return
  }
  moveCard('next')
}

const movePrev = () => {
  moveCard('prev')
}

// FlashCardがクリックされたとき
const onClick = (area: 'top' | 'bottom') => {
  if (displayMode.value === 'split' && !studyStore.hasShownSplitGuide) {
    studyStore.markSplitGuideShown()
  }
  if (displayMode.value === 'center' && !studyStore.hasShownCenterGuide) {
    studyStore.markCenterGuideShown()
  }
  if (area === 'top') {
    movePrev()
  } else {
    revealOrMoveNext()
  }
}

const onChangeDisplayMode = (mode: 'split' | 'center') => {
  displayMode.value = mode
}

const toggleSettings = () => {
  isSettingsOpen.value = !isSettingsOpen.value
}

const closeSettings = () => {
  isSettingsOpen.value = false
}
</script>

<template>
  <div
    v-if="deck && cardStore.cards.length > 0"
    class="relative bg-study-gray min-h-screen flex items-center justify-center overflow-hidden"
  >
    <div class="w-full max-w-none flex flex-col items-center px-0">
      <div class="w-full h-screen flex flex-col bg-transparent overflow-hidden">
        <FlashCard
          :question="card!.question"
          :answer="card!.answer"
          :isAnswerVisible="isAnswerVisible"
          :deckName="deck.name"
          :displayMode="displayMode"
          :isFirstCard="count === 0"
          :isCenterGuideOpen="displayMode === 'center' && !studyStore.hasShownCenterGuide"
          :isSplitGuideOpen="!studyStore.hasShownSplitGuide"
          @click="onClick"
          @change-display-mode="onChangeDisplayMode"
        />
        <StudyFooter
          :deckId="String(deckId)"
          :displayMode="displayMode"
          :isSettingsOpen="isSettingsOpen"
          @toggleSettings="toggleSettings"
          @settings-closed="closeSettings"
          @display-mode-changed="onChangeDisplayMode"
        />
      </div>
    </div>
  </div>
</template>
