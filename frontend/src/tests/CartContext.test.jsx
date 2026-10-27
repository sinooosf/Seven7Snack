import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { CartProvider, useCart } from '../context/CartContext'
import { MENU_ITEMS } from '../data/menu'

function wrapper({ children }) {
  return (
    <MemoryRouter initialEntries={['/table/1']}>
      <CartProvider>{children}</CartProvider>
    </MemoryRouter>
  )
}

describe('CartContext', () => {
  it('starts empty', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    expect(result.current.totalCount).toBe(0)
    expect(result.current.totalPrice).toBe(0)
  })

  it('removeLine deletes a dish completely, whatever its quantity (swipe to delete)', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => { result.current.addItem('pizza-margherita'); result.current.addItem('pizza-margherita'); result.current.addItem('pizza-margherita') })
    expect(result.current.totalCount).toBe(3)
    act(() => result.current.removeLine('pizza-margherita'))
    expect(result.current.totalCount).toBe(0)
  })

  it('adds an item and totals it correctly', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => result.current.addItem('pizza-margherita')) // Pizza Margherita, 600 DH, no discount

    expect(result.current.totalCount).toBe(1)
    expect(result.current.totalPrice).toBe(600)
  })

  it('applies the item discount when totaling', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    // The built-in menu has no discounted dish, so give one a 50% discount for this test.
    const dish = MENU_ITEMS.find((i) => i.id === 'pizza-margherita') // 600 DH
    dish.discountPercent = 50

    try {
      act(() => result.current.addItem('pizza-margherita'))
      expect(result.current.totalPrice).toBe(300)
    } finally {
      dish.discountPercent = 0
    }
  })

  it('increments quantity on repeated adds', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => {
      result.current.addItem('burger-classic')
      result.current.addItem('burger-classic')
    })

    const line = result.current.lines.find((l) => l.item.id === 'burger-classic')
    expect(line.quantity).toBe(2)
    expect(result.current.totalCount).toBe(2)
  })

  it('removes an item entirely once its quantity hits zero', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => result.current.addItem('burger-classic'))
    act(() => result.current.removeItem('burger-classic'))

    expect(result.current.totalCount).toBe(0)
    expect(result.current.lines).toHaveLength(0)
  })

  it('clearCart empties everything', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => {
      result.current.addItem('burger-classic')
      result.current.addItem('pizza-margherita')
      result.current.clearCart()
    })

    expect(result.current.totalCount).toBe(0)
  })
})
