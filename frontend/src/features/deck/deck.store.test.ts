import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useDeckStore } from '@/features/deck/deck.store'
import { deckApi } from '@/features/deck/deck.api'

vi.mock('@/features/deck/deck.api', () => ({
  deckApi: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

describe('useDeckStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('fetchDecks: 成功時にdecksを更新しerrorをクリアする', async () => {
    const store = useDeckStore()
    const decks = [
      { id: 1, name: 'Deck A' },
      { id: 2, name: 'Deck B' },
    ]
    vi.mocked(deckApi.list).mockResolvedValue(decks)

    await store.fetchDecks()

    expect(deckApi.list).toHaveBeenCalledTimes(1)
    expect(store.decks).toEqual(decks)
    expect(store.loading).toBe(false)
    expect(store.error).toBe('')
    expect(store.hasError).toBe(false)
  })

  it('fetchDecks: リクエスト中はloadingがtrueのままになる', async () => {
    const store = useDeckStore()
    const pending = deferred<Array<{ id: number; name: string }>>()
    vi.mocked(deckApi.list).mockReturnValue(pending.promise)

    const fetchPromise = store.fetchDecks()

    expect(store.loading).toBe(true)

    pending.resolve([{ id: 1, name: 'Deck A' }])
    await fetchPromise

    expect(store.loading).toBe(false)
  })

  it('fetchDecks: 失敗時にerrorを設定する', async () => {
    const store = useDeckStore()
    vi.mocked(deckApi.list).mockRejectedValue(new Error('network error'))

    await store.fetchDecks()

    expect(store.decks).toEqual([])
    expect(store.loading).toBe(false)
    expect(store.error).toBe('デッキの取得に失敗しました')
    expect(store.hasError).toBe(true)
  })

  it('createDeck: 成功時にデッキを先頭追加し正しいpayloadを送る', async () => {
    const store = useDeckStore()
    store.setDecks([{ id: 1, name: 'Old Deck' }])
    vi.mocked(deckApi.create).mockResolvedValue({ id: 2, name: 'New Deck' })

    await store.createDeck('New Deck', 'memo text')

    expect(deckApi.create).toHaveBeenCalledWith({ name: 'New Deck', memo: 'memo text' })
    expect(store.decks).toEqual([
      { id: 2, name: 'New Deck' },
      { id: 1, name: 'Old Deck' },
    ])
    expect(store.error).toBe('')
  })

  it('createDeck: 失敗時にerrorを設定しdecksを変更しない', async () => {
    const store = useDeckStore()
    const currentDecks = [{ id: 1, name: 'Deck A' }]
    store.setDecks(currentDecks)
    vi.mocked(deckApi.create).mockRejectedValue(new Error('create failed'))

    await store.createDeck('Deck B', 'memo')

    expect(store.decks).toEqual(currentDecks)
    expect(store.error).toBe('デッキの作成に失敗しました')
  })

  it('updateDeck: 成功時に一致するidのデッキを置き換える', async () => {
    const store = useDeckStore()
    store.setDecks([
      { id: 1, name: 'Deck A' },
      { id: 2, name: 'Deck B' },
    ])
    vi.mocked(deckApi.update).mockResolvedValue({ id: 2, name: 'Deck B Updated' })

    await store.updateDeck(2, 'Deck B Updated', 'memo')

    expect(deckApi.update).toHaveBeenCalledWith(2, { name: 'Deck B Updated', memo: 'memo' })
    expect(store.decks).toEqual([
      { id: 1, name: 'Deck A' },
      { id: 2, name: 'Deck B Updated' },
    ])
    expect(store.error).toBe('')
  })

  it('updateDeck: 対象idが見つからない場合はdecksを変更しない', async () => {
    const store = useDeckStore()
    const currentDecks = [{ id: 1, name: 'Deck A' }]
    store.setDecks(currentDecks)
    vi.mocked(deckApi.update).mockResolvedValue({ id: 999, name: 'Ghost Deck' })

    await store.updateDeck(999, 'Ghost Deck', 'memo')

    expect(store.decks).toEqual(currentDecks)
  })

  it('updateDeck: 失敗時にerrorを設定しdecksを維持する', async () => {
    const store = useDeckStore()
    const currentDecks = [{ id: 1, name: 'Deck A' }]
    store.setDecks(currentDecks)
    vi.mocked(deckApi.update).mockRejectedValue(new Error('update failed'))

    await store.updateDeck(1, 'Deck A Updated', 'memo')

    expect(store.decks).toEqual(currentDecks)
    expect(store.error).toBe('デッキの更新に失敗しました')
  })

  it('deleteDeck: 成功時に一致するidのデッキを削除する', async () => {
    const store = useDeckStore()
    store.setDecks([
      { id: 1, name: 'Deck A' },
      { id: 2, name: 'Deck B' },
    ])
    vi.mocked(deckApi.delete).mockResolvedValue(undefined)

    await store.deleteDeck(1)

    expect(deckApi.delete).toHaveBeenCalledWith(1)
    expect(store.decks).toEqual([{ id: 2, name: 'Deck B' }])
    expect(store.error).toBe('')
  })

  it('deleteDeck: 失敗時にerrorを設定しdecksを維持する', async () => {
    const store = useDeckStore()
    const currentDecks = [{ id: 1, name: 'Deck A' }]
    store.setDecks(currentDecks)
    vi.mocked(deckApi.delete).mockRejectedValue(new Error('delete failed'))

    await store.deleteDeck(1)

    expect(store.decks).toEqual(currentDecks)
    expect(store.error).toBe('デッキの削除に失敗しました')
  })

  it('getDeckById: 存在するidはデッキを返し存在しないidはundefinedを返す', () => {
    const store = useDeckStore()
    store.setDecks([{ id: 1, name: 'Deck A' }])

    expect(store.getDeckById(1)).toEqual({ id: 1, name: 'Deck A' })
    expect(store.getDeckById(999)).toBeUndefined()
  })

  it('setDecks: decksを渡した配列で置き換える', () => {
    const store = useDeckStore()
    const nextDecks = [
      { id: 10, name: 'Deck X' },
      { id: 11, name: 'Deck Y' },
    ]

    store.setDecks(nextDecks)

    expect(store.decks).toEqual(nextDecks)
  })
})
