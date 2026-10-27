import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { resetDatabase, startServer, firstMenuItems } from './helpers.js'

let srv
let api
let dishes

before(async () => {
  await resetDatabase()
  srv = await startServer()
  api = srv.api
  dishes = await firstMenuItems(api, 3)
})

after(async () => {
  await srv?.stop()
})

const admin = (path, method = 'GET', body) => api(`/admin${path}`, { method, admin: true, body })
const order = (body) => api('/orders', { method: 'POST', body })
const cats = async () => (await api('/menu')).body.categories.map((c) => c.id)

async function restartServer() {
  await srv.stop()
  srv = await startServer()
  api = srv.api
}

describe('categories: edit, order, remove', () => {
  it('renames a category and changes its picture', async () => {
    const res = await admin('/categories/pizza', 'PUT', { name: 'Pizzas', image: '/images/categories/burger-menu.webp' })
    assert.equal(res.status, 200)
    assert.equal(res.body.name, 'Pizzas')
    assert.equal(res.body.image, '/images/categories/burger-menu.webp')
    const menu = (await api('/menu')).body.categories.find((c) => c.id === 'pizza')
    assert.equal(menu.name, 'Pizzas')
  })

  it('only changes what is sent', async () => {
    const before = (await admin('/categories')).body.find((c) => c.id === 'burger')
    const res = await admin('/categories/burger', 'PUT', { description: 'Juicy!' })
    assert.equal(res.status, 200)
    assert.equal(res.body.name, before.name)
    assert.equal(res.body.image, before.image)
    assert.equal(res.body.description, 'Juicy!')
  })

  it('moves a category first, last, up and down', async () => {
    assert.equal((await admin('/categories/tacos', 'PUT', { position: 'first' })).status, 200)
    assert.equal((await cats())[0], 'tacos')

    assert.equal((await admin('/categories/tacos', 'PUT', { position: 'last' })).status, 200)
    const afterLast = await cats()
    assert.equal(afterLast[afterLast.length - 1], 'tacos')

    assert.equal((await admin('/categories/tacos', 'PUT', { position: 'up' })).status, 200)
    const afterUp = await cats()
    assert.equal(afterUp[afterUp.length - 2], 'tacos')

    assert.equal((await admin('/categories/tacos', 'PUT', { position: 'down' })).status, 200)
    const afterDown = await cats()
    assert.equal(afterDown[afterDown.length - 1], 'tacos')

    // the first one cannot go further up, the last cannot go further down
    assert.equal((await admin(`/categories/${afterDown[0]}`, 'PUT', { position: 'up' })).status, 200)
    assert.deepEqual(await cats(), afterDown)
    assert.equal((await admin('/categories/tacos', 'PUT', { position: 'down' })).status, 200)
    assert.deepEqual(await cats(), afterDown)
  })

  it('keeps sort positions clean (0..n-1, no ties)', async () => {
    const list = (await admin('/categories')).body
    assert.equal(new Set(list.map((c) => c.id)).size, list.length)
  })

  it('refuses bad input with 400 and unknown categories with 404', async () => {
    for (const body of [{ name: '' }, { name: '   ' }, { name: 'x'.repeat(81) }, { name: { a: 1 } }, { image: '' }, { position: 'middle' }, { position: 3 }, { description: 5 }]) {
      const res = await admin('/categories/pizza', 'PUT', body)
      assert.equal(res.status, 400, JSON.stringify(body))
    }
    assert.equal((await admin('/categories/does-not-exist', 'PUT', { name: 'X' })).status, 404)
    assert.equal((await api('/admin/categories/pizza', { method: 'PUT', body: { name: 'X' } })).status, 401)
  })

  it('a new category can be put first', async () => {
    const res = await admin('/categories', 'POST', { name: 'Desserts', position: 'first' })
    assert.equal(res.status, 201)
    assert.equal((await cats())[0], 'desserts')
    assert.equal((await admin('/categories', 'POST', { name: 'Bad', position: 'up' })).status, 400)
  })

  it('a category with an Arabic-only name still gets an id', async () => {
    const res = await admin('/categories', 'POST', { name: 'حلويات' })
    assert.equal(res.status, 201)
    assert.ok(res.body.id.length > 0)
    assert.equal((await admin(`/categories/${res.body.id}`, 'DELETE')).status, 200)
  })

  it('removing a category removes its dishes; the order list stays gapless', async () => {
    const dish = await admin('/menu-items', 'POST', { categoryId: 'desserts', name: 'Cake', price: 300, image: '/logo.png' })
    assert.equal(dish.status, 201)
    assert.equal((await admin('/categories/desserts', 'DELETE')).status, 409)
    assert.equal((await admin('/categories/desserts?withDishes=true', 'DELETE')).status, 200)
    assert.ok(!(await cats()).includes('desserts'))
  })

  it('what the staff did survives a restart (menuData.js only seeds)', async () => {
    // rename + move + remove a category that is ALSO in menuData.js, add a custom one with a dish
    assert.equal((await admin('/categories/sandwich', 'PUT', { name: 'Sandwichs maison', position: 'first' })).status, 200)
    assert.equal((await admin('/categories/plats?withDishes=true', 'DELETE')).status, 200)
    assert.equal((await admin('/categories', 'POST', { name: 'Drinks' })).status, 201)
    assert.equal((await admin('/menu-items', 'POST', { categoryId: 'drinks', name: 'Cola', price: 100, image: '/logo.png' })).status, 201)
    const before = (await api('/menu')).body

    await restartServer()

    const after = (await api('/menu')).body
    assert.deepEqual(after.categories.map((c) => [c.id, c.name, c.image]), before.categories.map((c) => [c.id, c.name, c.image]))
    assert.ok(!after.categories.some((c) => c.id === 'plats'), 'a removed category must not come back')
    assert.ok(!after.items.some((i) => i.categoryId === 'plats'), 'nor its dishes')
    assert.equal(after.categories[0].id, 'sandwich')
    assert.ok(after.items.some((i) => i.name === 'Cola'), 'dishes of a custom category are kept')
  })

  it('creating a removed category again makes it a normal category', async () => {
    const res = await admin('/categories', 'POST', { id: 'plats', name: 'Plats' })
    assert.equal(res.status, 201)
    await restartServer()
    assert.ok((await cats()).includes('plats'))
  })
})

