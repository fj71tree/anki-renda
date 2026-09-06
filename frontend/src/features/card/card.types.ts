export interface Card {
  id: number
  question: string
  answer: string
  is_checked: boolean
}

export interface CardUpdatePayload {
  question?: string
  answer?: string
  is_checked?: boolean
}
