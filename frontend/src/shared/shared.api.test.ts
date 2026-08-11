import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { api } from '@/shared/shared.api'
import { useAuthStore } from '@/features/auth/auth.store'
import * as authApi from '@/features/auth/auth.api'
import router from '@/router'

const { replaceMock } = vi.hoisted(() => ({
  replaceMock: vi.fn(),
}))

vi.mock('@/features/auth/auth.api', () => ({
  login: vi.fn(),
  refresh: vi.fn(),
}))

vi.mock('@/router', () => ({
  default: {
    replace: replaceMock,
    currentRoute: {
      value: { name: 'decks' },
    },
  },
}))

const jsonResponse = (body: unknown, init?: ResponseInit) => {
  // status: 200は初期値。必要に応じてinitで上書きされる。
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
}

describe('shared api token refresh flow', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn())
    ;(router.currentRoute.value as { name: string }).name = 'decks'
  })

  it('401後にrefresh成功で新アクセストークンで再試行する', async () => {
    const store = useAuthStore()
    store.setAccessToken('expired-access')
    //refresh APIの戻り値をモックする
    vi.mocked(authApi.refresh).mockResolvedValue({ access: 'new-access' })

    //fetchのモック。最初のリクエストは401を返し、2回目のリクエストは成功を返す。
    const fetchMock = vi.mocked(fetch)
    fetchMock.mockImplementation(async (_input, init) => {
      const authHeader = new Headers(init?.headers).get('Authorization')

      if (authHeader === 'Bearer expired-access') {
        return jsonResponse({ detail: 'unauthorized' }, { status: 401 })
      }

      return jsonResponse([{ id: 1, name: 'Deck A' }], { status: 200 })
    })

    const result = await api.get<Array<{ id: number; name: string }>>('/api/decks/')

    expect(result).toEqual([{ id: 1, name: 'Deck A' }])
    expect(authApi.refresh).toHaveBeenCalledWith()
    expect(store.accessToken).toBe('new-access')
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(replaceMock).not.toHaveBeenCalled()
  })

  it('refresh失敗時はlogoutしてsigninへ遷移する', async () => {
    const store = useAuthStore()
    store.setAccessToken('expired-access')
    vi.mocked(authApi.refresh).mockRejectedValue(new Error('refresh failed'))

    const fetchMock = vi.mocked(fetch)
    fetchMock.mockResolvedValue(jsonResponse({ detail: 'unauthorized' }, { status: 401 }))

    await expect(api.get('/api/decks/')).rejects.toThrow('refresh failed')

    expect(store.accessToken).toBe('')
    expect(replaceMock).toHaveBeenCalledWith({ name: 'signin' })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
