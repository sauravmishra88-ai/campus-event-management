export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

export function mediaUrl(path) {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  return `${API_BASE_URL.replace(/\/api\/?$/, '')}${path}`
}

export async function api(path, options = {}) {
  const token = sessionStorage.getItem('accessToken')
  const headers = new Headers(options.headers || {})
  if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers })
  } catch {
    throw new Error(`Can't reach the API at ${API_BASE_URL}. Check that the backend is running.`)
  }

  if (response.status === 204) return null
  const contentType = response.headers.get('content-type') || ''
  const result = contentType.includes('application/json') ? await response.json() : await response.text()
  if (!response.ok) {
    const message = typeof result === 'string' ? result : result.message || result.detail || result.error || result.title
    throw new Error(message || `Request failed (${response.status})`)
  }
  return result
}

export const json = (method, data) => ({ method, body: JSON.stringify(data) })
