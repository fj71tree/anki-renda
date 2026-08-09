import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useCardStore } from '@/features/card/card.store'
import { cardApi } from '@/features/card/card.api'

vi.mock('@/features/card/card.api', () => ({
  cardApi: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('useCardStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('fetchCards: 成功時にcardsを更新する', async () => {
    const store = useCardStore()
    const cards = [
      { id: 1, question: 'Q1', answer: 'A1', is_checked: false },
      { id: 2, question: 'Q2', answer: 'A2', is_checked: true },
    ]
    vi.mocked(cardApi.list).mockResolvedValue(cards)

    await store.fetchCards(10)

    expect(cardApi.list).toHaveBeenCalledWith(10)
    expect(store.cards).toEqual(cards)
  })

  it('fetchCards: 失敗時にcardsを変更しない', async () => {
    const store = useCardStore()
    const currentCards = [{ id: 1, question: 'Q1', answer: 'A1', is_checked: false }]
    store.cards = currentCards
    vi.mocked(cardApi.list).mockRejectedValue(new Error('network error'))

    await store.fetchCards(10)

    expect(store.cards).toEqual(currentCards)
  })

  it('createCard: 成功時にカードを末尾追加し正しいpayloadを送る', async () => {
    const store = useCardStore()
    store.cards = [{ id: 1, question: 'Q1', answer: 'A1', is_checked: false }]
    vi.mocked(cardApi.create).mockResolvedValue({ id: 2, question: 'Q2', answer: 'A2', is_checked: false })

    await store.createCard(10, 'Q2', 'A2')

    expect(cardApi.create).toHaveBeenCalledWith(10, { question: 'Q2', answer: 'A2' })
    expect(store.cards).toEqual([
      { id: 1, question: 'Q1', answer: 'A1', is_checked: false },
      { id: 2, question: 'Q2', answer: 'A2', is_checked: false },
    ])
  })

  it('createCard: 失敗時にcardsを変更しない', async () => {
    const store = useCardStore()
    const currentCards = [{ id: 1, question: 'Q1', answer: 'A1', is_checked: false }]
    store.cards = currentCards
    vi.mocked(cardApi.create).mockRejectedValue(new Error('create failed'))

    await store.createCard(10, 'Q2', 'A2')

    expect(store.cards).toEqual(currentCards)
  })

  it('updateCard: 成功時に一致するidのカードを置き換える', async () => {
    const store = useCardStore()
    store.cards = [
      { id: 1, question: 'Q1', answer: 'A1', is_checked: false },
      { id: 2, question: 'Q2', answer: 'A2', is_checked: false },
    ]
    vi.mocked(cardApi.update).mockResolvedValue({
      id: 2,
      question: 'Q2 updated',
      answer: 'A2 updated',
      is_checked: true,
    })

    await store.updateCard(10, 2, 'Q2 updated', 'A2 updated')

    expect(cardApi.update).toHaveBeenCalledWith(10, 2, {
      question: 'Q2 updated',
      answer: 'A2 updated',
    })
    expect(store.cards).toEqual([
      { id: 1, question: 'Q1', answer: 'A1', is_checked: false },
      { id: 2, question: 'Q2 updated', answer: 'A2 updated', is_checked: true },
    ])
  })

  it('updateCard: 対象idが見つからない場合はcardsを変更しない', async () => {
    const store = useCardStore()
    const currentCards = [{ id: 1, question: 'Q1', answer: 'A1', is_checked: false }]
    store.cards = currentCards
    vi.mocked(cardApi.update).mockResolvedValue({
      id: 999,
      question: 'Ghost Q',
      answer: 'Ghost A',
      is_checked: false,
    })

    await store.updateCard(10, 999, 'Ghost Q', 'Ghost A')

    expect(store.cards).toEqual(currentCards)
  })

  it('updateCard: 失敗時にcardsを変更しない', async () => {
    const store = useCardStore()
    const currentCards = [{ id: 1, question: 'Q1', answer: 'A1', is_checked: false }]
    store.cards = currentCards
    vi.mocked(cardApi.update).mockRejectedValue(new Error('update failed'))

    await store.updateCard(10, 1, 'Q1 updated', 'A1 updated')

    expect(store.cards).toEqual(currentCards)
  })

  it('deleteCard: 成功時に一致するidのカードを削除する', async () => {
    const store = useCardStore()
    store.cards = [
      { id: 1, question: 'Q1', answer: 'A1', is_checked: false },
      { id: 2, question: 'Q2', answer: 'A2', is_checked: true },
    ]
    vi.mocked(cardApi.delete).mockResolvedValue(undefined)

    await store.deleteCard(10, 1)

    expect(cardApi.delete).toHaveBeenCalledWith(10, 1)
    expect(store.cards).toEqual([{ id: 2, question: 'Q2', answer: 'A2', is_checked: true }])
  })

  it('deleteCard: 失敗時にcardsを変更しない', async () => {
    const store = useCardStore()
    const currentCards = [{ id: 1, question: 'Q1', answer: 'A1', is_checked: false }]
    store.cards = currentCards
    vi.mocked(cardApi.delete).mockRejectedValue(new Error('delete failed'))

    await store.deleteCard(10, 1)

    expect(store.cards).toEqual(currentCards)
  })

  it('getCardById: 存在するidはカードを返し存在しないidはundefinedを返す', () => {
    const store = useCardStore()
    store.cards = [{ id: 1, question: 'Q1', answer: 'A1', is_checked: false }]

    expect(store.getCardById(1)).toEqual({ id: 1, question: 'Q1', answer: 'A1', is_checked: false })
    expect(store.getCardById(999)).toBeUndefined()
  })

  it('resetCards: cardsを空配列にする', () => {
    const store = useCardStore()
    store.cards = [{ id: 1, question: 'Q1', answer: 'A1', is_checked: false }]

    store.resetCards()

    expect(store.cards).toEqual([])
  })
})
