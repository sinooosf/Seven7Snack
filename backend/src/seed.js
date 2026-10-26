// Sets up the database schema and, if it's empty, fills it with the
// starting menu (the 6 categories and 40 dishes below), 5 tables, and a
// couple of example chatbot FAQs. Safe to run more than once — it only
// inserts starting data the first time (checked by asking "is the
// categories table empty?"), so re-running this later never wipes out
// anything you've since edited from the dashboard.
//
// To REPLACE the menu of a database that already has one (for example after
// changing the menu below), run:  npm run seed:menu
// That deletes every category and dish and inserts the ones in this file.
// Tables, chatbot FAQs and past orders are not touched.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { pool } from './db.js'
import { ensureSchema } from './migrate.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const CATEGORIES = [
  { id: 'pizza', name: 'Pizza', image: '/images/categories/pizza.webp', description: 'Fresh from the oven', sortOrder: 0 },
  { id: 'burger', name: 'Burger', image: '/images/categories/burger.webp', description: 'Stacked & juicy', sortOrder: 1 },
  { id: 'tacos', name: 'Tacos', image: '/images/categories/tacos.webp', description: 'Grilled & loaded', sortOrder: 2 },
  { id: 'sandwich', name: 'Sandwich', image: '/images/categories/sandwich.webp', description: 'Crispy & generous', sortOrder: 3 },
  { id: 'au-four', name: 'Au Four', image: '/images/categories/au-four.webp', description: 'Calzone, baguette & gratin', sortOrder: 4 },
  { id: 'plats', name: 'Les Plats', image: '/images/categories/plats.webp', description: 'Plates & salads', sortOrder: 5 },
]

