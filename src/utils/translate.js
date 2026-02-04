import { getLanguage } from '@utils/storage'
import { DEFAULT_LANGUAGE } from '@constants'
import enTranslations from '@locales/en.json'
import viTranslations from '@locales/vi.json'
import koTranslations from '@locales/ko.json'

const translations = {
  en: enTranslations,
  vi: viTranslations,
  ko: koTranslations,
}

/**
 * Dịch key sang message theo ngôn ngữ hiện tại (dùng ngoài React, ví dụ axios interceptor).
 * Key dạng "errors.networkError", "common.save"...
 * @param {string} key
 * @returns {string}
 */
export function translate(key) {
  const lang = getLanguage() || DEFAULT_LANGUAGE
  const locale = translations[lang] || translations.en
  const keys = key.split('.')
  let value = locale
  for (const k of keys) {
    value = value?.[k]
  }
  if (typeof value === 'string') return value
  const fallback = translations.en
  let fallbackValue = fallback
  for (const k of keys) {
    fallbackValue = fallbackValue?.[k]
  }
  return typeof fallbackValue === 'string' ? fallbackValue : key
}
