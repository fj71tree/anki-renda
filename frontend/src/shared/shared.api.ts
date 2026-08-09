import { useAuthStore } from '@/features/auth/auth.store'
import * as authApi from '@/features/auth/auth.api'
import { ApiError, parseResponseBody } from '@/shared/http.util'
import router from '@/router'

let refreshPromise: Promise<string> | null = null
const REFRESH_URL = '/api/auth/token/refresh/'

const handleAuthFailure = async () => {
  const auth = useAuthStore()
  auth.logout()

  // サインイン画面以外にいる場合はサインイン画面にリダイレクト
  if (router.currentRoute.value.name !== 'signin') {
    await router.replace({ name: 'signin' })
  }
}

const request = async <T>(url: string, init: RequestInit, retry = false): Promise<T> => {
  const auth = useAuthStore()

  // リクエストにAuthorizationヘッダーを追加
  const headers = new Headers(init.headers)
  if (auth.accessToken) {
    headers.set('Authorization', `Bearer ${auth.accessToken}`)
  }

  const response = await fetch(url, {
    ...init,
    headers,
  })

  // 401 Unauthorized以外のときは通常通りレスポンスを処理
  if (response.status !== 401) {
    const body = await parseResponseBody(response)
    if (!response.ok) {
      throw new ApiError(response.status, body)
    }
    return body as T
  }

  // リフレッシュトークンがない場合やリフレッシュトークンのリクエストがすでにある場合は認証失敗として処理
  if (url.includes(REFRESH_URL) || retry || !auth.refreshToken) {
    await handleAuthFailure()
    const body = await parseResponseBody(response)
    throw new ApiError(response.status, body)
  }

  // リフレッシュトークンのリクエストがまだない場合はリフレッシュトークンのリクエストを開始
  if (!refreshPromise) {
    refreshPromise = authApi
      .refresh(auth.refreshToken)
      .then(({ access }) => {
        auth.setAccessToken(access)
        return access
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  // リフレッシュトークンのリクエストが完了するのを待ってから、再度元のリクエストを送る
  let newAccess: string
  try {
    newAccess = await refreshPromise
  } catch (error) {
    await handleAuthFailure()
    throw error
  }
  headers.set('Authorization', `Bearer ${newAccess}`)

  return request<T>(
    url,
    {
      ...init,
      headers,
    },
    true,
  )
}

export const api = {
  get<T>(url: string): Promise<T> {
    return request<T>(url, { method: 'GET' })
  },

  post<T>(url: string, payload?: unknown): Promise<T> {
    const headers = new Headers()
    headers.set('Content-Type', 'application/json')
    return request<T>(url, {
      method: 'POST',
      body: payload === undefined ? undefined : JSON.stringify(payload),
      headers,
    })
  },

  put<T>(url: string, payload?: unknown): Promise<T> {
    const headers = new Headers()
    headers.set('Content-Type', 'application/json')
    return request<T>(url, {
      method: 'PUT',
      body: payload === undefined ? undefined : JSON.stringify(payload),
      headers,
    })
  },

  delete(url: string): Promise<void> {
    return request<void>(url, { method: 'DELETE' })
  },
}
