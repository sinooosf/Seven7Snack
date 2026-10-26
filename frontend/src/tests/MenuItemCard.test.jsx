import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import MenuItemCard from '../components/menu/MenuItemCard'
import { CartProvider } from '../context/CartContext'
import { MENU_ITEMS, getFinalPrice } from '../data/menu'

// Dishes come from the built-in menu, so these tests keep working when the menu changes.
const [DISH_A, DISH_B] = MENU_ITEMS
const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function renderCard(item) {
  return render(
    <MemoryRouter initialEntries={['/table/1']}>
    <CartProvider>
      <MenuItemCard item={item} />
    </CartProvider>
    </MemoryRouter>,
  )
}

describe('MenuItemCard', () => {
  it('shows the plain price when there is no discount', () => {
    const item = { ...DISH_A, discountPercent: 0 }
    renderCard(item)
    expect(screen.getByText(`${item.price} DH`)).toBeInTheDocument()
  })

  it('shows the discounted price and the crossed-out original price', () => {
    const item = { ...DISH_A, price: 550, discountPercent: 50 }
    renderCard(item)
    expect(getFinalPrice(item)).toBe(275)
    expect(screen.getByText('275 DH')).toBeInTheDocument()
    expect(screen.getByText('550 DH')).toBeInTheDocument()
    expect(screen.getByText('-50%')).toBeInTheDocument()
  })

  it('disables adding an unavailable item', () => {
    const item = { ...DISH_A, available: false }
    renderCard(item)
    expect(screen.getByText('UNAVAILABLE')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /add/i })).not.toBeInTheDocument()
  })

  it('adding an item switches the card into quantity-stepper mode', async () => {
    const user = userEvent.setup()
    const item = { ...DISH_B, available: true }
    renderCard(item)
    const name = escapeRegExp(item.name)

    await user.click(screen.getByRole('button', { name: new RegExp(`^add ${name}$`, 'i') }))

    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: new RegExp(`remove one ${name}`, 'i') })).toBeInTheDocument()
  })
})

describe('MenuItemCard: tapping the card itself', () => {
  const dish = { id: 'x1', name: 'Soup', price: 100, discountPercent: 0, available: true, image: '' }

  it('adds one like the + button, with a small dip, and a button tap counts once', async () => {
    const user = userEvent.setup()
    renderCard(dish)
    await user.click(screen.getByTestId('menu-card'))
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByTestId('menu-card').className).toMatch(/translate-y-1\.5/)

    await user.click(screen.getByRole('button', { name: /another/i }))
    expect(screen.getByText('2')).toBeInTheDocument() // not 3
  })

  it('does nothing on an unavailable dish', async () => {
    const user = userEvent.setup()
    renderCard({ ...dish, id: 'x2', available: false })
    await user.click(screen.getByTestId('menu-card'))
    expect(screen.queryByText('1')).not.toBeInTheDocument()
  })
})
