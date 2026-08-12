import { api } from '@/shared/shared.api'
import { ApiError, parseResponseBody } from '@/shared/http.util'
import type {
  LoginPayload,
  LoginResponse,
  RefreshResponse,
  RegisterPayload,
  RegisterResponse,
  VerifyEmailPayload,
  VerifyEmailResponse,
  PasswordResetPayload,
  PasswordResetResponse,
  PasswordResetConfirmPayload,
  PasswordResetConfirmResponse,
  ChangeEmailPayload,
  ChangeEmailResponse,
  ChangePasswordPayload,
  ChangePasswordResponse,
  CurrentUserResponse,
} from './auth.types'

const postJson = async <T>(url: string, payload: unknown): Promise<T> => {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await parseResponseBody(res)
  if (!res.ok) {
    throw new ApiError(res.status, data)
  }

  return data as T
}

export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  return postJson<LoginResponse>('/api/auth/login/', payload)
}

export const demoLogin = async (): Promise<LoginResponse> => {
  return postJson<LoginResponse>('/api/auth/demo-login/', {})
}

export const register = async (payload: RegisterPayload): Promise<RegisterResponse> => {
  return postJson<RegisterResponse>('/api/auth/registration/', payload)
}

export const verifyEmail = async (payload: VerifyEmailPayload): Promise<VerifyEmailResponse> => {
  return postJson<VerifyEmailResponse>('/api/auth/registration/verify-email/', payload)
}

export const requestPasswordReset = async (
  payload: PasswordResetPayload,
): Promise<PasswordResetResponse> => {
  return postJson<PasswordResetResponse>('/api/auth/password/reset/', payload)
}

export const confirmPasswordReset = async (
  payload: PasswordResetConfirmPayload,
): Promise<PasswordResetConfirmResponse> => {
  return postJson<PasswordResetConfirmResponse>('/api/auth/password/reset/confirm/', payload)
}

export const refresh = async (): Promise<RefreshResponse> => {
  return postJson<RefreshResponse>('/api/auth/token/refresh/', {})
}

export const logout = async (): Promise<void> => {
  await postJson<void>('/api/auth/logout/', {})
}

export const getCurrentUser = async (): Promise<CurrentUserResponse> => {
  return api.get<CurrentUserResponse>('/api/auth/me/')
}

export const requestEmailChange = async (
  payload: ChangeEmailPayload,
): Promise<ChangeEmailResponse> => {
  return api.post<ChangeEmailResponse>('/api/auth/me/email/', payload)
}

export const requestPasswordChange = async (
  payload: ChangePasswordPayload,
): Promise<ChangePasswordResponse> => {
  return api.post<ChangePasswordResponse>('/api/auth/me/password/', payload)
}

export const deleteAccount = async (): Promise<void> => {
  return api.delete('/api/auth/me/')
}
