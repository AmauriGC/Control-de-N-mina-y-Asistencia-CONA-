export function decodeJwt(token) {
  try {
    const [, payload] = token.split('.')
    const b64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(b64)
    try {
      return JSON.parse(json)
    } catch {
      // Fallback for UTF-8
      return JSON.parse(decodeURIComponent(escape(json)))
    }
  } catch {
    return null
  }
}

export function isTokenExpired(token) {
  const payload = decodeJwt(token)
  if (!payload?.exp) return true
  const nowSec = Math.floor(Date.now() / 1000)
  return payload.exp <= nowSec
}
