import { translate } from '../i18n/translate'
import { CONTACT } from '../data/contact'
import { describe, it, expect } from 'vitest'
import { getBotResponse } from '../components/chatbot/chatbotResponses'
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
    expect(getBotResponse('tell me a joke about the moon').text).toMatch(/simple assistant/i)
  })

  it('shows the real contact buttons (phones, TikTok, Instagram) for contact questions', () => {
    for (const question of [
      'what is the manager phone number',
      'give me the num',
      'I need info',
      'how can I contact you',
      "what's the manager's name",
      'your email?',
      'do you have instagram',
      'whats your tiktok',
    ]) {
      expect(getBotResponse(question).richContent?.type, question).toBe('contact')
    }
    expect(getBotResponse('numéro du gérant ?', 'fr').richContent?.type).toBe('contact')
    expect(getBotResponse('رقم المدير', 'ar').richContent?.type).toBe('contact')
  })

  it('answers delivery questions in three languages, with the delivery numbers', () => {
    for (const [question, lang] of [['do you deliver?', 'en'], ['Faites-vous la livraison ?', 'fr'], ['هل يوجد توصيل؟', 'ar'], ['delivery number', 'en']]) {
      const answer = getBotResponse(question, lang)
      expect(answer.richContent?.type, question).toBe('contact')
      expect(answer.text, question).not.toBe(translate(lang, 'chat.r.fallback'))
    }
    expect(CONTACT.phones).toEqual(['0556131530', '0559250472'])
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
