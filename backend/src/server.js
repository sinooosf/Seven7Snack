import 'dotenv/config'
import express from 'express'
import compression from 'compression'
import cors from 'cors'
import menuRoutes from './routes/menu.js'
import tableRoutes from './routes/tables.js'
import orderRoutes from './routes/orders.js'
import waiterRoutes from './routes/waiter.js'
import chatbotRoutes from './routes/chatbot.js'
import adminRoutes from './routes/admin.js'
import uploadRoutes from './routes/uploads.js'
import { ensureSchema } from './migrate.js'
import { syncMenu } from './menuSync.js'

const app = express()

// Behind Render's proxy: use the visitor's real address (needed so the
// wrong-password limit counts each visitor separately, not the proxy).
app.set('trust proxy', 1)

const allowedOrigins = (process.env.FRONTEND_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())

// Smaller answers = faster loading on slow connections (JSON shrinks ~5x;
// pictures are already compressed and are left alone).
app.use(compression())
app.use(cors({ origin: allowedOrigins }))
app.use(express.json({ limit: '100kb' }))

app.get('/api/health', (req, res) => res.json({ ok: true }))

app.use('/api/menu', menuRoutes)
app.use('/api/tables', tableRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/waiter-calls', waiterRoutes)
app.use('/api/chatbot', chatbotRoutes)
app.use('/api/uploads', uploadRoutes)
app.use('/api/admin', adminRoutes)

// Anything that is not an API route: a clear JSON 404 (not an HTML page).
app.use((req, res) => {
  res.status(404).json({ error: 'Not found.' })
})

// PostgreSQL error codes that mean "the VALUE you sent is not acceptable"
// (wrong type, number out of range, text too long, missing reference...).
// They are the client's mistake, so they answer 400 — not a server crash.
const BAD_VALUE_CODES = new Set(['22P02', '22003', '22001', '22021', '22007', '22008', '23502', '23503', '23514'])

// Keep error responses in the same { error: "message" } shape everywhere,
// so the frontend only ever has to look in one place for it.
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err)

  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'The request is too large.' })
  }
  if (err.type === 'entity.parse.failed' || err.type === 'encoding.unsupported' || err.type === 'charset.unsupported') {
    return res.status(400).json({ error: 'The request body is not valid JSON.' })
  }
  if (BAD_VALUE_CODES.has(err.code)) {
    return res.status(400).json({ error: 'One of the values sent is not valid.' })
  }
  if (err.code === '57014') {
    return res.status(503).json({ error: 'The database took too long to answer. Please try again.' })
  }
  if (err.status && err.status < 500) {
    return res.status(err.status).json({ error: 'The request could not be processed.' })
  }

  console.error(err)
  // Dashboard routes are behind the staff password, so it is safe to say what
  // went wrong there — it makes a broken database easy to diagnose.
  const body = { error: 'Something went wrong on the server.' }
  if (req.originalUrl.startsWith('/api/admin') && err?.message) body.detail = String(err.message).slice(0, 300)
  res.status(500).json(body)
})

// A stray error in one request must never take the whole restaurant offline.
process.on('unhandledRejection', (reason) => console.error('Unhandled rejection:', reason))
process.on('uncaughtException', (err) => console.error('Uncaught exception:', err))

const port = process.env.PORT || 4000

if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD.length < 12) {
  console.warn('WARNING: ADMIN_PASSWORD is missing or shorter than 12 characters. Use a long random one before going live.')
}

// Bring an older database up to date (new columns, the To Home link...)
// before accepting any request, and load the menu from menuData.js.
ensureSchema()
  .then(async () => {
    try {
      const menu = await syncMenu()
      console.log(`Menu loaded from code: ${menu.categories} categories, ${menu.items} dishes.`)
    } catch (err) {
      // Never keep the restaurant offline over this: serve what the database has.
      console.error('Could not sync the menu from menuData.js:', err)
    }
  })
  .then(() => {
    const server = app.listen(port, () => {
      console.log(`Meet The Chefs API running on http://localhost:${port}`)
    })

    // Finish the requests in flight, then stop (Render sends SIGTERM on deploys).
    const shutdown = () => server.close(() => process.exit(0))
    process.on('SIGTERM', shutdown)
    process.on('SIGINT', shutdown)
  })
  .catch((err) => {
    console.error('Could not prepare the database:', err)
    process.exit(1)
  })
