export const TOKEN_KEY = 'canvett_token'
export const USER_KEY = 'canvett_user'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

// Remove just the session tokens. Used when the server reports the current
// token is no longer valid (a 401), where we keep other per-device data.
export function clearSession() {
  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  } catch {
    /* ignore unavailable storage */
  }
}

// Full sign-out cleanup: the session plus any app data tied to the account
// (e.g. recruiter candidate notes). The per-device theme preference is kept
// deliberately, as it is not account data.
export function clearAppData() {
  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    const keys = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith('canvett_notes_')) keys.push(k)
    }
    keys.forEach((k) => localStorage.removeItem(k))
  } catch {
    /* ignore unavailable storage */
  }
}
