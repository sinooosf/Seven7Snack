import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('../services/api', () => ({
  adminFetchTables: vi.fn(),
  adminFetchFloors: vi.fn(),
  adminCreateTable: vi.fn(),
  adminDeleteTable: vi.fn(),
  adminUpdateTable: vi.fn(),
  adminCreateFloor: vi.fn(),
  adminRenameFloor: vi.fn(),
  adminDeleteFloor: vi.fn(),
}))
vi.mock('../admin/AdminAuthContext', () => ({ useAdminAuth: () => ({ password: 'secret' }) }))
vi.mock('../admin/AdminShellContext', () => ({
  useAdminShell: () => ({ setNavOpen: vi.fn(), summary: { pending: [] }, refreshSummary: vi.fn() }),
}))

import { adminCreateFloor, adminFetchFloors, adminFetchTables } from '../services/api'
import AdminTables from '../admin/pages/AdminTables'
import { LanguageProvider } from '../i18n/LanguageContext'

const table = (id, extra = {}) => ({
  id, label: `Table ${id}`, kind: 'table', seats: 4, floorId: 'ground', posX: null, posY: null,
  override: 'auto', state: 'available', openOrders: 0, order: null, ...extra,
})
const TABLES = [
  table('1'), table('2', { state: 'occupied' }), table('3'),
  { ...table('home'), kind: 'home', label: 'To Home' },
  { ...table('delivery'), kind: 'delivery', label: 'Delivery' },
]

function renderPage() {
  return render(
    <MemoryRouter>
      <LanguageProvider scope="admin">
        <AdminTables />
      </LanguageProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  adminFetchTables.mockResolvedValue(TABLES)
  adminFetchFloors.mockResolvedValue([{ id: 'ground', name: 'Ground floor', tables: 3 }])
})
afterEach(cleanup)

describe('dashboard Tables page', () => {
  it('shows the existing tables', async () => {
    renderPage()
    expect((await screen.findAllByText('Table 1')).length).toBeGreaterThan(0)
    expect(screen.getAllByText('Table 3').length).toBeGreaterThan(0)
    expect(screen.getByText(/Ground floor/)).toBeTruthy()
  })

  it('still shows the tables when the floors cannot be loaded', async () => {
    adminFetchFloors.mockRejectedValue(new Error('500'))
    renderPage()
    expect((await screen.findAllByText('Table 1')).length).toBeGreaterThan(0)
  })

  it('shows the tables of a backend that knows no floors at all', async () => {
    adminFetchFloors.mockResolvedValue([])
    adminFetchTables.mockResolvedValue(TABLES.map(({ floorId, ...rest }) => rest))
    renderPage()
    expect((await screen.findAllByText('Table 2')).length).toBeGreaterThan(0)
  })

  it('adds a floor and switches to its tab; tables of other floors are not shown there', async () => {
    adminCreateFloor.mockImplementation(async () => {
      adminFetchFloors.mockResolvedValue([
        { id: 'ground', name: 'Ground floor', tables: 3 },
        { id: 'second', name: 'Second floor', tables: 0 },
      ])
      return { id: 'second', name: 'Second floor' }
    })
    renderPage()
    await screen.findAllByText('Table 1')
    fireEvent.click(screen.getByText('Add floor'))
    fireEvent.change(await screen.findByPlaceholderText('Upper floor'), { target: { value: 'Second floor' } })
    fireEvent.click(screen.getByText('Save'))
    await waitFor(() => expect(screen.getByText(/Second floor/)).toBeTruthy())
    expect(adminCreateFloor).toHaveBeenCalledWith('secret', 'Second floor')
    await waitFor(() => expect(screen.queryAllByText('Table 1').length).toBe(0))
  })
})
