import { createContext, useContext, useState, useEffect } from 'react'
import { getLanguage, setLanguage as saveLanguage } from '@utils/storage'
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from '@constants'
import { getLocalizedText } from '@utils/helpers'

// Import translation files
import enTranslations from '@locales/en.json'
import viTranslations from '@locales/vi.json'
import koTranslations from '@locales/ko.json'

const translations = {
  en: enTranslations,
  vi: viTranslations,
  ko: koTranslations,
}

const LanguageContext = createContext(null)

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(getLanguage() || DEFAULT_LANGUAGE)

  useEffect(() => {
    // Validate language
    if (!SUPPORTED_LANGUAGES.includes(currentLanguage)) {
      setCurrentLanguage(DEFAULT_LANGUAGE)
      saveLanguage(DEFAULT_LANGUAGE)
    }
  }, [])

  const changeLanguage = (languageCode) => {
    if (SUPPORTED_LANGUAGES.includes(languageCode)) {
      setCurrentLanguage(languageCode)
      saveLanguage(languageCode)
      
      // Update document lang attribute
      document.documentElement.lang = languageCode
      
      return true
    }
    return false
  }

  const t = (key, params = {}) => {
    const keys = key.split('.')
    let translation = translations[currentLanguage]

    for (const k of keys) {
      if (translation && typeof translation === 'object') {
        translation = translation[k]
      } else {
        // Fallback to English if translation not found
        translation = translations.en
        for (const fallbackKey of keys) {
          if (translation && typeof translation === 'object') {
            translation = translation[fallbackKey]
          } else {
            return key
          }
        }
        break
      }
    }

    if (typeof translation !== 'string') {
      return key
    }

    // Replace parameters in translation
    let result = translation
    Object.keys(params).forEach(param => {
      result = result.replace(`{${param}}`, params[param])
    })

    return result
  }

  // Get multilingual content from object (align với getLocalizedText: theo currentLanguage, fallback giá trị khác)
  const getMultilingualContent = (content, field = 'name') => {
    if (!content) return ''
    if (typeof content === 'string') return content.trim()
    if (typeof content !== 'object') return ''

    const node = content[currentLanguage]
    if (node != null) {
      if (typeof node === 'object' && node[field] != null) {
        const s = node[field]
        if (typeof s === 'string' && s.trim()) return s.trim()
      } else if (typeof node === 'string' && node.trim()) {
        return node.trim()
      }
    }

    if (field === 'name' || field === 'description') {
      return getLocalizedText(content, currentLanguage)
    }

    if (content.en && typeof content.en === 'object' && content.en[field] != null) {
      const s = content.en[field]
      if (typeof s === 'string' && s.trim()) return s.trim()
    }
    const firstKey = Object.keys(content)[0]
    if (firstKey && content[firstKey]) {
      const n = content[firstKey]
      if (typeof n === 'object' && n[field] != null && typeof n[field] === 'string') return n[field].trim()
      if (typeof n === 'string') return n.trim()
    }
    return ''
  }

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    getMultilingualContent,
    supportedLanguages: SUPPORTED_LANGUAGES,
  }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
