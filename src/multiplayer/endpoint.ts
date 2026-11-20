export function lobbyEndpoint() {
  const configured = import.meta.env.VITE_SHIELDQUEST_LOBBY_URL?.trim()
  if (!configured) return null
  try {
    const url = new URL(configured)
    if (url.username || url.password || url.search || url.hash) return null
    if (url.protocol === 'wss:') return { url: url.href, local: false }
    if (import.meta.env.DEV && url.protocol === 'ws:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) {
      return { url: url.href, local: true }
    }
  } catch { /* Unconfigured or malformed endpoints leave online play unavailable. */ }
  return null
}
