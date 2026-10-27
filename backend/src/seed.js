// Sets up the database schema, loads the menu from menuData.js (the menu
// lives in code — see menuSync.js), and, the first time only, adds 5 tables
// and a couple of example chatbot FAQs. Safe to run more than once: tables and
// FAQs are never added twice, and the menu is simply re-synced from the file.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { pool } from './db.js'
import { ensureSchema } from './migrate.js'
import { syncMenu } from './menuSync.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const TABLES = [1, 2, 3, 4, 5].map((n) => ({ id: String(n), label: `Table ${n}`, seats: 4 }))

const CHATBOT_FAQS = [
  { keyword: 'wifi', answer: 'Yes, we have free wifi \u2014 just ask a staff member for the password.' },
  { keyword: 'parking', answer: "There's free parking right outside." },
]

async function seed() {
  const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf8')
  await pool.query(schema)
  await ensureSchema()

  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM categories')
  const firstRun = rows[0].count === 0

  const menu = await syncMenu()
  console.log(`Menu synced from menuData.js: ${menu.categories} categories, ${menu.items} dishes (removed ${menu.removedCategories} old categories, ${menu.removedItems} old dishes).`)

  if (!firstRun) {
    console.log('Tables and chatbot FAQs already exist \u2014 left as they are.')
    await pool.end()
    return
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

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
    console.log(`Added ${TABLES.length} tables and ${CHATBOT_FAQS.length} chatbot FAQs.`)
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
