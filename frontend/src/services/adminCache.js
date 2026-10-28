// ---------------------------------------------------------------------------
// A tiny memory of the last answer the dashboard got for each page.
//
// Why: every time staff opened a dashboard page it started empty, showed a
// spinner and waited for the server (which can take a second or more on a
// sleeping or distant host). Now a page opens with the LAST answer on screen
// straight away, and the fresh one replaces it a moment later.
//
// Lives only in memory (gone on refresh), and is emptied on log out, so one
// staff session never sees another one's data.
//
// It is a separate file from api.js on purpose: tests replace api.js with a
// fake, and this part must keep working next to it.
// ---------------------------------------------------------------------------
const store = new Map()

export const ordersPath = (range = 'today') => `/admin/orders?range=${encodeURIComponent(range)}`
export const overviewPath = (range = 'today') => `/admin/overview?range=${encodeURIComponent(range)}`
export const tablesPath = () => '/admin/tables'
export const floorsPath = () => '/admin/floors'
export const menuItemsPath = () => '/admin/menu-items'
export const categoriesPath = () => '/admin/categories'
export function reportPath({ range = 'week', from, to } = {}) {
  const query = new URLSearchParams({ range })
  if (range === 'custom') {
    query.set('from', from || '')
    query.set('to', to || '')
  }
  return `/admin/reports?${query}`
}

export function remember(path, data) {
  store.set(path, data)
}

// The last answer for that path, or null when there is none yet.
export function peek(path) {
  return store.has(path) ? store.get(path) : null
}

export function clearAdminCache() {
  store.clear()
}
