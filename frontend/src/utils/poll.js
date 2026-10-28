// Refresh a screen every `ms` milliseconds — but only while the tab is on screen,
// and never start a refresh while the previous one is still running (on a slow
// connection those pile up and make everything slower). Coming back to the tab
// refreshes right away. Returns the cleanup function for useEffect.
export function pollWhileVisible(load, ms) {
  let busy = false
  const run = async () => {
    if (document.hidden || busy) return
    busy = true
    try {
      await load()
    } finally {
      busy = false
    }
  }
  const timer = setInterval(run, ms)
  const onVisible = () => {
    if (!document.hidden) run()
  }
  document.addEventListener('visibilitychange', onVisible)
  return () => {
    clearInterval(timer)
    document.removeEventListener('visibilitychange', onVisible)
  }
}
