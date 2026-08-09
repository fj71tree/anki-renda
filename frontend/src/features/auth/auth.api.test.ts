import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  confirmPasswordReset,
  login,
  refresh,
  register,
  requestPasswordReset,
  verifyEmail,
} from '@/features/auth/auth.api'

const jsonResponse = (body: unknown, init?: ResponseInit) => {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
}

describe('auth api', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('login: dj-rest-authのlogin endpointにPOSTする', async () => {
    const fetchMock = vi.mocked(fetch)
    fetchMock.mockResolvedValue(jsonResponse({ access: 'access-token', refresh: 'refresh-token' }))

    const response = await login({ email: 'user@example.com', password: 'password123' })

    expect(response).toEqual({ access: 'access-token', refresh: 'refresh-token' })
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'user@example.com', password: 'password123' }),
    })
  })

  it('register: registration endpointにPOSTする', async () => {
    const fetchMock = vi.mocked(fetch)
    fetchMock.mockResolvedValue(
      jsonResponse({ detail: 'Verification e-mail sent.' }, { status: 201 }),
    )

    const response = await register({
      email: 'new-user@example.com',
      password1: 'password123',
      password2: 'password123',
    })

    expect(response).toEqual({ detail: 'Verification e-mail sent.' })
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/registration/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'new-user@example.com',
        password1: 'password123',
        password2: 'password123',
      }),
    })
  })

  it('verifyEmail: verify-email endpointにPOSTする', async () => {
    const fetchMock = vi.mocked(fetch)
    fetchMock.mockResolvedValue(jsonResponse({ detail: 'ok' }))

    const response = await verifyEmail({ key: 'verification-key' })

    expect(response).toEqual({ detail: 'ok' })
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/registration/verify-email/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ key: 'verification-key' }),
    })
  })

  it('requestPasswordReset: password reset endpointにPOSTする', async () => {
    const fetchMock = vi.mocked(fetch)
    fetchMock.mockResolvedValue(jsonResponse({ detail: 'Password reset e-mail has been sent.' }))

    const response = await requestPasswordReset({ email: 'reset-user@example.com' })

    expect(response).toEqual({ detail: 'Password reset e-mail has been sent.' })
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/password/reset/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'reset-user@example.com' }),
    })
  })

  it('confirmPasswordReset: password reset confirm endpointにPOSTする', async () => {
    const fetchMock = vi.mocked(fetch)
    fetchMock.mockResolvedValue(
      jsonResponse({ detail: 'Password has been reset with the new password.' }),
    )

    const response = await confirmPasswordReset({
      uid: 'uid-value',
      token: 'token-value',
      new_password1: 'NewPassword123!',
      new_password2: 'NewPassword123!',
    })

    expect(response).toEqual({ detail: 'Password has been reset with the new password.' })
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/password/reset/confirm/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid: 'uid-value',
        token: 'token-value',
        new_password1: 'NewPassword123!',
        new_password2: 'NewPassword123!',
      }),
    })
  })

  it('refresh: dj-rest-authのrefresh endpointにPOSTする', async () => {
    const fetchMock = vi.mocked(fetch)
    fetchMock.mockResolvedValue(jsonResponse({ access: 'new-access-token' }))

    const response = await refresh('refresh-token')

    expect(response).toEqual({ access: 'new-access-token' })
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/token/refresh/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: 'refresh-token' }),
    })
  })

  it('失敗時: ApiErrorを投げる', async () => {
    const fetchMock = vi.mocked(fetch)
    fetchMock.mockResolvedValue(jsonResponse({ detail: 'bad request' }, { status: 400 }))

    await expect(login({ email: 'user@example.com', password: 'bad-password' })).rejects.toEqual(
      expect.objectContaining({
        status: 400,
        data: { detail: 'bad request' },
      }),
    )
  })
})
