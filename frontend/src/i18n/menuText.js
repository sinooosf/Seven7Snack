// ---------------------------------------------------------------------------
// Dish and category names in French and Arabic.
//
// The menu itself (names, prices) lives in the database and is typed from the
// dashboard. The dish names are already French, so French needs no entries
// here. For Arabic we know the translation of the 40 starting dishes, looked
// up by the name as typed. A dish the staff adds later that is not in this
// list simply shows the name as it was typed.
// To translate a new dish: add one line under `ar` below.
// ---------------------------------------------------------------------------
const ITEMS = {
  fr: {},
  ar: {
    'Pizza Seven Snack': 'بيتزا سيفن سناك',
    'Pizza Margherita': 'بيتزا مارغريتا',
    'Pizza 3 Fromages': 'بيتزا 3 أجبان',
    'Pizza 4 Fromages': 'بيتزا 4 أجبان',
    'Pizza Fruits de Mer': 'بيتزا فواكه البحر',
    'Burger Classic': 'برغر كلاسيك',
    'Big Burger': 'بيغ برغر',
    'Burger Krispy': 'برغر كريسبي',
    'Tacos Poulet': 'تاكوس دجاج',
    'Tacos Viande': 'تاكوس لحم',
    'Tacos Crispy': 'تاكوس كريسبي',
    'Tacos Mexicain': 'تاكوس مكسيكي',
    'Poulet Crispy': 'ساندويتش دجاج كريسبي',
    'Poulet Mariné': 'ساندويتش دجاج متبّل',
    'Poulet à la Crème': 'ساندويتش دجاج بالكريمة',
    'Viande Hachée': 'ساندويتش لحم مفروم',
    'Tabouna Matlou3': 'طابونة مطلوع',
    'Tabouna Matlou3 Viande': 'طابونة مطلوع باللحم',
    'Calzone Viande': 'كالزوني باللحم',
    'Calzone Chicken': 'كالزوني بالدجاج',
    'Calzone Fruits de Mer': 'كالزوني فواكه البحر',
    'Gratin Viande': 'غراتان باللحم',
    'Gratin Poulet': 'غراتان بالدجاج',
    'Gratin Crispy': 'غراتان كريسبي',
    'Gratin Crousty': 'غراتان كروستي',
    'Gratin Fruits de Mer': 'غراتان فواكه البحر',
    'Baguette Farcie Poulet': 'باغيت محشي بالدجاج',
    'Baguette Farcie Viande': 'باغيت محشي باللحم',
    'Plat Chich Taouk': 'طبق شيش طاووق',
    'Plat Chicken Crispy': 'طبق دجاج كريسبي',
    'Plat Viande Hachée': 'طبق لحم مفروم',
    'Plat Escalope Grillé': 'طبق إسكالوب مشوي',
    'Plat Escalope à la Crème': 'طبق إسكالوب بالكريمة',
    'Plat Saajdouk': 'طبق سجق',
    'Barquette Frite': 'علبة بطاطس مقلية',
    'Frites Gratinées': 'بطاطس غراتان',
    'Salade de Thon': 'سلطة التونة',
    'Salade Variée': 'سلطة منوعة',
    'Salade César': 'سلطة سيزر',
  },
}

const CATEGORIES = {
  fr: { Pizza: 'Pizzas', Burger: 'Burgers', Tacos: 'Tacos', Sandwich: 'Sandwichs', 'Au Four': 'Au four', 'Les Plats': 'Les plats' },
  ar: { Pizza: 'بيتزا', Burger: 'برغر', Tacos: 'تاكوس', Sandwich: 'ساندويتشات', 'Au Four': 'من الفرن', 'Les Plats': 'الأطباق' },
}

const DESCRIPTIONS = {
  fr: {
    'Fresh from the oven': 'Tout droit sorties du four',
    'Stacked & juicy': 'Généreux et juteux',
    'Grilled & loaded': 'Grillés et bien garnis',
    'Crispy & generous': 'Croustillants et copieux',
    'Calzone, baguette & gratin': 'Calzone, baguette et gratin',
    'Plates & salads': 'Plats et salades',
  },
  ar: {
    'Fresh from the oven': 'طازجة من الفرن',
    'Stacked & juicy': 'غنية وعصيرية',
    'Grilled & loaded': 'مشوية ومحشوة',
    'Crispy & generous': 'مقرمشة وسخية',
    'Calzone, baguette & gratin': 'كالزوني وباغيت وغراتان',
    'Plates & salads': 'أطباق وسلطات',
  },
}

export const itemName = (item, code) => ITEMS[code]?.[item?.name] ?? item?.name ?? ''
export const categoryName = (category, code) => CATEGORIES[code]?.[category?.name] ?? category?.name ?? ''
export const categoryDescription = (category, code) =>
  DESCRIPTIONS[code]?.[category?.description] ?? category?.description ?? ''

// True when `term` is found in the dish name in ANY language, so a customer
// can search "poulet" or "دجاج" or "chicken" no matter which language is on.
export function itemMatchesSearch(item, term) {
  const needle = term.trim().toLowerCase()
  if (!needle) return true
  return [item.name, ITEMS.fr[item.name], ITEMS.ar[item.name]].some(
    (name) => name && name.toLowerCase().includes(needle)
  )
}