// NOTE: the prices are placeholders (the menu photos came without prices).
// Edit them here, or from the dashboard's Menu tab.
const MENU_ITEMS = [
  { id: 'pizza-1', categoryId: 'pizza', name: 'Pizza Seven Snack', price: 900, image: '/images/menu/pizza/pizza-1.webp', available: true, discountPercent: 0, isBest: true },
  { id: 'pizza-2', categoryId: 'pizza', name: 'Pizza Margherita', price: 600, image: '/images/menu/pizza/pizza-2.webp', available: true, discountPercent: 0, isBest: false },
  { id: 'pizza-3', categoryId: 'pizza', name: 'Pizza 3 Fromages', price: 750, image: '/images/menu/pizza/pizza-3.webp', available: true, discountPercent: 0, isBest: false },
  { id: 'pizza-4', categoryId: 'pizza', name: 'Pizza 4 Fromages', price: 800, image: '/images/menu/pizza/pizza-4.webp', available: true, discountPercent: 0, isBest: false },
  { id: 'pizza-5', categoryId: 'pizza', name: 'Pizza Fruits de Mer', price: 900, image: '/images/menu/pizza/pizza-5.webp', available: true, discountPercent: 0, isBest: false },
  { id: 'pizza-6', categoryId: 'pizza', name: 'Pizza Ail Chinx', price: 800, image: '/images/menu/pizza/pizza-6.webp', available: true, discountPercent: 0, isBest: false },

  { id: 'burger-1', categoryId: 'burger', name: 'Burger Classic', price: 450, image: '/images/menu/burger/burger-1.webp', available: true, discountPercent: 0, isBest: false },
  { id: 'burger-2', categoryId: 'burger', name: 'Big Burger', price: 600, image: '/images/menu/burger/burger-2.webp', available: true, discountPercent: 0, isBest: true },
  { id: 'burger-3', categoryId: 'burger', name: 'Burger Krispy', price: 500, image: '/images/menu/burger/burger-3.webp', available: true, discountPercent: 0, isBest: false },

  { id: 'tacos-1', categoryId: 'tacos', name: 'Tacos Poulet', price: 400, image: '/images/menu/tacos/tacos-1.webp', available: true, discountPercent: 0, isBest: true },
  { id: 'tacos-2', categoryId: 'tacos', name: 'Tacos Viande', price: 450, image: '/images/menu/tacos/tacos-2.webp', available: true, discountPercent: 0, isBest: false },
  { id: 'tacos-3', categoryId: 'tacos', name: 'Tacos Crispy', price: 450, image: '/images/menu/tacos/tacos-3.webp', available: true, discountPercent: 0, isBest: false },
  { id: 'tacos-4', categoryId: 'tacos', name: 'Tacos Mexicain', price: 500, image: '/images/menu/tacos/tacos-4.webp', available: true, discountPercent: 0, isBest: false },

  { id: 'sandwich-1', categoryId: 'sandwich', name: 'Poulet Crispy', price: 350, image: '/images/menu/sandwich/sandwich-1.webp', available: true, discountPercent: 0, isBest: true },
  { id: 'sandwich-2', categoryId: 'sandwich', name: 'Poulet Mariné', price: 350, image: '/images/menu/sandwich/sandwich-2.webp', available: true, discountPercent: 0, isBest: false },
  { id: 'sandwich-3', categoryId: 'sandwich', name: 'Poulet à la Crème', price: 400, image: '/images/menu/sandwich/sandwich-3.webp', available: true, discountPercent: 0, isBest: false },
  { id: 'sandwich-4', categoryId: 'sandwich', name: 'Viande Hachée', price: 380, image: '/images/menu/sandwich/sandwich-4.webp', available: true, discountPercent: 0, isBest: false },
  { id: 'sandwich-5', categoryId: 'sandwich', name: 'Tabouna Matlou3', price: 350, image: '/images/menu/sandwich/sandwich-5.webp', available: true, discountPercent: 0, isBest: false },
  { id: 'sandwich-6', categoryId: 'sandwich', name: 'Tabouna Matlou3 Viande', price: 400, image: '/images/menu/sandwich/sandwich-6.webp', available: true, discountPercent: 0, isBest: false },

  { id: 'au-four-1', categoryId: 'au-four', name: 'Calzone Viande', price: 500, image: '/images/menu/au-four/au-four-1.webp', available: true, discountPercent: 0, isBest: true },
  { id: 'au-four-2', categoryId: 'au-four', name: 'Calzone Chicken', price: 500, image: '/images/menu/au-four/au-four-2.webp', available: true, discountPercent: 0, isBest: false },
  { id: 'au-four-3', categoryId: 'au-four', name: 'Calzone Fruits de Mer', price: 600, image: '/images/menu/au-four/au-four-3.webp', available: true, discountPercent: 0, isBest: false },
  { id: 'au-four-4', categoryId: 'au-four', name: 'Gratin Viande', price: 550, image: '/images/menu/au-four/au-four-4.webp', available: true, discountPercent: 0, isBest: false },
  { id: 'au-four-5', categoryId: 'au-four', name: 'Gratin Poulet', price: 550, image: '/images/menu/au-four/au-four-5.webp', available: true, discountPercent: 0, isBest: false },
  { id: 'au-four-6', categoryId: 'au-four', name: 'Gratin Crispy', price: 600, image: '/images/menu/au-four/au-four-6.webp', available: true, discountPercent: 0, isBest: false },
  { id: 'au-four-7', categoryId: 'au-four', name: 'Gratin Crousty', price: 600, image: '/images/menu/au-four/au-four-7.webp', available: true, discountPercent: 0, isBest: false },
  { id: 'au-four-8', categoryId: 'au-four', name: 'Gratin Fruits de Mer', price: 650, image: '/images/menu/au-four/au-four-8.webp', available: true, discountPercent: 0, isBest: false },
  { id: 'au-four-9', categoryId: 'au-four', name: 'Baguette Farcie Poulet', price: 450, image: '/images/menu/au-four/au-four-9.webp', available: true, discountPercent: 0, isBest: false },
  { id: 'au-four-10', categoryId: 'au-four', name: 'Baguette Farcie Viande', price: 450, image: '/images/menu/au-four/au-four-10.webp', available: true, discountPercent: 0, isBest: false },

  { id: 'plats-1', categoryId: 'plats', name: 'Plat Chich Taouk', price: 800, image: '/images/menu/plats/plats-1.webp', available: true, discountPercent: 0, isBest: true },
  { id: 'plats-2', categoryId: 'plats', name: 'Plat Chicken Crispy', price: 800, image: '/images/menu/plats/plats-2.webp', available: true, discountPercent: 0, isBest: false },
  { id: 'plats-3', categoryId: 'plats', name: 'Plat Viande Hachée', price: 750, image: '/images/menu/plats/plats-3.webp', available: true, discountPercent: 0, isBest: false },
  { id: 'plats-4', categoryId: 'plats', name: 'Plat Escalope Grillé', price: 850, image: '/images/menu/plats/plats-4.webp', available: true, discountPercent: 0, isBest: false },
  { id: 'plats-5', categoryId: 'plats', name: 'Plat Escalope à la Crème', price: 900, image: '/images/menu/plats/plats-5.webp', available: true, discountPercent: 0, isBest: false },
  { id: 'plats-6', categoryId: 'plats', name: 'Plat Saajdouk', price: 800, image: '/images/menu/plats/plats-6.webp', available: true, discountPercent: 0, isBest: false },
  { id: 'plats-7', categoryId: 'plats', name: 'Barquette Frite', price: 300, image: '/images/menu/plats/plats-7.webp', available: true, discountPercent: 0, isBest: false },
  { id: 'plats-8', categoryId: 'plats', name: 'Frites Gratinées', price: 400, image: '/images/menu/plats/plats-8.webp', available: true, discountPercent: 0, isBest: false },
  { id: 'plats-9', categoryId: 'plats', name: 'Salade de Thon', price: 500, image: '/images/menu/plats/plats-9.webp', available: true, discountPercent: 0, isBest: false },
  { id: 'plats-10', categoryId: 'plats', name: 'Salade Variée', price: 400, image: '/images/menu/plats/plats-10.webp', available: true, discountPercent: 0, isBest: false },
  { id: 'plats-11', categoryId: 'plats', name: 'Salade César', price: 550, image: '/images/menu/plats/plats-11.webp', available: true, discountPercent: 0, isBest: false },
]

