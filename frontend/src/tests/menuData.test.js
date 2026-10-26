import { describe, it, expect } from 'vitest'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { CATEGORIES, MENU_ITEMS } from '../data/menu'

// Guards the built-in menu against typos: every dish belongs to a real
// category, ids are unique, and every picture path points at a file that
// exists in /public (so no card ever shows a broken image).
const PUBLIC_DIR = join(process.cwd(), 'public')
const fileFor = (url) => join(PUBLIC_DIR, url)

describe('built-in menu data', () => {
  it('has unique category ids and unique dish ids', () => {
    expect(new Set(CATEGORIES.map((c) => c.id)).size).toBe(CATEGORIES.length)
    expect(new Set(MENU_ITEMS.map((i) => i.id)).size).toBe(MENU_ITEMS.length)
  })

  it('puts every dish in an existing category, and every category has dishes', () => {
    const ids = new Set(CATEGORIES.map((c) => c.id))
    for (const item of MENU_ITEMS) expect(ids.has(item.categoryId), item.id).toBe(true)
    for (const c of CATEGORIES) {
      expect(MENU_ITEMS.some((i) => i.categoryId === c.id), c.id).toBe(true)
    }
  })

  it('has a picture file for every category and dish', () => {
    for (const c of CATEGORIES) expect(existsSync(fileFor(c.image)), c.image).toBe(true)
    for (const i of MENU_ITEMS) expect(existsSync(fileFor(i.image)), i.image).toBe(true)
  })

  it('has a name and a positive price on every dish', () => {
    for (const i of MENU_ITEMS) {
      expect(i.name.trim().length, i.id).toBeGreaterThan(0)
      expect(i.price, i.id).toBeGreaterThan(0)
    }
  })
})
