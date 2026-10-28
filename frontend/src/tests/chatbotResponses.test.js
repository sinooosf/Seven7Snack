import { describe, it, expect } from 'vitest'
import { getBotResponse, quickQuestions } from '../components/chatbot/chatbotResponses'
import { MENU_ITEMS } from '../data/menu'

describe('getBotResponse', () => {
  it('answers the name question', () => {
    expect(getBotResponse("What's your name?").text).toMatch(/sinoo/i)
  })

  it('returns a list of best dishes with rich content', () => {
    const response = getBotResponse('What are the best dishes?')
    expect(response.richContent.type).toBe('items')
    expect(response.richContent.items.length).toBeGreaterThan(0)
    expect(response.richContent.items.every((item) => item.isBest)).toBe(true)
  })

  it('lists unavailable items when asked about availability', () => {
    // Everything on the built-in menu is available, so mark one dish unavailable for this test.
    const dish = MENU_ITEMS.find((i) => i.id === 'pizza-ail-chinx')
    dish.available = false
    try {
      const response = getBotResponse("what's available today")
      expect(response.text).toMatch(/Pizza Ail Chinx/)
    } finally {
      dish.available = true
    }
  })

  it('answers the opening hours question', () => {
    expect(getBotResponse('What time do you close?').text).toMatch(/11:00/)
  })

  it('falls back gracefully for anything else', () => {
    expect(getBotResponse('do you deliver to the moon').text).toMatch(/simple assistant/i)
  })

  it('gives the real contact details, with quick-action buttons, when asked for contact / number / info / delivery', () => {
    for (const question of [
      'what is the manager phone number',
      'give me the num',
      'I need info',
      'how can I contact you',
      "what's the manager's name",
      'your email?',
      'do you have instagram',
      'is delivery available',
    ]) {
      const response = getBotResponse(question)
      expect(response.text, question).toMatch(/0556 13 15 30/)
      expect(response.text, question).toMatch(/0559 25 04 72/)
      expect(response.richContent.type, question).toBe('contact')
    }
    expect(getBotResponse('numéro du gérant ?', 'fr').text).toMatch(/0556 13 15 30/)
    expect(getBotResponse('livraison ?', 'fr').text).toMatch(/Livraison disponible/)
    expect(getBotResponse('رقم المدير', 'ar').text).toMatch(/0556 13 15 30/)
  })

  it('the contact buttons call both numbers and open TikTok and Instagram', () => {
    const { actions } = getBotResponse('how can I contact you').richContent
    expect(actions.map((a) => a.href)).toEqual([
      'tel:+213556131530',
      'tel:+213559250472',
      'https://www.instagram.com/seven7snack.bouIsmail/',
      'https://www.tiktok.com/@seven7snack',
    ])
    expect(actions[0].label).toBe('Call 0556 13 15 30')
    expect(actions[2].label).toMatch(/seven7snack\.bouIsmail/)
    expect(actions[3].label).toMatch(/seven7snack/)
  })

  it('the quick question "contact" gets the contact answer in every language', () => {
    for (const lang of ['en', 'fr', 'ar']) {
      const question = quickQuestions(lang)[4]
      expect(getBotResponse(question, lang).richContent.type, lang).toBe('contact')
    }
  })

  it('words like "install" do not trigger the contact answer', () => {
    expect(getBotResponse('do you install wifi').text).toMatch(/simple assistant/i)
  })

  it('points to the Call waiter button when asked for a waiter', () => {
    expect(getBotResponse('I need a waiter').text).toMatch(/call waiter/i)
    expect(getBotResponse('un serveur svp', 'fr').text).toMatch(/serveur/i)
  })

  it('does not steal the old questions', () => {
    expect(getBotResponse("What's your name?").text).toMatch(/sinoo/i)
    expect(getBotResponse('What time do you close?').text).toMatch(/11:00/)
    expect(getBotResponse('What are the best dishes?').richContent).toBeTruthy()
  })
})
