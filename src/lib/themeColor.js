// Keeps the browser UI (mobile status bar / toolbar) matching the current page
// background by updating the <meta name="theme-color"> tag. Without this, iOS
// Safari paints those bars white regardless of the page, which looks mismatched
// against the app's dark screens.
export const THEME_COLORS = {
  auth: '#070d18',   // dark navy sign-in / register background
  light: '#EFF2F7',  // app page background in light mode
  dark: '#101A24',   // app page background in dark mode
}

export function setThemeColor(color) {
  if (typeof document === 'undefined') return
  let meta = document.querySelector('meta[name="theme-color"]')
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('name', 'theme-color')
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', color)
}
