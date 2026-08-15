<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useDeckStore } from '../deck.store'
import { useCardStore } from '@/features/card/card.store'
import CardModal from '@/features/card/components/CardModal.vue'
import CardEditModal from '@/features/card/components/CardEditModal.vue'
import AuthHeader from '@/shared/components/AuthHeader.vue'
import ListPanel from '@/shared/components/ListPanel.vue'
import CardListHeader from '@/features/card/components/CardListHeader.vue'
import CardListRows from '@/features/card/components/CardListRows.vue'
import AddCardButton from '@/features/card/components/AddCardButton.vue'

const route = useRoute()
const deckId = computed(() => Number(route.params.deckId))
const deckStore = useDeckStore()
const cardStore = useCardStore()

const deckName = computed(() => deckStore.getDeckById(deckId.value)?.name)
const canStartStudy = computed(() => cardStore.cards.length > 0)

watch(
  deckId,
  async (id) => {
    if (!Number.isFinite(id)) return

    await cardStore.resetCards()

    if (!deckStore.decks.length) {
      await deckStore.fetchDecks()
    }

    await cardStore.fetchCards(id)
  },
  { immediate: true },
)

const addCard = (question: string, answer: string) => {
  cardStore.createCard(deckId.value, question, answer)
}

const updateCard = async (cardId: number, question: string, answer: string) => {
  const isUpdated = await cardStore.updateCard(deckId.value, cardId, {
    question,
    answer,
  })
  if (!isUpdated) return

  closeEditModal()
}

const deleteCard = (cardId: number) => {
  cardStore.deleteCard(deckId.value, cardId)
}

//カード作成モーダルの開閉
const isCreateCardModal = ref<boolean>(false)
const openCreateCardModal = () => {
  isCreateCardModal.value = true
}
const closeCreateCardModal = () => {
  isCreateCardModal.value = false
}

const editingCard = ref()
//カード編集モーダルの開閉
const isEditModal = ref<boolean>(false)
const openEditModal = (cardId: number) => {
  isEditModal.value = true

  editingCard.value = cardStore.getCardById(cardId)
}
const closeEditModal = () => {
  isEditModal.value = false
}
</script>

<template>
  <div class="min-h-screen bg-study-gray">
    <AuthHeader />
    <div class="relative mx-auto w-full max-w-5xl px-4 sm:px-6 py-8 space-y-6 pb-25">
      <RouterLink
        v-if="canStartStudy"
        :to="`/study/${deckId}`"
        class="flex items-center justify-center z-40 fixed top-20 right-[max(1rem,calc(50%-32rem+1rem))] sm:right-[max(1.5rem,calc(50%-32rem+1.5rem))] h-13 px-5 rounded-xl bg-basic-blue text-white font-black hover:bg-dark-blue transition-colors duration-200"
      >
        暗記へ
      </RouterLink>
      <button
        v-else
        type="button"
        class="flex items-center justify-center z-40 fixed top-20 right-[max(1rem,calc(50%-32rem+1rem))] sm:right-[max(1.5rem,calc(50%-32rem+1.5rem))] h-13 px-5 rounded-xl bg-basic-blue text-white font-black"
      >
        暗記へ
      </button>
      <AddCardButton @click="openCreateCardModal" />
      <ListPanel class="mt-15"
        ><template v-slot:header>
          <CardListHeader v-if="deckName" :deckName="deckName" />
        </template>
        <template v-slot:list>
          <CardListRows
            :cardList="cardStore.cards"
            @openEditModal="openEditModal"
            @deleteCard="deleteCard"
          />
        </template>
      </ListPanel>
    </div>
  </div>
  <CardModal :open="isCreateCardModal" @close="closeCreateCardModal" @addCard="addCard" />
  <CardEditModal
    v-if="isEditModal"
    :editingCard="editingCard"
    @closeEditModal="closeEditModal"
    @updateCard="updateCard"
  />
</template>
