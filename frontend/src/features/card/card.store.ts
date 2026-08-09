import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Card } from './card.types'
import { cardApi } from './card.api'

export const useCardStore = defineStore('card', () => {
  const cards = ref<Card[]>([])
  const loading = ref(false)
  const error = ref<string>('')

  const fetchCards = async (deckId: number) => {
    loading.value = true
    error.value = ''
    try {
      const res = await cardApi.list(deckId)
      cards.value = res
    } catch {
      error.value = 'カードの取得に失敗しました'
    } finally {
      loading.value = false
    }
  }

  const createCard = async (deckId: number, question: string, answer: string) => {
    error.value = ''
    const payload = {
      question: question,
      answer: answer,
    }
    try {
      const res = await cardApi.create(deckId, payload)
      cards.value.push(res)
    } catch {
      error.value = 'カードの作成に失敗しました'
    }
  }

  const updateCard = async (
    deckId: number,
    cardId: number,
    question: string,
    answer: string,
  ): Promise<boolean> => {
    error.value = ''
    const payload = {
      question: question,
      answer: answer,
    }
    try {
      const res = await cardApi.update(deckId, cardId, payload)

      // 同じ id の deck を差し替える
      const index = cards.value.findIndex((card) => card.id === cardId)
      if (index !== -1) {
        cards.value[index] = res
      }
      return true
    } catch {
      error.value = 'カードの更新に失敗しました'
      return false
    }
  }

  const deleteCard = async (deckId: number, cardId: number) => {
    error.value = ''

    try {
      await cardApi.delete(deckId, cardId)
      cards.value = cards.value.filter((card) => card.id !== cardId)
    } catch {
      error.value = 'カードの削除に失敗しました'
    }
  }

  const getCardById = (cardId: number) => {
    return cards.value.find((card) => card.id === cardId)
  }

  const resetCards = () => {
    cards.value = []
  }

  return {
    cards,

    fetchCards,
    createCard,
    updateCard,
    deleteCard,
    getCardById,
    resetCards,
  }
})
