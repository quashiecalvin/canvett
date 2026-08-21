export const TOKEN_KEY = 'canvett_token'
export const USER_KEY = 'canvett_user'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}