const TABLES = [1, 2, 3, 4, 5].map((n) => ({ id: String(n), label: `Table ${n}`, seats: 4 }))

const CHATBOT_FAQS = [
  { keyword: 'wifi', answer: 'Yes, we have free wifi \u2014 just ask a staff member for the password.' },
  { keyword: 'parking', answer: "There's free parking right outside." },
]

const RESET_MENU = process.argv.includes('--reset-menu')

async function seed() {
  const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf8')
  await pool.query(schema)
  await ensureSchema()

  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM categories')
  if (rows[0].count > 0 && !RESET_MENU) {
    console.log('Database already has data \u2014 skipping seed (nothing was changed).')
    await pool.end()
    return
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    if (RESET_MENU) {
      // order_items keeps its own copy of each dish's name and price, so past
      // orders are unaffected. Deleting categories also removes their dishes.
      await client.query('DELETE FROM categories')
    }

    for (const c of CATEGORIES) {
      await client.query(
        'INSERT INTO categories (id, name, image, description, sort_order) VALUES ($1,$2,$3,$4,$5)',
        [c.id, c.name, c.image, c.description, c.sortOrder],
      )
    }

    for (const [index, item] of MENU_ITEMS.entries()) {
      await client.query(
        `INSERT INTO menu_items
          (id, category_id, name, price, image, available, discount_percent, is_best, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [item.id, item.categoryId, item.name, item.price, item.image, item.available, item.discountPercent, item.isBest, index],
      )
    }

    if (RESET_MENU) {
      await client.query('COMMIT')
      console.log(`Menu replaced: ${CATEGORIES.length} categories, ${MENU_ITEMS.length} menu items.`)
      return
    }

    for (const t of TABLES) {
      await client.query(
        'INSERT INTO restaurant_tables (id, label, seats) VALUES ($1,$2,$3) ON CONFLICT (id) DO NOTHING',
        [t.id, t.label, t.seats],
      )
    }

    for (const faq of CHATBOT_FAQS) {
      await client.query('INSERT INTO chatbot_faqs (keyword, answer) VALUES ($1,$2)', [faq.keyword, faq.answer])
    }

    await client.query('COMMIT')
    console.log(`Seeded ${CATEGORIES.length} categories, ${MENU_ITEMS.length} menu items, ${TABLES.length} tables, ${CHATBOT_FAQS.length} chatbot FAQs.`)
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
    await pool.end()
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
