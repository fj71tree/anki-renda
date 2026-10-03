export interface Deck {
  id: number
  name: string
}

export interface PaginatedDeckResponse {
  count: number
  next: string | null
  previous: string | null
  results: Deck[]
}
