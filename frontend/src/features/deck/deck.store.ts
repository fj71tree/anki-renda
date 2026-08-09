import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Deck } from '@/features/deck/deck.types'
import { deckApi } from '@/features/deck/deck.api'

export const useDeckStore = defineStore('deck', () => {
  const decks = ref<Deck[]>([])
  const loading = ref(false)
  const error = ref<string>('')

  const hasError = computed(() => error.value.length > 0)

  const fetchDecks = async () => {
    loading.value = true
    error.value = ''
    try {
      const res = await deckApi.list()
      decks.value = res
    } catch {
      error.value = 'デッキの取得に失敗しました'
    } finally {
      loading.value = false
    }
  }

  const createDeck = async (name: string, memo: string): Promise<boolean> => {
    error.value = ''
    const payload = {
      name: name,
      memo: memo,
    }
    try {
      const res = await deckApi.create(payload)
      decks.value.unshift(res)
      return true
    } catch {
      error.value = 'デッキの作成に失敗しました'
      return false
    }
  }

  const updateDeck = async (id: number, name: string, memo: string): Promise<boolean> => {
    error.value = ''
    const payload = {
      name: name,
      memo: memo,
    }
    try {
      const res = await deckApi.update(id, payload)

      // 同じ id の deck を差し替える
      const index = decks.value.findIndex((deck) => deck.id === id)
      if (index !== -1) {
        decks.value[index] = res
      }
      return true
    } catch {
      error.value = 'デッキの更新に失敗しました'
      return false
    }
  }

  const deleteDeck = async (id: number) => {
    error.value = ''

    try {
      await deckApi.delete(id)
      decks.value = decks.value.filter((deck) => deck.id !== id)
    } catch {
      error.value = 'デッキの削除に失敗しました'
    }
  }

  const getDeckById = (deckId: number) => {
    return decks.value.find((deck) => deck.id === deckId)
  }

  const setDecks = (next: Deck[]) => {
    decks.value = next
  }

  return {
    decks,
    loading,
    error,

    hasError,

    fetchDecks,
    createDeck,
    updateDeck,
    deleteDeck,
    getDeckById,
    setDecks,
  }
})
