import { api } from '@/shared/shared.api'
import type { Deck, PaginatedDeckResponse } from '@/features/deck/deck.types'

export const deckApi = {
  async list(): Promise<PaginatedDeckResponse> {
    return api.get<PaginatedDeckResponse>('/api/decks/')
  },

  async create(payload: { name: string; memo: string }): Promise<Deck> {
    return api.post<Deck>('/api/decks/', payload)
  },

  async update(id: number, payload: { name: string; memo: string }): Promise<Deck> {
    return api.put<Deck>(`/api/decks/${id}/`, payload)
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/decks/${id}/`)
  },
}