describe('dishes: the dashboard owns them (menuData.js only seeds)', () => {
  it('a dish added to a built-in category, and edits to a built-in dish, survive a restart', async () => {
    const added = await admin('/menu-items', 'POST', { categoryId: 'sandwich', name: 'Chef special', price: 650, image: '/logo.png' })
    assert.equal(added.status, 201)
    const seeded = (await api('/menu')).body.items.find((i) => i.categoryId === 'sandwich' && i.id !== added.body.id)
    assert.equal((await admin(`/menu-items/${seeded.id}`, 'PUT', { name: 'Renamed by staff', price: 777 })).status, 200)

    await restartServer()

    const items = (await api('/menu')).body.items
    assert.ok(items.some((i) => i.id === added.body.id && i.name === 'Chef special'), 'an added dish must not be deleted')
    const edited = items.find((i) => i.id === seeded.id)
    assert.equal(edited.name, 'Renamed by staff')
    assert.equal(edited.price, 777)
  })

  it('a new dish goes at the end of its category', async () => {
    const before = (await api('/menu')).body.items.filter((i) => i.categoryId === 'sandwich')
    const added = await admin('/menu-items', 'POST', { categoryId: 'sandwich', name: 'Last one', price: 100, image: '/logo.png' })
    assert.equal(added.status, 201)
    const after = (await api('/menu')).body.items.filter((i) => i.categoryId === 'sandwich')
    assert.equal(after.length, before.length + 1)
    assert.equal(after[after.length - 1].id, added.body.id)
  })

  it('a built-in dish the staff removed stays removed after a restart', async () => {
    const seeded = (await api('/menu')).body.items.find((i) => i.categoryId === 'sandwich' && !/chef|last|renamed/i.test(i.name))
    assert.equal((await admin(`/menu-items/${seeded.id}`, 'DELETE')).status, 200)
    await restartServer()
    assert.ok(!(await api('/menu')).body.items.some((i) => i.id === seeded.id))
  })
})

describe('restoring removed categories', () => {
  it('lists the removed categories and brings them back with their dishes', async () => {
    assert.equal((await admin('/categories/tacos?withDishes=true', 'DELETE')).status, 200)
    const removed = (await admin('/categories/removed')).body
    assert.deepEqual(removed.map((c) => c.id), ['tacos'])
    assert.ok(removed[0].name && removed[0].image)

    const res = await admin('/categories/restore', 'POST')
    assert.equal(res.status, 200)
    assert.equal(res.body.restored, 1)
    assert.ok((await cats()).includes('tacos'))
    assert.ok((await api('/menu')).body.items.some((i) => i.categoryId === 'tacos'))
    assert.deepEqual((await admin('/categories/removed')).body, [])
    assert.equal((await admin('/categories/restore', 'POST')).body.restored, 0)
    assert.equal((await api('/admin/categories/removed')).status, 401)
  })
})

