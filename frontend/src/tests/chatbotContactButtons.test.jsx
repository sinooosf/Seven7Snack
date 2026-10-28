import { describe, it, expect, vi, afterEach } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'

vi.mock('../context/CartContext', () => ({ useCart: () => ({ addItem: vi.fn() }) }))

import ChatbotPanel from '../components/chatbot/ChatbotPanel'
import { LanguageProvider } from '../i18n/LanguageContext'

afterEach(cleanup)

function open() {
  render(
    <LanguageProvider>
      <ChatbotPanel open onClose={() => {}} onNavigateToCategory={() => {}} />
    </LanguageProvider>,
  )
}

const hrefs = () => screen.getAllByRole('link').map((a) => a.getAttribute('href'))

describe('chatbot contact quick actions', () => {
  it('the contact chip answers with call / TikTok / Instagram buttons', async () => {
    open()
    fireEvent.click(screen.getByText('How can I contact you?'))
    await screen.findByText(/Delivery is available/, {}, { timeout: 3000 })
    expect(hrefs()).toEqual(expect.arrayContaining([
      'tel:0556131530',
      'tel:0559250472',
      'https://www.tiktok.com/@seven7snack',
      'https://www.instagram.com/seven7snack.bouismail',
    ]))
    expect(screen.getByText('@seven7snack')).toBeTruthy()
    expect(screen.getByText('@seven7snack.bouismail')).toBeTruthy()
  })

  it('the delivery chip shows the delivery numbers', async () => {
    open()
    fireEvent.click(screen.getByText('Do you deliver?'))
    await screen.findByText(/delivery is available!/i, {}, { timeout: 3000 })
    expect(hrefs()).toEqual(expect.arrayContaining(['tel:0556131530', 'tel:0559250472']))
  })
})
