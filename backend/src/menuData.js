// ---------------------------------------------------------------------------
// THE MENU — this file is the one place the menu lives.
//
// The server reads it every time it starts (see menuSync.js) and makes the
// database match it, so the menu never has to be typed into the dashboard:
// change a dish here, push, deploy, done.
//
//   * Which categories and dishes exist, their names, pictures and order
//     always come from this file.
//   * price / discountPercent / available / isBest are the STARTING values.
//     Once a dish is in the database the staff can still change those from
//     the dashboard (e.g. mark a dish unavailable) and the change is kept
//     across restarts.
//
// The prices below are placeholders. Dish pictures live in
// frontend/public/images/menu/<category>/<id>.webp
// If you change this file, mirror it in frontend/src/data/menu.js (the
// fallback shown when the backend can't be reached).
// ---------------------------------------------------------------------------

export const CATEGORIES = [
  { id: 'pizza', name: 'Pizza', image: '/images/categories/pizza-menu.webp', description: 'Fresh from the oven' },
  { id: 'burger', name: 'Burger', image: '/images/categories/burger-menu.webp', description: 'Stacked & juicy' },
  { id: 'tacos', name: 'Tacos', image: '/images/categories/tacos-menu.webp', description: 'Grilled & loaded' },
  { id: 'sandwich', name: 'Sandwich', image: '/images/categories/sandwich-menu.webp', description: 'Crispy & generous' },
  { id: 'au-four', name: 'Au Four', image: '/images/categories/au-four-menu.webp', description: 'Calzone, baguette & gratin' },
  { id: 'plats', name: 'Les Plats', image: '/images/categories/plats-menu.webp', description: 'Plates & salads' },
]

export const MENU_ITEMS = [
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