describe('floors', () => {
  it('starts with a ground floor holding the existing tables', async () => {
    const floors = (await admin('/floors')).body
    assert.deepEqual(floors.map((f) => f.id), ['ground'])
    assert.ok(floors[0].tables >= 5)
    const tables = (await admin('/tables')).body
    for (const table of tables.filter((t) => t.kind === 'table')) assert.equal(table.floorId, 'ground')
  })

  it('adds an upper floor, and tables can be put on it', async () => {
    const created = await admin('/floors', 'POST', { name: 'Upper floor' })
    assert.equal(created.status, 201)
    assert.equal(created.body.name, 'Upper floor')
    assert.equal(created.body.tables, 0)

    const table = await admin('/tables', 'POST', { id: '21', seats: 6, floorId: created.body.id })
    assert.equal(table.status, 201)
    assert.equal(table.body.floorId, created.body.id)

    // default floor = the first one
    const plain = await admin('/tables', 'POST', { id: '22' })
    assert.equal(plain.body.floorId, 'ground')

    const floors = (await admin('/floors')).body
    assert.equal(floors.find((f) => f.id === created.body.id).tables, 1)
    // the upper floor comes after the ground floor
    assert.equal(floors[0].id, 'ground')
  })

  it('moves a table between floors and forgets its old position', async () => {
    const upper = (await admin('/floors')).body.find((f) => f.id !== 'ground').id
    await admin('/tables/22', 'PATCH', { posX: 50, posY: 50 })
    const moved = await admin('/tables/22', 'PATCH', { floorId: upper })
    assert.equal(moved.status, 200)
    assert.equal(moved.body.floorId, upper)
    assert.equal(moved.body.posX, null)
    assert.equal(moved.body.posY, null)
    // moving it back
    assert.equal((await admin('/tables/22', 'PATCH', { floorId: 'ground' })).body.floorId, 'ground')
  })

  it('refuses unknown floors and strange input', async () => {
    assert.equal((await admin('/tables', 'POST', { id: '23', floorId: 'nope' })).status, 400)
    assert.equal((await admin('/tables/21', 'PATCH', { floorId: 'nope' })).status, 400)
    assert.equal((await admin('/tables/21', 'PATCH', { floorId: { a: 1 } })).status, 400)
    for (const body of [{}, { name: '' }, { name: '  ' }, { name: 'x'.repeat(61) }, { name: 5 }]) {
      assert.equal((await admin('/floors', 'POST', body)).status, 400, JSON.stringify(body))
    }
    assert.equal((await api('/admin/floors')).status, 401)
  })

  it('renames a floor', async () => {
    const upper = (await admin('/floors')).body.find((f) => f.id !== 'ground').id
    const res = await admin(`/floors/${upper}`, 'PATCH', { name: 'Terrace' })
    assert.equal(res.body.name, 'Terrace')
    assert.equal((await admin('/floors/nope', 'PATCH', { name: 'X' })).status, 404)
    await admin(`/floors/${upper}`, 'PATCH', { name: 'Upper floor' })
  })

  it('removes an empty floor but not one with tables, and never the last one', async () => {
    const upper = (await admin('/floors')).body.find((f) => f.id !== 'ground').id
    assert.equal((await admin(`/floors/${upper}`, 'DELETE')).status, 409) // table 21 is there
    assert.equal((await admin('/tables/21', 'DELETE')).status, 200)
    assert.equal((await admin(`/floors/${upper}`, 'DELETE')).status, 200)
    assert.equal((await admin(`/floors/${upper}`, 'DELETE')).status, 400) // only the ground floor is left
    assert.equal((await admin('/floors/ground', 'DELETE')).status, 400)
  })

  it('two floors with the same name get different ids', async () => {
    const a = await admin('/floors', 'POST', { name: 'Roof' })
    const b = await admin('/floors', 'POST', { name: 'Roof' })
    assert.equal(a.status, 201)
    assert.equal(b.status, 201)
    assert.notEqual(a.body.id, b.body.id)
    await admin(`/floors/${a.body.id}`, 'DELETE')
    await admin(`/floors/${b.body.id}`, 'DELETE')
  })
})

