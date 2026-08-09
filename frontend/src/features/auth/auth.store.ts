import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import * as authApi from '@/features/auth/auth.api'
import type { ChangePasswordResponse, CurrentUserResponse } from '@/features/auth/auth.types'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref(localStorage.getItem('accessToken') ?? '')
  const refreshToken = ref(localStorage.getItem('refreshToken') ?? '')
  const error = ref<string | null>(null)
  const currentUser = ref<CurrentUserResponse | null>(null)

  const isAuthenticated = computed(() => !!accessToken.value)

  const login = async (email: string, password: string) => {
    error.value = null
    try {
      const { access, refresh } = await authApi.login({ email, password })
      accessToken.value = access
      refreshToken.value = refresh
      localStorage.setItem('accessToken', access)
      localStorage.setItem('refreshToken', refresh)
    } catch (e: unknown) {
      error.value = 'ログインに失敗しました'
      throw e
    }
  }

  const demoLogin = async () => {
    error.value = null
    try {
      const { access, refresh } = await authApi.demoLogin()
      accessToken.value = access
      refreshToken.value = refresh
      localStorage.setItem('accessToken', access)
      localStorage.setItem('refreshToken', refresh)
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
      logout()
    } catch (e: unknown) {
      error.value = 'アカウントの削除に失敗しました'
      throw e
    }
  }

  const setAccessToken = (token: string) => {
    accessToken.value = token
    localStorage.setItem('accessToken', token)
  }

  const logout = () => {
    accessToken.value = ''
    refreshToken.value = ''
    currentUser.value = null
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    error.value = null
  }

  const signOut = () => {
    logout()
  }

  return {
    accessToken,
    refreshToken,
    error,
    currentUser,
    isAuthenticated,
    fetchCurrentUser,
    requestEmailChange,
    requestPasswordChange,
    deleteAccount,
    setAccessToken,
    login,
    demoLogin,
    register,
    verifyEmail,
    requestPasswordReset,
    confirmPasswordReset,
    logout,
    signOut,
  }
})
