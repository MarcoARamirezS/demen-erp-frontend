import { useAuthStore } from '~/stores/auth.store'
import { useUiStore } from '~/stores/ui.store'

export default defineNuxtPlugin(() => {
  const auth = useAuthStore()
  const ui = useUiStore()

  const IDLE_LIMIT = 15 * 60 * 1000 // 15 minutos
  let idleTimer: ReturnType<typeof setTimeout> | null = null

  function logoutDueToInactivity() {
    if (!auth.isAuthenticated) return

    auth.logout(false)

    // sincronizar otras pestañas
    localStorage.setItem('forceLogout', Date.now().toString())

    ui.showToast('warning', 'Sesión cerrada por inactividad')
    navigateTo('/login')
  }

  function resetTimer() {
    if (!auth.isAuthenticated) return

    if (idleTimer) clearTimeout(idleTimer)

    idleTimer = setTimeout(() => {
      logoutDueToInactivity()
    }, IDLE_LIMIT)
  }

  function setupActivityListeners() {
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart']

    events.forEach(event => window.addEventListener(event, resetTimer))
  }

  function setupMultiTabSync() {
    window.addEventListener('storage', e => {
      if (e.key === 'forceLogout') {
        auth.logout(false)
        navigateTo('/')
      }
    })
  }

  if (process.client) {
    setupActivityListeners()
    setupMultiTabSync()
    resetTimer()
  }
})
