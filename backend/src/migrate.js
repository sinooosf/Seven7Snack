// ---------------------------------------------------------------------------
// Safe, repeatable database upgrades.
//
// schema.sql only creates things that don't exist yet, so a database made
// with an OLDER version of this project never gets the newer columns by
// itself. ensureSchema() adds whatever is missing every time the server
// starts (and every time you run `npm run seed`). Running it twice does
// nothing the second time, and it never deletes or rewrites your data.
// ---------------------------------------------------------------------------
import { pool } from './db.js'
import { TZ } from './time.js'
import { HOME_TABLE_ID, DELIVERY_TABLE_ID } from './links.js'

export { HOME_TABLE_ID, DELIVERY_TABLE_ID }

// Floors of the restaurant ("Ground floor", "Upper floor"...). Every table
// belongs to one. Existing tables stay on the ground floor. Safe to run any
// number of times; also called by the floors routes if they find it missing.
export async function ensureFloors() {
  // Brand-new names on purpose (dining_floors / dining_floor, no foreign key):
  // an older version of this feature left a differently-shaped "floors" table and
  // "floor_id" column in some databases, and those must not get in the way.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS dining_floors (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      sort_order  INTEGER NOT NULL DEFAULT 0
    );
    INSERT INTO dining_floors (id, name, sort_order) VALUES ('ground', 'Ground floor', 0)
      ON CONFLICT (id) DO NOTHING;
    ALTER TABLE restaurant_tables ADD COLUMN IF NOT EXISTS dining_floor TEXT NOT NULL DEFAULT 'ground';

    -- Make the old column (if an older version made one) harmless: nothing reads
    -- it any more, so it must never block adding a table.
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns
                  WHERE table_name = 'restaurant_tables' AND column_name = 'floor_id') THEN
        ALTER TABLE restaurant_tables ALTER COLUMN floor_id DROP NOT NULL;
        ALTER TABLE restaurant_tables ALTER COLUMN floor_id DROP DEFAULT;
      END IF;
    EXCEPTION WHEN others THEN NULL;
    END $$;
  `)
}

export async function ensureSchema() {
  // Newer table columns
  await pool.query(`
    ALTER TABLE restaurant_tables ADD COLUMN IF NOT EXISTS kind   TEXT    NOT NULL DEFAULT 'table';
    ALTER TABLE restaurant_tables ADD COLUMN IF NOT EXISTS seats  INTEGER NOT NULL DEFAULT 4;
    ALTER TABLE restaurant_tables ADD COLUMN IF NOT EXISTS status TEXT    NOT NULL DEFAULT 'auto';
    ALTER TABLE restaurant_tables ADD COLUMN IF NOT EXISTS pos_x REAL;
    ALTER TABLE restaurant_tables ADD COLUMN IF NOT EXISTS pos_y REAL;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
  `)

  // Orders can now also be "completed" (served and closed by the staff).
  await pool.query(`
    ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
    ALTER TABLE orders ADD CONSTRAINT orders_status_check
      CHECK (status IN ('preparing', 'almost', 'ready', 'completed', 'cancelled'));
  `)

  // The special "ToHomeOrder" link: for customers who order without a table.
  await pool.query(
    `INSERT INTO restaurant_tables (id, label, kind, seats)
     VALUES ($1, 'To Home', 'home', 0)
     ON CONFLICT (id) DO UPDATE SET kind = 'home', label = 'To Home'`,
    [HOME_TABLE_ID],
  )

  // The special "delivery" link: the customer orders normally, then gives a
  // phone number and an address when confirming.
  await pool.query(
    `INSERT INTO restaurant_tables (id, label, kind, seats)
     VALUES ($1, 'Delivery', 'delivery', 0)
     ON CONFLICT (id) DO UPDATE SET kind = 'delivery', label = 'Delivery'`,
    [DELIVERY_TABLE_ID],
  )

  await ensureFloors()

  // Delivery orders carry the customer's phone number and address.
  await pool.query(`
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone    TEXT NOT NULL DEFAULT '';
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS address  TEXT NOT NULL DEFAULT '';
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS uploads (
      id          SERIAL PRIMARY KEY,
      mime        TEXT NOT NULL,
      data        BYTEA NOT NULL,
      size        INTEGER NOT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `)

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_orders_table_status ON orders(table_id, status);
  `)

  // The dashboard asks "which orders are still open?" every few seconds
  // (the red badge, the bell, the Orders page). This index answers it without
  // reading the whole orders table.
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at DESC);
  `)

  // A note the customer writes for the kitchen ("no onions"), a short line of
  // text under each dish on the menu, and the "Call waiter" button.
  await pool.query(`
    ALTER TABLE orders     ADD COLUMN IF NOT EXISTS note        TEXT NOT NULL DEFAULT '';
    ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '';

    CREATE TABLE IF NOT EXISTS waiter_calls (
      id           SERIAL PRIMARY KEY,
      table_id     TEXT NOT NULL,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
      resolved_at  TIMESTAMPTZ
    );
    -- One open call per table: tapping the button twice never rings twice.
    CREATE UNIQUE INDEX IF NOT EXISTS idx_waiter_calls_open
      ON waiter_calls(table_id) WHERE resolved_at IS NULL;
  `)

  // Alerts that reach the staff's phone/computer even when the dashboard is
  // not open (Web Push): one row per browser that turned alerts on, plus a tiny
  // settings table that keeps the server's own push keys.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id          SERIAL PRIMARY KEY,
      endpoint    TEXT NOT NULL UNIQUE,
      p256dh      TEXT NOT NULL,
      auth        TEXT NOT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS app_settings (
      key    TEXT PRIMARY KEY,
      value  TEXT NOT NULL
    );
  `)

  // The order NUMBER the staff and the customer see ("#22"). It is not the
  // database id: it counts the orders of one day and starts again at 1 after
  // midnight (restaurant time zone). `order_day` is the day an order belongs to.
  await pool.query(`
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_day     DATE;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS daily_number  INTEGER;
  `)

  // Number the orders that were placed before this upgrade (oldest first, per
  // day), continuing after any number that is already taken that day.
  await pool.query(
    `UPDATE orders o
        SET order_day = x.d,
            daily_number = x.n + COALESCE(
              (SELECT MAX(daily_number) FROM orders t WHERE t.order_day = x.d), 0)
       FROM (SELECT id,
                    (created_at AT TIME ZONE $1)::date AS d,
                    ROW_NUMBER() OVER (PARTITION BY (created_at AT TIME ZONE $1)::date
                                       ORDER BY created_at, id) AS n
               FROM orders
              WHERE daily_number IS NULL) x
      WHERE o.id = x.id`,
    [TZ],
  )

  // A safety net: two orders of the same day can never share a number.
  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_day_number ON orders(order_day, daily_number);
  `)
}
