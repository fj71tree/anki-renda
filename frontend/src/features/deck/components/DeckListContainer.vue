<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useDeckStore } from '@/features/deck/deck.store'
import DeckModal from '@/features/deck/components/DeckModal.vue'
import DeckEditModal from './DeckEditModal.vue'
import AuthHeader from '@/shared/components/AuthHeader.vue'
import AddDeckButton from '@/features/deck/components/AddDeckButton.vue'
import DeckListHeader from '@/features/deck/components/DeckListHeader.vue'
import DeckListRows from '@/features/deck/components/DeckListRows.vue'
import ListPanel from '@/shared/components/ListPanel.vue'
import DeckDeleteConfirmModal from './DeckDeleteConfirmModal.vue'

const deckStore = useDeckStore()

//デッキ一覧を取得
onMounted(() => {
  deckStore.fetchDecks()
})

//デッキ作成モーダルの開閉
const isCreateModal = ref<boolean>(false)
const openCreateModal = () => {
  isCreateModal.value = true
}
const closeCreateModal = () => {
  isCreateModal.value = false
}
const createModalResetKey = ref<number>(0)

//デッキ編集モーダルの開閉
const editingDeck = ref()
const isEditModal = ref<boolean>(false)
const openEditModal = (deckId: number) => {
  isEditModal.value = true

  editingDeck.value = deckStore.getDeckById(deckId)
}
const closeEditModal = () => {
  isEditModal.value = false
}

//デッキ作成
const addDeck = async (name: string, memo: string) => {
  const isCreated = await deckStore.createDeck(name, memo)
  if (!isCreated) return

  createModalResetKey.value += 1
  closeCreateModal()
}

//デッキ更新
const updateDeck = async (id: number, name: string, memo: string) => {
  const isUpdated = await deckStore.updateDeck(id, name, memo)
  if (!isUpdated) return

  closeEditModal()
}

//デッキ削除
const isDeleteConfirmModal = ref<boolean>(false)
const deletingDeckId = ref<number | null>(null)
const deletingDeckName = computed(() => {
  if (deletingDeckId.value === null) return ''

  return deckStore.getDeckById(deletingDeckId.value)?.name ?? ''
})

const openDeleteConfirmModal = (id: number) => {
  deletingDeckId.value = id
  isDeleteConfirmModal.value = true
}

const closeDeleteConfirmModal = () => {
  isDeleteConfirmModal.value = false
  deletingDeckId.value = null
}

const confirmDeleteDeck = async () => {
  if (deletingDeckId.value === null) return

  await deckStore.deleteDeck(deletingDeckId.value)
  closeDeleteConfirmModal()
}
</script>

<template>
  <div class="min-h-screen bg-study-gray pb-20">
    <AuthHeader />
    <div class="relative w-full max-w-5xl mx-auto space-y-6 px-4 sm:px-6 py-8">
      <AddDeckButton @click="openCreateModal" />

      <ListPanel class="mt-15">
        <template v-slot:header>
          <DeckListHeader />
        </template>

        <template v-slot:list>
          <DeckListRows
            :deckList="deckStore.decks"
            @openEditModal="openEditModal"
            @deleteDeck="openDeleteConfirmModal"
          />
        </template>
      </ListPanel>
    </div>
  </div>

  <!-- モーダル -->
  <DeckModal
    :open="isCreateModal"
    :resetKey="createModalResetKey"
    @close="closeCreateModal"
    @addDeck="addDeck"
  />
  <DeckEditModal
    v-if="isEditModal"
    :editingDeck="editingDeck"
    @closeEditModal="closeEditModal"
    @updateDeck="updateDeck"
  />
  <DeckDeleteConfirmModal
    v-if="isDeleteConfirmModal"
    :deletingDeckName="deletingDeckName"
    @deleteCanceled="closeDeleteConfirmModal"
    @deleteConfirmed="confirmDeleteDeck"
  />
</template>
