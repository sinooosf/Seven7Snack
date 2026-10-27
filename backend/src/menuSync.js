// ---------------------------------------------------------------------------
// Makes the database menu match menuData.js. Runs every time the server
// starts (and from `npm run seed`), so the menu is always "in the code" and
// never has to be added from the dashboard.
//
//   - Categories and dishes that are in menuData.js are added or updated
//     (name, picture, category and position come from the file).
//   - Categories and dishes that are NOT in the file are removed — that is how
//     the old menu disappears. Past orders are unaffected: order_items keeps
//     its own copy of each dish's name and price.
//   - price / discount / available / "best" are only set when a dish is first
//     added. After that the dashboard owns them, so marking a dish
//     unavailable survives a restart.
// ---------------------------------------------------------------------------
import { pool } from './db.js'
import { CATEGORIES, MENU_ITEMS } from './menuData.js'

// Any number; makes two servers starting at the same moment take turns.
const LOCK_KEY = 70707

export async function syncMenu() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query('SELECT pg_advisory_xact_lock($1)', [LOCK_KEY])

    for (const [index, c] of CATEGORIES.entries()) {
      await client.query(
        `INSERT INTO categories (id, name, image, description, sort_order)
         VALUES ($1,$2,$3,$4,$5)
         ON CONFLICT (id) DO UPDATE
           SET name = EXCLUDED.name, image = EXCLUDED.image,
               description = EXCLUDED.description, sort_order = EXCLUDED.sort_order`,
        [c.id, c.name, c.image, c.description, index],
      )
    }

    for (const [index, item] of MENU_ITEMS.entries()) {
      await client.query(
        `INSERT INTO menu_items
           (id, category_id, name, price, image, available, discount_percent, is_best, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (id) DO UPDATE
           SET category_id = EXCLUDED.category_id, name = EXCLUDED.name,
               image = EXCLUDED.image, sort_order = EXCLUDED.sort_order`,
        [item.id, item.categoryId, item.name, item.price, item.image, item.available, item.discountPercent, item.isBest, index],
      )
    }

    // Everything that is not in the file goes (the old menu).
    const removedItems = await client.query('DELETE FROM menu_items WHERE id <> ALL($1::text[])', [MENU_ITEMS.map((i) => i.id)])
    const removedCategories = await client.query('DELETE FROM categories WHERE id <> ALL($1::text[])', [CATEGORIES.map((c) => c.id)])

    await client.query('COMMIT')
    return {
      categories: CATEGORIES.length,
      items: MENU_ITEMS.length,
      removedCategories: removedCategories.rowCount,
      removedItems: removedItems.rowCount,
    }
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}
