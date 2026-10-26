import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { CartProvider, useCart } from '../context/CartContext'
import { MENU_ITEMS, getFinalPrice } from '../data/menu'

// Two different dishes from the built-in menu. The tests don't depend on which
// dishes they are, so editing the menu never breaks them.
const [DISH_A, DISH_B] = MENU_ITEMS

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
    act(() => { result.current.addItem(DISH_A.id); result.current.addItem(DISH_A.id); result.current.addItem(DISH_A.id) })
    expect(result.current.totalCount).toBe(3)
    act(() => result.current.removeLine(DISH_A.id))
    expect(result.current.totalCount).toBe(0)
  })

  it('adds an item and totals it correctly', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => result.current.addItem(DISH_A.id))

    expect(result.current.totalCount).toBe(1)
    expect(result.current.totalPrice).toBe(getFinalPrice(DISH_A))
  })

  it('applies the item discount when totaling', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    // Put a 50% discount on a dish for this test only, then restore it.
    const before = DISH_B.discountPercent
    DISH_B.discountPercent = 50
    try {
      act(() => result.current.addItem(DISH_B.id))
      expect(result.current.totalPrice).toBe(Math.round(DISH_B.price / 2))
    } finally {
      DISH_B.discountPercent = before
    }
  })

  it('increments quantity on repeated adds', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => {
      result.current.addItem(DISH_B.id)
      result.current.addItem(DISH_B.id)
    })

    const line = result.current.lines.find((l) => l.item.id === DISH_B.id)
    expect(line.quantity).toBe(2)
    expect(result.current.totalCount).toBe(2)
  })

  it('removes an item entirely once its quantity hits zero', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => result.current.addItem(DISH_B.id))
    act(() => result.current.removeItem(DISH_B.id))

    expect(result.current.totalCount).toBe(0)
    expect(result.current.lines).toHaveLength(0)
  })

  it('clearCart empties everything', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => {
      result.current.addItem(DISH_B.id)
      result.current.addItem(DISH_A.id)
      result.current.clearCart()
    })

    expect(result.current.totalCount).toBe(0)
  })
})
