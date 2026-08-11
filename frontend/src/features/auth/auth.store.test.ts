import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '@/features/auth/auth.store'
import * as authApi from '@/features/auth/auth.api'

vi.mock('@/features/auth/auth.api', () => ({
  login: vi.fn(),
  demoLogin: vi.fn(),
  register: vi.fn(),
  verifyEmail: vi.fn(),
  requestPasswordReset: vi.fn(),
  confirmPasswordReset: vi.fn(),
  refresh: vi.fn(),
  logout: vi.fn(),
  getCurrentUser: vi.fn(),
  requestEmailChange: vi.fn(),
  requestPasswordChange: vi.fn(),
  deleteAccount: vi.fn(),
}))

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('初期化時: トークンがなければ未認証になる', () => {
    const store = useAuthStore()

    expect(store.accessToken).toBe('')
    expect(store.isAuthenticated).toBe(false)
  })

  it('login: 成功時にトークンを保存してerrorをクリアする', async () => {
    const store = useAuthStore()
    vi.mocked(authApi.login).mockResolvedValue({
      access: 'new-access',
    })

    await store.login('user@example.com', 'password123')

    expect(authApi.login).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123',
    })
    expect(store.accessToken).toBe('new-access')
    expect(store.error).toBe(null)
    expect(store.authStatus).toBe('authenticated')
    expect(store.isAuthenticated).toBe(true)
  })

  it('login: 失敗時にerrorを設定し例外を再スローする', async () => {
    const store = useAuthStore()
    const loginError = new Error('login failed')
    vi.mocked(authApi.login).mockRejectedValue(loginError)

    await expect(store.login('user@example.com', 'wrong-password')).rejects.toThrow('login failed')

    expect(store.error).toBe('ログインに失敗しました')
    expect(store.accessToken).toBe('')
    expect(store.authStatus).toBe('unchecked')
    expect(store.isAuthenticated).toBe(false)
  })

  it('demoLogin: 成功時にトークンを保存して認証済みにする', async () => {
    const store = useAuthStore()
    vi.mocked(authApi.demoLogin).mockResolvedValue({
      access: 'demo-access',
    })

    await store.demoLogin()

    expect(authApi.demoLogin).toHaveBeenCalledOnce()
    expect(store.accessToken).toBe('demo-access')
    expect(store.error).toBe(null)
    expect(store.authStatus).toBe('authenticated')
    expect(store.isAuthenticated).toBe(true)
  })

  it('demoLogin: 失敗時にerrorを設定し例外を再スローする', async () => {
    const store = useAuthStore()
    const demoLoginError = new Error('demo login failed')
    vi.mocked(authApi.demoLogin).mockRejectedValue(demoLoginError)

    await expect(store.demoLogin()).rejects.toThrow('demo login failed')

    expect(store.error).toBe('デモログインに失敗しました')
    expect(store.accessToken).toBe('')
    expect(store.authStatus).toBe('unchecked')
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

  it('fetchCurrentUser: 成功時にcurrentUserを保存して返す', async () => {
    const store = useAuthStore()
    const currentUser = { email: 'user@example.com' }
    vi.mocked(authApi.getCurrentUser).mockResolvedValue(currentUser)

    await expect(store.fetchCurrentUser()).resolves.toEqual(currentUser)

    expect(authApi.getCurrentUser).toHaveBeenCalledOnce()
    expect(store.currentUser).toEqual(currentUser)
    expect(store.error).toBe(null)
  })

  it('fetchCurrentUser: 失敗時にerrorを設定し例外を再スローする', async () => {
    const store = useAuthStore()
    const currentUserError = new Error('fetch current user failed')
    vi.mocked(authApi.getCurrentUser).mockRejectedValue(currentUserError)

    await expect(store.fetchCurrentUser()).rejects.toThrow('fetch current user failed')

    expect(store.currentUser).toBe(null)
    expect(store.error).toBe('アカウント情報の取得に失敗しました')
  })

  it('requestEmailChange: 成功時にAPIを呼びerrorをクリアする', async () => {
    const store = useAuthStore()
    vi.mocked(authApi.requestEmailChange).mockResolvedValue({ detail: 'ok' })

    await store.requestEmailChange('changed@example.com')

    expect(authApi.requestEmailChange).toHaveBeenCalledWith({ email: 'changed@example.com' })
    expect(store.error).toBe(null)
  })

  it('requestEmailChange: 失敗時にerrorを設定し例外を再スローする', async () => {
    const store = useAuthStore()
    const emailChangeError = new Error('email change failed')
    vi.mocked(authApi.requestEmailChange).mockRejectedValue(emailChangeError)

    await expect(store.requestEmailChange('changed@example.com')).rejects.toThrow(
      'email change failed',
    )

    expect(store.error).toBe('メールアドレス変更メールの送信に失敗しました')
  })

  it('requestPasswordChange: 成功時にAPIレスポンスを返しerrorをクリアする', async () => {
    const store = useAuthStore()
    const response = { detail: 'password changed' }
    vi.mocked(authApi.requestPasswordChange).mockResolvedValue(response)

    await expect(
      store.requestPasswordChange('OldPassword123!', 'NewPassword123!', 'NewPassword123!'),
    ).resolves.toEqual(response)

    expect(authApi.requestPasswordChange).toHaveBeenCalledWith({
      old_password: 'OldPassword123!',
      new_password1: 'NewPassword123!',
      new_password2: 'NewPassword123!',
    })
    expect(store.error).toBe(null)
  })

  it('requestPasswordChange: 失敗時にerrorを設定し例外を再スローする', async () => {
    const store = useAuthStore()
    const passwordChangeError = new Error('password change failed')
    vi.mocked(authApi.requestPasswordChange).mockRejectedValue(passwordChangeError)

    await expect(
      store.requestPasswordChange('OldPassword123!', 'NewPassword123!', 'NewPassword123!'),
    ).rejects.toThrow('password change failed')

    expect(store.error).toBe('パスワードの変更に失敗しました')
  })

  it('setAccessToken: accessTokenのみを更新する', () => {
    const store = useAuthStore()

    store.setAccessToken('updated-access')

    expect(store.accessToken).toBe('updated-access')
    expect(store.authStatus).toBe('authenticated')
    expect(store.isAuthenticated).toBe(true)
  })

  it('clearAuthState: 認証状態、currentUser、errorをクリアする', () => {
    const store = useAuthStore()
    store.setAccessToken('access-token')
    store.currentUser = { email: 'user@example.com' }
    store.error = 'something wrong'

    store.clearAuthState()

    expect(store.accessToken).toBe('')
    expect(store.currentUser).toBe(null)
    expect(store.error).toBe(null)
    expect(store.authStatus).toBe('unauthenticated')
    expect(store.isAuthenticated).toBe(false)
  })

  it('restoreSession: accessTokenがある場合は認証済みとして扱う', async () => {
    const store = useAuthStore()
    store.setAccessToken('stored-access')

    await expect(store.restoreSession()).resolves.toBe(true)

    expect(authApi.refresh).not.toHaveBeenCalled()
    expect(store.authStatus).toBe('authenticated')
    expect(store.isAuthenticated).toBe(true)
    expect(store.accessToken).toBe('stored-access')
  })

  it('restoreSession: 未確認かつaccessTokenがない場合はrefreshで認証状態を復元する', async () => {
    const store = useAuthStore()

    vi.mocked(authApi.refresh).mockResolvedValue({
      access: 'restored-access',
    })

    await expect(store.restoreSession()).resolves.toBe(true)

    expect(authApi.refresh).toHaveBeenCalledOnce()
    expect(store.authStatus).toBe('authenticated')
    expect(store.isAuthenticated).toBe(true)
    expect(store.accessToken).toBe('restored-access')
    expect(localStorage.getItem('accessToken')).toBeNull()
  })

  it('restoreSession: refresh失敗時は未認証状態にする', async () => {
    const store = useAuthStore()

    vi.mocked(authApi.refresh).mockRejectedValue(new Error('refresh failed'))

    await expect(store.restoreSession()).resolves.toBe(false)

    expect(authApi.refresh).toHaveBeenCalledOnce()
    expect(store.authStatus).toBe('unauthenticated')
    expect(store.isAuthenticated).toBe(false)
    expect(store.accessToken).toBe('')
  })

  it('restoreSession: 未認証状態が確認済みならrefreshを再実行しない', async () => {
    const store = useAuthStore()

    vi.mocked(authApi.refresh).mockRejectedValue(new Error('refresh failed'))

    await store.restoreSession()
    await expect(store.restoreSession()).resolves.toBe(false)

    expect(authApi.refresh).toHaveBeenCalledOnce()
    expect(store.authStatus).toBe('unauthenticated')
  })

  it('restoreSession: 同時に呼ばれてもrefreshは1回だけ実行する', async () => {
    const store = useAuthStore()

    vi.mocked(authApi.refresh).mockResolvedValue({
      access: 'restored-access',
    })

    const [result1, result2] = await Promise.all([store.restoreSession(), store.restoreSession()])

    expect(result1).toBe(true)
    expect(result2).toBe(true)
    expect(authApi.refresh).toHaveBeenCalledOnce()
    expect(store.authStatus).toBe('authenticated')
  })

  it('deleteAccount: 成功時にアカウント削除後logoutして認証状態をクリアする', async () => {
    const store = useAuthStore()
    store.setAccessToken('access-token')
    store.currentUser = { email: 'user@example.com' }
    vi.mocked(authApi.deleteAccount).mockResolvedValue()
    vi.mocked(authApi.logout).mockResolvedValue()

    await store.deleteAccount()

    expect(authApi.deleteAccount).toHaveBeenCalledOnce()
    expect(store.accessToken).toBe('')
    expect(store.currentUser).toBe(null)
    expect(store.error).toBe(null)
    expect(store.authStatus).toBe('unauthenticated')
    expect(store.isAuthenticated).toBe(false)
  })

  it('deleteAccount: 失敗時にerrorを設定し認証状態は維持する', async () => {
    const store = useAuthStore()
    const deleteAccountError = new Error('delete account failed')
    store.setAccessToken('access-token')
    vi.mocked(authApi.deleteAccount).mockRejectedValue(deleteAccountError)

    await expect(store.deleteAccount()).rejects.toThrow('delete account failed')

    expect(authApi.logout).not.toHaveBeenCalled()
    expect(store.error).toBe('アカウントの削除に失敗しました')
    expect(store.accessToken).toBe('access-token')
    expect(store.authStatus).toBe('authenticated')
    expect(store.isAuthenticated).toBe(true)
  })

  it('logout: ローカルの認証状態をクリアしAPI logoutを呼ぶ', async () => {
    const store = useAuthStore()
    store.setAccessToken('access-token')
    store.currentUser = { email: 'user@example.com' }
    store.error = 'something wrong'
    vi.mocked(authApi.logout).mockResolvedValue()

    await store.logout()

    expect(authApi.logout).toHaveBeenCalledOnce()
    expect(store.accessToken).toBe('')
    expect(store.currentUser).toBe(null)
    expect(store.error).toBe(null)
    expect(store.isAuthenticated).toBe(false)
    expect(store.authStatus).toBe('unauthenticated')
  })

  it('logout: API logoutが失敗してもローカルの認証状態はクリアしたままにする', async () => {
    const store = useAuthStore()
    store.setAccessToken('access-token')
    vi.mocked(authApi.logout).mockRejectedValue(new Error('logout failed'))

    await expect(store.logout()).resolves.toBeUndefined()

    expect(store.accessToken).toBe('')
    expect(store.error).toBe(null)
    expect(store.authStatus).toBe('unauthenticated')
    expect(store.isAuthenticated).toBe(false)
  })
})
