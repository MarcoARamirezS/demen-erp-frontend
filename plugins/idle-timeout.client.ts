import { watch } from 'vue'
import { useAuthStore } from '~/stores/auth.store'
import { useUiStore } from '~/stores/ui.store'

export default defineNuxtPlugin(() => {
  const auth = useAuthStore()
  const ui = useUiStore()

  const IDLE_LIMIT = 60 * 60 * 1000 // 🔥 15 minutos REAL
  let idleTimer: ReturnType<typeof setTimeout> | null = null

  async function logoutDueToInactivity() {
    if (!auth.isAuthenticated) return

    await auth.logout(false)

    localStorage.setItem('forceLogout', Date.now().toString())

    ui.showToast('warning', 'Sesión cerrada por inactividad')
    navigateTo('/')
  }

  function resetTimer() {
    if (!auth.isAuthenticated) return

    if (idleTimer) clearTimeout(idleTimer)

    idleTimer = setTimeout(logoutDueToInactivity, IDLE_LIMIT)
  }

  function setupActivityListeners() {
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach(e => window.addEventListener(e, resetTimer))
  }

  function setupMultiTabSync() {
    window.addEventListener('storage', e => {
      if (e.key === 'forceLogout') {
        auth.logout(false)
        navigateTo('/')
      }
    })
  }

  // 🔥 FIX: observar login/logout
  watch(
    () => auth.isAuthenticated,
    val => {
      if (val) resetTimer()
      else if (idleTimer) clearTimeout(idleTimer)
    },
    { immediate: true }
  )

  if (process.client) {
    setupActivityListeners()
    setupMultiTabSync()
  }
})
