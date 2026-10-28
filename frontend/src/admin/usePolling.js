// ---------------------------------------------------------------------------
// Runs `load` right away and then every `ms` milliseconds. Returns a function
// that stops it (so it can be returned straight from a useEffect).
//
// Two things the old plain setInterval did not do:
//  - It never starts a new run while the previous one is still waiting for
//    the server. On a slow connection the requests used to pile up, which made
//    the dashboard slower and slower.
//  - With { pauseWhenHidden: true } (the default) it sleeps while the browser
//    tab is hidden and refreshes at once when staff come back to it.
//    The sidebar badge / alert sounds pass false, so they keep working from a
//    background tab.
// ---------------------------------------------------------------------------
const isHidden = () => typeof document !== 'undefined' && document.visibilityState === 'hidden'

export function startPolling(load, ms, { pauseWhenHidden = true } = {}) {
  let stopped = false
  let running = false

  async function tick(force = false) {
    if (stopped || running) return
    if (!force && pauseWhenHidden && isHidden()) return
    running = true
    try {
      await load()
    } catch {
      // each page shows its own error; one failed run must not stop the next
    } finally {
      running = false
    }
  }

  tick(true) // the first load always runs
  const timer = setInterval(() => tick(), ms)
  const onVisible = () => {
    if (!isHidden()) tick()
  }
  if (typeof document !== 'undefined') document.addEventListener('visibilitychange', onVisible)

  return () => {
    stopped = true
    clearInterval(timer)
    if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', onVisible)
  }
}
