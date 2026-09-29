export const TOKEN_KEY = 'canvett_token'
export const USER_KEY = 'canvett_user'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

// Remove the stored session. Used on sign-out and when the server reports that
// the current token is no longer valid (a 401).
export function clearSession() {
  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  } catch {
    /* ignore unavailable storage */
  }
}
