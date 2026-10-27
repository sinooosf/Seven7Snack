import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import MenuItemCard from '../components/menu/MenuItemCard'
import { CartProvider } from '../context/CartContext'
import { MENU_ITEMS } from '../data/menu'

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
    const item = MENU_ITEMS.find((i) => i.id === 'pizza-margherita') // 600 DH
    renderCard(item)
    expect(screen.getByText('600 DH')).toBeInTheDocument()
  })

  it('shows the discounted price and the crossed-out original price', () => {
    const item = { ...MENU_ITEMS.find((i) => i.id === 'pizza-margherita'), discountPercent: 50 } // 600 DH, -50%
    renderCard(item)
    expect(screen.getByText('300 DH')).toBeInTheDocument()
    expect(screen.getByText('600 DH')).toBeInTheDocument()
    expect(screen.getByText('-50%')).toBeInTheDocument()
  })

  it('disables adding an unavailable item', () => {
    const item = { ...MENU_ITEMS.find((i) => i.id === 'pizza-margherita'), available: false }
    renderCard(item)
    expect(screen.getByText('UNAVAILABLE')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /add/i })).not.toBeInTheDocument()
  })

  it('adding an item switches the card into quantity-stepper mode', async () => {
    const user = userEvent.setup()
    const item = MENU_ITEMS.find((i) => i.id === 'burger-classic') // Burger Classic
    renderCard(item)

    await user.click(screen.getByRole('button', { name: /^add burger classic$/i }))

    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /remove one burger classic/i })).toBeInTheDocument()
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
