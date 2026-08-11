export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  access: string
}

export interface RegisterPayload {
  email: string
  password1: string
  password2: string
}

export interface RegisterResponse {
  detail?: string
}

export interface RefreshResponse {
  access: string
}

export interface CurrentUserResponse {
  email: string
}

export interface ChangeEmailPayload {
  email: string
}

export interface ChangeEmailResponse {
  detail: string
}

export interface ChangePasswordPayload {
  old_password: string
  new_password1: string
  new_password2: string
}

export interface ChangePasswordResponse {
  detail: string
}

export interface VerifyEmailPayload {
  key: string
}

export interface VerifyEmailResponse {
  detail: string
}

export interface PasswordResetPayload {
  email: string
}

export interface PasswordResetResponse {
  detail: string
}

export interface PasswordResetConfirmPayload {
  uid: string
  token: string
  new_password1: string
  new_password2: string
}

export interface PasswordResetConfirmResponse {
  detail: string
}