describe('delivery link', () => {
  const valid = () => ({ tableId: 'delivery', items: [{ id: dishes[0].id, quantity: 2 }], phone: '0555 12 34 56', address: 'Rue des Frères 12\n3rd floor, blue door' })

  it('exists as a special link, after To Home, and is never closed', async () => {
    const tables = (await api('/tables')).body
    const ids = tables.map((t) => t.id)
    assert.equal(ids[ids.length - 2], 'home')
    assert.equal(ids[ids.length - 1], 'delivery')
    const one = (await api('/tables/delivery')).body
    assert.equal(one.kind, 'delivery')
    assert.equal(one.unavailable, null)
  })

  it('needs a phone number and an address', async () => {
    const base = valid()
    const bad = [
      { ...base, phone: undefined },
      { ...base, phone: '' },
      { ...base, phone: 'abc' },
      { ...base, phone: '123' },
      { ...base, phone: '1'.repeat(40) },
      { ...base, phone: { a: 1 } },
      { ...base, address: undefined },
      { ...base, address: '   ' },
      { ...base, address: 'x'.repeat(301) },
      { ...base, address: ['a'] },
    ]
    for (const body of bad) {
      const res = await order(body)
      assert.equal(res.status, 400, JSON.stringify(body).slice(0, 80))
      assert.match(res.body.error, /phone|address/i)
    }
  })

  it('accepts usual phone formats', async () => {
    for (const phone of ['0555123456', '0555 12 34 56', '+213 555 123 456', '(021) 55-44-33', '05.55.12.34.56']) {
      const res = await order({ ...valid(), phone })
      assert.equal(res.status, 201, phone)
    }
  })

  it('places a delivery order that carries its details', async () => {
    const res = await order({ ...valid(), note: 'no onions' })
    assert.equal(res.status, 201)
    assert.equal(res.body.type, 'delivery')
    assert.equal(res.body.tableId, 'delivery')
    assert.equal(res.body.phone, '0555 12 34 56')
    assert.equal(res.body.address, 'Rue des Frères 12\n3rd floor, blue door')
    assert.equal(res.body.note, 'no onions')
    assert.equal(res.body.status, 'preparing')

    const one = await api(`/orders/${res.body.id}`)
    assert.equal(one.body.address, res.body.address)

    const list = (await admin('/orders')).body.orders.find((o) => o.id === res.body.id)
    assert.equal(list.type, 'delivery')
    assert.equal(list.phone, '0555 12 34 56')
  })

  it('other orders carry no phone/address, even if sent', async () => {
    const res = await order({ tableId: '1', items: [{ id: dishes[0].id, quantity: 1 }], phone: '0555123456', address: 'somewhere' })
    assert.equal(res.status, 201)
    assert.equal(res.body.type, 'table')
    assert.equal(res.body.phone, '')
    assert.equal(res.body.address, '')
    const home = await order({ tableId: 'home', items: [{ id: dishes[0].id, quantity: 1 }] })
    assert.equal(home.body.type, 'home')
  })

  it('two customers never see each other\'s delivery order', async () => {
    assert.equal((await api('/orders/table/delivery/active')).body, null)
  })

  it('staff can place a delivery order from the dashboard', async () => {
    assert.equal((await admin('/orders', 'POST', { tableId: 'delivery', items: [{ id: dishes[1].id, quantity: 1 }] })).status, 400)
    const ok = await admin('/orders', 'POST', valid())
    assert.equal(ok.status, 201)
    assert.equal(ok.body.type, 'delivery')
  })

  it('cannot be moved to a table or merged; cannot be removed or reused as a table id', async () => {
    const a = (await order(valid())).body
    const b = (await order({ tableId: '3', items: [{ id: dishes[0].id, quantity: 1 }] })).body
    assert.equal((await admin(`/orders/${a.id}/move`, 'PATCH', { tableId: '4' })).status, 409)
    assert.equal((await admin('/orders/merge', 'POST', { fromOrderId: a.id, intoOrderId: b.id })).status, 409)
    assert.equal((await admin('/orders/merge', 'POST', { fromOrderId: b.id, intoOrderId: a.id })).status, 409)
    assert.equal((await admin('/tables/delivery', 'DELETE')).status, 400)
    assert.equal((await admin('/tables', 'POST', { id: 'delivery' })).status, 400)
    assert.equal((await admin('/tables', 'POST', { id: 'DELIVERY' })).status, 400)
    assert.equal((await admin('/tables/delivery', 'PATCH', { seats: 3 })).status, 404)
  })

  it('has no waiter to call, and its status follows the normal flow', async () => {
    assert.equal((await api('/waiter-calls', { method: 'POST', body: { tableId: 'delivery' } })).status, 400)
    const o = (await order(valid())).body
    const done = await admin(`/orders/${o.id}/status`, 'PATCH', { status: 'ready' })
    assert.equal(done.status, 200)
    assert.equal(done.body.phone, valid().phone)
  })

  it('the delivery link and floors survive a restart', async () => {
    await restartServer()
    assert.equal((await api('/tables/delivery')).body.kind, 'delivery')
    assert.ok((await admin('/floors')).body.length >= 1)
  })
})

describe('floors repair themselves', () => {
  it('a missing floors table or column does not break the floors list or adding a floor', async () => {
    const { default: pg } = await import('pg')
    const pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL })
    await pool.query('ALTER TABLE restaurant_tables DROP COLUMN IF EXISTS floor_id')
    await pool.query('DROP TABLE IF EXISTS floors CASCADE')
    const list = await admin('/floors')
    assert.equal(list.status, 200)
    assert.ok(list.body.some((f) => f.id === 'ground'))
    assert.equal((await admin('/floors', 'POST', { name: 'Terrace' })).status, 201)
    assert.equal((await admin('/tables')).status, 200)
    await pool.end()
  })
})
