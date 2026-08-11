import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import * as authApi from '@/features/auth/auth.api'
import type { ChangePasswordResponse, CurrentUserResponse } from '@/features/auth/auth.types'

type AuthStatus = 'unchecked' | 'authenticated' | 'unauthenticated'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref('')
  const error = ref<string | null>(null)
  const currentUser = ref<CurrentUserResponse | null>(null)
  // タブの認証状態
  const authStatus = ref<AuthStatus>('unchecked')
  const isAuthenticated = computed(() => authStatus.value === 'authenticated')

  let restoreSessionPromise: Promise<boolean> | null = null

  const login = async (email: string, password: string) => {
    error.value = null

    try {
      const { access } = await authApi.login({ email, password })
      setAccessToken(access)
    } catch (e: unknown) {
      error.value = 'ログインに失敗しました'
      throw e
    }
  }

  const demoLogin = async () => {
    error.value = null

    try {
      const { access } = await authApi.demoLogin()
      setAccessToken(access)
    } catch (e: unknown) {
      error.value = 'デモログインに失敗しました'
      throw e
    }
  }

  const register = async (email: string, password1: string, password2: string) => {
    error.value = null
    try {
      await authApi.register({ email, password1, password2 })
    } catch (e: unknown) {
      error.value = '新規登録に失敗しました'
      throw e
    }
  }

  const verifyEmail = async (key: string) => {
    error.value = null
    try {
      await authApi.verifyEmail({ key })
    } catch (e: unknown) {
      error.value = 'メール認証に失敗しました'
      throw e
    }
  }

  const requestPasswordReset = async (email: string) => {
    error.value = null
    try {
      await authApi.requestPasswordReset({ email })
    } catch (e: unknown) {
      error.value = 'パスワード再設定メールの送信に失敗しました'
      throw e
    }
  }

  const confirmPasswordReset = async (
    uid: string,
    token: string,
    password1: string,
    password2: string,
  ) => {
    error.value = null
    try {
      await authApi.confirmPasswordReset({
        uid,
        token,
        new_password1: password1,
        new_password2: password2,
      })
    } catch (e: unknown) {
      error.value = 'パスワードの再設定に失敗しました'
      throw e
    }
  }

  const fetchCurrentUser = async () => {
    error.value = null
    try {
      currentUser.value = await authApi.getCurrentUser()
      return currentUser.value
    } catch (e: unknown) {
      error.value = 'アカウント情報の取得に失敗しました'
      throw e
    }
  }

  const requestEmailChange = async (email: string) => {
    error.value = null
    try {
      await authApi.requestEmailChange({ email })
    } catch (e: unknown) {
      error.value = 'メールアドレス変更メールの送信に失敗しました'
      throw e
    }
  }

  const requestPasswordChange = async (
    oldPassword: string,
    newPassword: string,
    newPasswordConfirmation: string,
  ): Promise<ChangePasswordResponse> => {
    error.value = null
    try {
      return await authApi.requestPasswordChange({
        old_password: oldPassword,
        new_password1: newPassword,
        new_password2: newPasswordConfirmation,
      })
    } catch (e: unknown) {
      error.value = 'パスワードの変更に失敗しました'
      throw e
    }
  }

  const deleteAccount = async (): Promise<void> => {
    error.value = null
    try {
      await authApi.deleteAccount()
      clearAuthState()
    } catch (e: unknown) {
      error.value = 'アカウントの削除に失敗しました'
      throw e
    }
  }

  const setAccessToken = (token: string) => {
    accessToken.value = token
    authStatus.value = 'authenticated'
  }

  const clearAuthState = () => {
    accessToken.value = ''
    currentUser.value = null
    error.value = null
    authStatus.value = 'unauthenticated'
  }

  // このタブの認証状態を判定する
  // access tokenがなければrefresh tokenで認証状態の復元を試みる
  const restoreSession = async (): Promise<boolean> => {
    // access tokenを保持している場合は、認証済みとして扱う
    if (accessToken.value) {
      return true
    }

    // 未認証が確定している場合は、早期リターン
    if (authStatus.value === 'unauthenticated') {
      return false
    }

    // refreshで認証状態の復元を試みる
    if (!restoreSessionPromise) {
      restoreSessionPromise = authApi
        .refresh()
        .then(({ access }) => {
          setAccessToken(access)
          return true
        })
        .catch(() => {
          clearAuthState()
          return false
        })
        .finally(() => {
          restoreSessionPromise = null
        })
    }

    return restoreSessionPromise
  }

  const logout = async () => {
    clearAuthState()

    try {
      await authApi.logout()
    } catch {
      // ローカル状態は消しているので、ここでは握りつぶす
    }
  }

  return {
    accessToken,
    error,
    currentUser,
    isAuthenticated,
    authStatus,
    fetchCurrentUser,
    requestEmailChange,
    requestPasswordChange,
    deleteAccount,
    setAccessToken,
    clearAuthState,
    restoreSession,
    login,
    demoLogin,
    register,
    verifyEmail,
    requestPasswordReset,
    confirmPasswordReset,
    logout,
  }
})
