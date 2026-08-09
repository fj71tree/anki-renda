import { api } from '@/shared/shared.api'
import type { Card } from '@/features/card/card.types'

export const cardApi = {
  async list(deckId: number): Promise<Card[]> {
    return api.get<Card[]>(`/api/decks/${deckId}/cards/`)
  },

  async create(deckId: number, payload: { question: string; answer: string }): Promise<Card> {
    return api.post<Card>(`/api/decks/${deckId}/cards/`, payload)
  },

  async update(
    deckId: number,
    cardId: number,
    payload: { question: string; answer: string },
  ): Promise<Card> {
    return api.put<Card>(`/api/decks/${deckId}/cards/${cardId}/`, payload)
  },

  async delete(deckId: number, cardId: number): Promise<void> {
    await api.delete(`/api/decks/${deckId}/cards/${cardId}/`)
  },
}
