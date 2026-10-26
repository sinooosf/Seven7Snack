// ---------------------------------------------------------------------------
// Menu data.
//
// CATEGORIES and MENU_ITEMS start out as the same demo data this project
// always shipped with. Call loadMenuData() once (App.jsx does this during
// the intro) to replace them with whatever's actually in the database. If
// the backend isn't running or the request fails, these built-in arrays
// stay in place so the app still shows a working menu instead of a blank
// screen.
//
// Every export below reads these two `let` bindings at call time, so once
// loadMenuData() reassigns them, every part of the app that already
// imported CATEGORIES/MENU_ITEMS sees the fresh data automatically — ES
// module imports are live references, not one-time copies.
// ---------------------------------------------------------------------------

import { fetchMenu } from '../services/api'

export let CATEGORIES = [
  {
    id: 'pizza',
    name: 'Pizza',
    image: '/images/categories/pizza.webp',
    description: 'Fresh from the oven',
  },
  {
    id: 'burger',
    name: 'Burger',
    image: '/images/categories/burger.webp',
    description: 'Stacked & juicy',
  },
  {
    id: 'tacos',
    name: 'Tacos',
    image: '/images/categories/tacos.webp',
    description: 'Grilled & loaded',
  },
  {
    id: 'sandwich',
    name: 'Sandwich',
    image: '/images/categories/sandwich.webp',
    description: 'Crispy & generous',
  },
  {
    id: 'au-four',
    name: 'Au Four',
    image: '/images/categories/au-four.webp',
    description: 'Calzone, baguette & gratin',
  },
  {
    id: 'plats',
    name: 'Les Plats',
    image: '/images/categories/plats.webp',
    description: 'Plates & salads',
  },
]

// Fields on every item:
//   id               unique string
//   categoryId       matches a CATEGORIES[].id
//   name             shown on the card
//   price            base price in DH, before discount
//   image            path under /public
//   available        false => card shows an "unavailable" state, can't be added
//   discountPercent  0-100. Editable per item. 0 means "no discount tag shown"
//   isBest           true => surfaces first in its category, and is what the
//                    chatbot recommends when asked for the best dishes
// NOTE: the prices below are placeholders (the menu photos came without prices).
// Change them here, or from the dashboard's Menu tab once the backend is running.
export let MENU_ITEMS = [
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

// Called once at startup (see App.jsx). Swaps the arrays above for whatever
// the backend actually has. Safe to call even if the backend is offline —
// it just leaves the built-in demo data in place and logs a warning.
export async function loadMenuData() {
  try {
    const data = await fetchMenu()
    // Only accept well-formed entries: one broken row must not blank the menu.
    const goodCategory = (c) => c && typeof c.id === 'string' && typeof c.name === 'string'
    const goodItem = (i) =>
      i && typeof i.id === 'string' && typeof i.categoryId === 'string' &&
      typeof i.name === 'string' && Number.isFinite(i.price)

    const categories = Array.isArray(data?.categories) ? data.categories.filter(goodCategory) : []
    const items = Array.isArray(data?.items) ? data.items.filter(goodItem) : []

    if (categories.length) CATEGORIES = categories
    if (Array.isArray(data?.items)) MENU_ITEMS = items
  } catch (err) {
    console.warn('Could not load the menu from the backend — using the built-in demo menu instead.', err)
  }
}

// Effective price after discount, rounded to the nearest DH.
export function getFinalPrice(item) {
  if (!item.discountPercent) return item.price
  return Math.round(item.price * (1 - item.discountPercent / 100))
}

// Items for one category, "best" ones pinned to the front (stable order
// otherwise) — this is the rule the chatbot and the menu grid both use.
export function getItemsForCategory(categoryId) {
  return MENU_ITEMS
    .filter((item) => item.categoryId === categoryId)
    .sort((a, b) => Number(b.isBest) - Number(a.isBest))
}

export function getBestItems() {
  return MENU_ITEMS.filter((item) => item.isBest)
}

export function getUnavailableItems() {
  return MENU_ITEMS.filter((item) => !item.available)
}
