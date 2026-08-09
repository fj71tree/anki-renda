import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '@/features/auth/auth.store'
import * as authApi from '@/features/auth/auth.api'

vi.mock('@/features/auth/auth.api', () => ({
  login: vi.fn(),
  register: vi.fn(),
  verifyEmail: vi.fn(),
  requestPasswordReset: vi.fn(),
  confirmPasswordReset: vi.fn(),
  refresh: vi.fn(),
}))

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('初期化時: localStorageのトークンを読み込む', () => {
    localStorage.setItem('accessToken', 'stored-access')
    localStorage.setItem('refreshToken', 'stored-refresh')

    const store = useAuthStore()

    expect(store.accessToken).toBe('stored-access')
    expect(store.refreshToken).toBe('stored-refresh')
    expect(store.isAuthenticated).toBe(true)
  })

  it('初期化時: トークンがなければ未認証になる', () => {
    const store = useAuthStore()

    expect(store.accessToken).toBe('')
    expect(store.refreshToken).toBe('')
    expect(store.isAuthenticated).toBe(false)
  })

  it('login: 成功時にトークンを保存してerrorをクリアする', async () => {
    const store = useAuthStore()
    vi.mocked(authApi.login).mockResolvedValue({
      access: 'new-access',
      refresh: 'new-refresh',
    })

    await store.login('user@example.com', 'password123')

    expect(authApi.login).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123',
    })
    expect(store.accessToken).toBe('new-access')
    expect(store.refreshToken).toBe('new-refresh')
    expect(localStorage.getItem('accessToken')).toBe('new-access')
    expect(localStorage.getItem('refreshToken')).toBe('new-refresh')
    expect(store.error).toBe(null)
    expect(store.isAuthenticated).toBe(true)
  })

  it('login: 失敗時にerrorを設定し例外を再スローする', async () => {
    const store = useAuthStore()
    const loginError = new Error('login failed')
    vi.mocked(authApi.login).mockRejectedValue(loginError)

    await expect(store.login('user@example.com', 'wrong-password')).rejects.toThrow('login failed')

    expect(store.error).toBe('ログインに失敗しました')
    expect(store.accessToken).toBe('')
    expect(store.refreshToken).toBe('')
    expect(localStorage.getItem('accessToken')).toBeNull()
    expect(localStorage.getItem('refreshToken')).toBeNull()
    expect(store.isAuthenticated).toBe(false)
  })

  it('register: 成功時にトークンを保存せずerrorをクリアする', async () => {
    const store = useAuthStore()
    vi.mocked(authApi.register).mockResolvedValue({ detail: 'Verification e-mail sent.' })

    await store.register('new-user@example.com', 'password123', 'password123')

    expect(authApi.register).toHaveBeenCalledWith({
      email: 'new-user@example.com',
      password1: 'password123',
      password2: 'password123',
    })
    expect(store.accessToken).toBe('')
    expect(store.refreshToken).toBe('')
    expect(localStorage.getItem('accessToken')).toBeNull()
    expect(localStorage.getItem('refreshToken')).toBeNull()
    expect(store.error).toBe(null)
    expect(store.isAuthenticated).toBe(false)
  })

  it('register: 失敗時にsignup用errorを設定し例外を再スローする', async () => {
    const store = useAuthStore()
    const registerError = new Error('register failed')
    vi.mocked(authApi.register).mockRejectedValue(registerError)

    await expect(
      store.register('new-user@example.com', 'password123', 'password123'),
    ).rejects.toThrow('register failed')

    expect(store.error).toBe('新規登録に失敗しました')
    expect(store.isAuthenticated).toBe(false)
  })

  it('verifyEmail: 成功時に認証状態を変更しない', async () => {
    const store = useAuthStore()
    vi.mocked(authApi.verifyEmail).mockResolvedValue({ detail: 'ok' })

    await store.verifyEmail('verification-key')

    expect(authApi.verifyEmail).toHaveBeenCalledWith({ key: 'verification-key' })
    expect(store.accessToken).toBe('')
    expect(store.refreshToken).toBe('')
    expect(store.error).toBe(null)
    expect(store.isAuthenticated).toBe(false)
  })

  it('verifyEmail: 失敗時にverify用errorを設定し例外を再スローする', async () => {
    const store = useAuthStore()
    const verifyError = new Error('verify failed')
    vi.mocked(authApi.verifyEmail).mockRejectedValue(verifyError)

    await expect(store.verifyEmail('bad-key')).rejects.toThrow('verify failed')

    expect(store.error).toBe('メール認証に失敗しました')
    expect(store.isAuthenticated).toBe(false)
  })

  it('requestPasswordReset: 成功時に認証状態を変更しない', async () => {
    const store = useAuthStore()
    vi.mocked(authApi.requestPasswordReset).mockResolvedValue({
      detail: 'Password reset e-mail has been sent.',
    })

    await store.requestPasswordReset('reset-user@example.com')

    expect(authApi.requestPasswordReset).toHaveBeenCalledWith({ email: 'reset-user@example.com' })
    expect(store.error).toBe(null)
    expect(store.isAuthenticated).toBe(false)
  })

  it('requestPasswordReset: 失敗時にerrorを設定する', async () => {
    const store = useAuthStore()
    const resetError = new Error('reset request failed')
    vi.mocked(authApi.requestPasswordReset).mockRejectedValue(resetError)

    await expect(store.requestPasswordReset('reset-user@example.com')).rejects.toThrow(
      'reset request failed',
    )

    expect(store.error).toBe('パスワード再設定メールの送信に失敗しました')
    expect(store.isAuthenticated).toBe(false)
  })

  it('confirmPasswordReset: 成功時に認証状態を変更しない', async () => {
    const store = useAuthStore()
    vi.mocked(authApi.confirmPasswordReset).mockResolvedValue({
      detail: 'Password has been reset with the new password.',
    })

    await store.confirmPasswordReset(
      'uid-value',
      'token-value',
      'NewPassword123!',
      'NewPassword123!',
    )

    expect(authApi.confirmPasswordReset).toHaveBeenCalledWith({
      uid: 'uid-value',
      token: 'token-value',
      new_password1: 'NewPassword123!',
      new_password2: 'NewPassword123!',
    })
    expect(store.error).toBe(null)
    expect(store.isAuthenticated).toBe(false)
  })

  it('confirmPasswordReset: 失敗時にerrorを設定する', async () => {
    const store = useAuthStore()
    const confirmError = new Error('reset confirm failed')
    vi.mocked(authApi.confirmPasswordReset).mockRejectedValue(confirmError)

    await expect(
      store.confirmPasswordReset('uid-value', 'token-value', 'NewPassword123!', 'NewPassword123!'),
    ).rejects.toThrow('reset confirm failed')

    expect(store.error).toBe('パスワードの再設定に失敗しました')
    expect(store.isAuthenticated).toBe(false)
  })

  it('setAccessToken: accessTokenとlocalStorageを更新する', () => {
    const store = useAuthStore()

    store.setAccessToken('updated-access')

    expect(store.accessToken).toBe('updated-access')
    expect(localStorage.getItem('accessToken')).toBe('updated-access')
    expect(store.isAuthenticated).toBe(true)
  })

  it('logout: トークンとlocalStorageをクリアしerrorも空にする', () => {
    localStorage.setItem('accessToken', 'stored-access')
    localStorage.setItem('refreshToken', 'stored-refresh')
    const store = useAuthStore()
    store.error = 'something wrong'

    store.logout()

    expect(store.accessToken).toBe('')
    expect(store.refreshToken).toBe('')
    expect(localStorage.getItem('accessToken')).toBeNull()
    expect(localStorage.getItem('refreshToken')).toBeNull()
    expect(store.error).toBe(null)
    expect(store.isAuthenticated).toBe(false)
  })

  it('signOut: logoutと同じく認証情報をクリアする', () => {
    localStorage.setItem('accessToken', 'stored-access')
    localStorage.setItem('refreshToken', 'stored-refresh')
    const store = useAuthStore()

    store.signOut()

    expect(store.accessToken).toBe('')
    expect(store.refreshToken).toBe('')
    expect(localStorage.getItem('accessToken')).toBeNull()
    expect(localStorage.getItem('refreshToken')).toBeNull()
    expect(store.isAuthenticated).toBe(false)
  })
})
