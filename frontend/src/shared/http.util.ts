// APIリクエストのエラーを表すカスタムエラークラス
export class ApiError extends Error {
  status: number
  data: unknown

  constructor(status: number, data: unknown) {
    super(`Request failed with status ${status}`)
    this.status = status
    this.data = data
  }
}

//レスポンスに応じてレスポンスボディを適切にパースするユーティリティ関数
export const parseResponseBody = async (response: Response): Promise<unknown> => {
  const contentType = response.headers.get('content-type') ?? ''
  const rawBody = await response.text()

  if (!rawBody) {
    return null
  }

  // レスポンスのContent-Typeに応じてレスポンスボディを適切にパース
  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(rawBody)
    } catch {
      return rawBody
    }
  }

  // テキスト系のContent-Typeの場合はパースせずにそのまま返す
  if (contentType.includes('text/')) {
    return rawBody
  }

  return null
}
