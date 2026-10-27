// ---------------------------------------------------------------------------
// Menu data.
//
// CATEGORIES and MENU_ITEMS start out as the menu from
// backend/src/menuData.js (keep the two in step — the backend file is the
// real source of truth, this copy is the offline fallback). Call loadMenuData() once (CustomerApp.jsx does this
// while the loading screen is showing) to replace them with whatever the
// backend has. If the backend isn't running or the request fails, these built-in arrays
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
  { id: 'pizza', name: 'Pizza', image: '/images/categories/pizza-menu.webp', description: 'Fresh from the oven' },
  { id: 'burger', name: 'Burger', image: '/images/categories/burger-menu.webp', description: 'Stacked & juicy' },
  { id: 'tacos', name: 'Tacos', image: '/images/categories/tacos-menu.webp', description: 'Grilled & loaded' },
  { id: 'sandwich', name: 'Sandwich', image: '/images/categories/sandwich-menu.webp', description: 'Crispy & generous' },
  { id: 'au-four', name: 'Au Four', image: '/images/categories/au-four-menu.webp', description: 'Calzone, baguette & gratin' },
  { id: 'plats', name: 'Les Plats', image: '/images/categories/plats-menu.webp', description: 'Plates & salads' },
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
export let MENU_ITEMS = [
  { id: 'pizza-seven-snack', categoryId: 'pizza', name: 'Pizza Seven Snack', price: 900, image: '/images/menu/pizza/pizza-seven-snack.webp', available: true, discountPercent: 0, isBest: true },
  { id: 'pizza-margherita', categoryId: 'pizza', name: 'Pizza Margherita', price: 600, image: '/images/menu/pizza/pizza-margherita.webp', available: true, discountPercent: 0, isBest: false },
  { id: 'pizza-3-fromages', categoryId: 'pizza', name: 'Pizza 3 Fromages', price: 750, image: '/images/menu/pizza/pizza-3-fromages.webp', available: true, discountPercent: 0, isBest: false },
  { id: 'pizza-4-fromages', categoryId: 'pizza', name: 'Pizza 4 Fromages', price: 800, image: '/images/menu/pizza/pizza-4-fromages.webp', available: true, discountPercent: 0, isBest: false },
  { id: 'pizza-fruits-de-mer', categoryId: 'pizza', name: 'Pizza Fruits de Mer', price: 900, image: '/images/menu/pizza/pizza-fruits-de-mer.webp', available: true, discountPercent: 0, isBest: false },
  { id: 'pizza-ail-chinx', categoryId: 'pizza', name: 'Pizza Ail Chinx', price: 800, image: '/images/menu/pizza/pizza-ail-chinx.webp', available: true, discountPercent: 0, isBest: false },

  { id: 'burger-classic', categoryId: 'burger', name: 'Burger Classic', price: 450, image: '/images/menu/burger/burger-classic.webp', available: true, discountPercent: 0, isBest: false },
  { id: 'burger-big', categoryId: 'burger', name: 'Big Burger', price: 600, image: '/images/menu/burger/burger-big.webp', available: true, discountPercent: 0, isBest: true },
  { id: 'burger-krispy', categoryId: 'burger', name: 'Burger Krispy', price: 500, image: '/images/menu/burger/burger-krispy.webp', available: true, discountPercent: 0, isBest: false },

  { id: 'tacos-poulet', categoryId: 'tacos', name: 'Tacos Poulet', price: 400, image: '/images/menu/tacos/tacos-poulet.webp', available: true, discountPercent: 0, isBest: true },
  { id: 'tacos-viande', categoryId: 'tacos', name: 'Tacos Viande', price: 450, image: '/images/menu/tacos/tacos-viande.webp', available: true, discountPercent: 0, isBest: false },
  { id: 'tacos-crispy', categoryId: 'tacos', name: 'Tacos Crispy', price: 450, image: '/images/menu/tacos/tacos-crispy.webp', available: true, discountPercent: 0, isBest: false },
  { id: 'tacos-mexicain', categoryId: 'tacos', name: 'Tacos Mexicain', price: 500, image: '/images/menu/tacos/tacos-mexicain.webp', available: true, discountPercent: 0, isBest: false },

  { id: 'sandwich-poulet-crispy', categoryId: 'sandwich', name: 'Poulet Crispy', price: 350, image: '/images/menu/sandwich/sandwich-poulet-crispy.webp', available: true, discountPercent: 0, isBest: true },
  { id: 'sandwich-poulet-marine', categoryId: 'sandwich', name: 'Poulet Mariné', price: 350, image: '/images/menu/sandwich/sandwich-poulet-marine.webp', available: true, discountPercent: 0, isBest: false },
  { id: 'sandwich-poulet-creme', categoryId: 'sandwich', name: 'Poulet à la Crème', price: 400, image: '/images/menu/sandwich/sandwich-poulet-creme.webp', available: true, discountPercent: 0, isBest: false },
  { id: 'sandwich-viande-hachee', categoryId: 'sandwich', name: 'Viande Hachée', price: 380, image: '/images/menu/sandwich/sandwich-viande-hachee.webp', available: true, discountPercent: 0, isBest: false },
  { id: 'sandwich-tabouna-matlou3', categoryId: 'sandwich', name: 'Tabouna Matlou3', price: 350, image: '/images/menu/sandwich/sandwich-tabouna-matlou3.webp', available: true, discountPercent: 0, isBest: false },
  { id: 'sandwich-tabouna-matlou3-viande', categoryId: 'sandwich', name: 'Tabouna Matlou3 Viande', price: 400, image: '/images/menu/sandwich/sandwich-tabouna-matlou3-viande.webp', available: true, discountPercent: 0, isBest: false },

  { id: 'au-four-calzone-viande', categoryId: 'au-four', name: 'Calzone Viande', price: 500, image: '/images/menu/au-four/au-four-calzone-viande.webp', available: true, discountPercent: 0, isBest: true },
  { id: 'au-four-calzone-chicken', categoryId: 'au-four', name: 'Calzone Chicken', price: 500, image: '/images/menu/au-four/au-four-calzone-chicken.webp', available: true, discountPercent: 0, isBest: false },
  { id: 'au-four-calzone-fruits-de-mer', categoryId: 'au-four', name: 'Calzone Fruits de Mer', price: 600, image: '/images/menu/au-four/au-four-calzone-fruits-de-mer.webp', available: true, discountPercent: 0, isBest: false },
  { id: 'au-four-gratin-viande', categoryId: 'au-four', name: 'Gratin Viande', price: 550, image: '/images/menu/au-four/au-four-gratin-viande.webp', available: true, discountPercent: 0, isBest: false },
  { id: 'au-four-gratin-poulet', categoryId: 'au-four', name: 'Gratin Poulet', price: 550, image: '/images/menu/au-four/au-four-gratin-poulet.webp', available: true, discountPercent: 0, isBest: false },
  { id: 'au-four-gratin-crispy', categoryId: 'au-four', name: 'Gratin Crispy', price: 600, image: '/images/menu/au-four/au-four-gratin-crispy.webp', available: true, discountPercent: 0, isBest: false },
  { id: 'au-four-gratin-crousty', categoryId: 'au-four', name: 'Gratin Crousty', price: 600, image: '/images/menu/au-four/au-four-gratin-crousty.webp', available: true, discountPercent: 0, isBest: false },
  { id: 'au-four-gratin-fruits-de-mer', categoryId: 'au-four', name: 'Gratin Fruits de Mer', price: 650, image: '/images/menu/au-four/au-four-gratin-fruits-de-mer.webp', available: true, discountPercent: 0, isBest: false },
  { id: 'au-four-baguette-poulet', categoryId: 'au-four', name: 'Baguette Farcie Poulet', price: 450, image: '/images/menu/au-four/au-four-baguette-poulet.webp', available: true, discountPercent: 0, isBest: false },
  { id: 'au-four-baguette-viande', categoryId: 'au-four', name: 'Baguette Farcie Viande', price: 450, image: '/images/menu/au-four/au-four-baguette-viande.webp', available: true, discountPercent: 0, isBest: false },

  { id: 'plats-chich-taouk', categoryId: 'plats', name: 'Plat Chich Taouk', price: 800, image: '/images/menu/plats/plats-chich-taouk.webp', available: true, discountPercent: 0, isBest: true },
  { id: 'plats-chicken-crispy', categoryId: 'plats', name: 'Plat Chicken Crispy', price: 800, image: '/images/menu/plats/plats-chicken-crispy.webp', available: true, discountPercent: 0, isBest: false },
  { id: 'plats-viande-hachee', categoryId: 'plats', name: 'Plat Viande Hachée', price: 750, image: '/images/menu/plats/plats-viande-hachee.webp', available: true, discountPercent: 0, isBest: false },
  { id: 'plats-escalope-grille', categoryId: 'plats', name: 'Plat Escalope Grillé', price: 850, image: '/images/menu/plats/plats-escalope-grille.webp', available: true, discountPercent: 0, isBest: false },
  { id: 'plats-escalope-creme', categoryId: 'plats', name: 'Plat Escalope à la Crème', price: 900, image: '/images/menu/plats/plats-escalope-creme.webp', available: true, discountPercent: 0, isBest: false },
  { id: 'plats-saajdouk', categoryId: 'plats', name: 'Plat Saajdouk', price: 800, image: '/images/menu/plats/plats-saajdouk.webp', available: true, discountPercent: 0, isBest: false },
  { id: 'plats-barquette-frite', categoryId: 'plats', name: 'Barquette Frite', price: 300, image: '/images/menu/plats/plats-barquette-frite.webp', available: true, discountPercent: 0, isBest: false },
  { id: 'plats-frites-gratinees', categoryId: 'plats', name: 'Frites Gratinées', price: 400, image: '/images/menu/plats/plats-frites-gratinees.webp', available: true, discountPercent: 0, isBest: false },
  { id: 'plats-salade-thon', categoryId: 'plats', name: 'Salade de Thon', price: 500, image: '/images/menu/plats/plats-salade-thon.webp', available: true, discountPercent: 0, isBest: false },
  { id: 'plats-salade-variee', categoryId: 'plats', name: 'Salade Variée', price: 400, image: '/images/menu/plats/plats-salade-variee.webp', available: true, discountPercent: 0, isBest: false },
  { id: 'plats-salade-cesar', categoryId: 'plats', name: 'Salade César', price: 550, image: '/images/menu/plats/plats-salade-cesar.webp', available: true, discountPercent: 0, isBest: false },
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
