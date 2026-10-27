// ---------------------------------------------------------------------------
// Loads the starting menu from menuData.js into the database. Runs every time
// the server starts (and from `npm run seed`).
//
// WHO OWNS WHAT
//
//   CATEGORIES — the dashboard owns them (Menu -> Categories: rename, change
//     the picture, move first/last, remove, add). menuData.js only SEEDS them:
//       * a category that is in the file but not in the database yet is added
//         (at the end of the list);
//       * a category that already exists is left exactly as the staff made it —
//         its name, picture and position are never overwritten;
//       * a category the staff REMOVED stays removed: its id is remembered
//         (see removeCategoryMark) so the next restart does not bring it back;
//       * categories that are not in the file (made from the dashboard) are
//         never deleted by the sync.
//
//   DISHES — the dashboard owns them too (add, edit, move, remove). menuData.js
//     only SEEDS them: a dish that is in the file but not in the database yet
//     is added; an existing dish is never overwritten; a dish the staff
//     removed stays removed (its id is remembered); dishes made from the
//     dashboard are never deleted by the sync.
// ---------------------------------------------------------------------------
import { pool } from './db.js'
import { CATEGORIES, MENU_ITEMS } from './menuData.js'

// Any number; makes two servers starting at the same moment take turns.
const LOCK_KEY = 70707

const REMOVED_KEY = 'removed_categories'

// The ids of the categories the staff removed from the dashboard.
export async function removedCategoryIds(db = pool) {
  const result = await db.query('SELECT value FROM app_settings WHERE key = $1', [REMOVED_KEY])
  try {
    const parsed = JSON.parse(result.rows[0]?.value || '[]')
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : []
  } catch {
    return []
  }
}

async function saveRemoved(db, ids) {
  await db.query(
    `INSERT INTO app_settings (key, value) VALUES ($1, $2)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    [REMOVED_KEY, JSON.stringify([...new Set(ids)])],
  )
}

// Remember that the staff removed this category, so the sync keeps it removed.
export async function markCategoryRemoved(db, id) {
  await saveRemoved(db, [...(await removedCategoryIds(db)), id])
}

// The staff made a category with this id again: let the sync know it is wanted.
export async function unmarkCategoryRemoved(db, id) {
  const ids = await removedCategoryIds(db)
  if (ids.includes(id)) await saveRemoved(db, ids.filter((other) => other !== id))
}

const REMOVED_ITEMS_KEY = 'removed_menu_items'

async function readIdList(db, key) {
  const result = await db.query('SELECT value FROM app_settings WHERE key = $1', [key])
  try {
    const parsed = JSON.parse(result.rows[0]?.value || '[]')
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : []
  } catch {
    return []
  }
}

// The ids of the starting dishes the staff removed from the dashboard.
export const removedItemIds = (db = pool) => readIdList(db, REMOVED_ITEMS_KEY)

// Remember that the staff removed this dish, so the sync keeps it removed.
// (Only ids that come from menuData.js matter; others are simply ignored.)
export async function markItemRemoved(db, id) {
  if (!MENU_ITEMS.some((item) => item.id === id)) return
  const ids = await removedItemIds(db)
  await db.query(
    `INSERT INTO app_settings (key, value) VALUES ($1, $2)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    [REMOVED_ITEMS_KEY, JSON.stringify([...new Set([...ids, id])])],
  )
}

export async function syncMenu() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query('SELECT pg_advisory_xact_lock($1)', [LOCK_KEY])

    const removed = new Set(await removedCategoryIds(client))
    const wanted = CATEGORIES.filter((c) => !removed.has(c.id))

    // Categories: add the missing ones at the end, never touch existing ones.
    for (const c of wanted) {
      await client.query(
        `INSERT INTO categories (id, name, image, description, sort_order)
         VALUES ($1, $2, $3, $4, (SELECT COALESCE(MAX(sort_order), -1) + 1 FROM categories))
         ON CONFLICT (id) DO NOTHING`,
        [c.id, c.name, c.image, c.description],
      )
    }

    const wantedIds = new Set(wanted.map((c) => c.id))
    const removedDishes = new Set(await removedItemIds(client))
    const items = MENU_ITEMS.filter((item) => wantedIds.has(item.categoryId) && !removedDishes.has(item.id))

    // Dishes: add the missing ones (after the dishes already in their
    // category), never touch existing ones.
    for (const item of items) {
      await client.query(
        `INSERT INTO menu_items
           (id, category_id, name, price, image, available, discount_percent, is_best, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,
                 (SELECT COALESCE(MAX(sort_order), -1) + 1 FROM menu_items WHERE category_id = $2))
         ON CONFLICT (id) DO NOTHING`,
        [item.id, item.categoryId, item.name, item.price, item.image, item.available, item.discountPercent, item.isBest],
      )
    }

    await client.query('COMMIT')
    return {
      categories: wanted.length,
      items: items.length,
      removedCategories: 0,
      removedItems: 0,
    }
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

// Brings back every category of menuData.js that the staff removed, together
// with its starting dishes. Returns { restored: <how many categories> }.
export async function restoreRemovedCategories() {
  const before = new Set(await removedCategoryIds(pool))
  const restoring = CATEGORIES.filter((c) => before.has(c.id))
  if (before.size > 0) await saveRemoved(pool, [])

  // The starting dishes of those categories were removed one by one when the
  // category was removed: they come back too.
  if (restoring.length > 0) {
    const restoringIds = new Set(restoring.map((c) => c.id))
    const back = new Set(MENU_ITEMS.filter((item) => restoringIds.has(item.categoryId)).map((item) => item.id))
    const kept = (await removedItemIds(pool)).filter((id) => !back.has(id))
    await pool.query(
      `INSERT INTO app_settings (key, value) VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [REMOVED_ITEMS_KEY, JSON.stringify(kept)],
    )
  }

  await syncMenu()
  return { restored: restoring.length }
}
