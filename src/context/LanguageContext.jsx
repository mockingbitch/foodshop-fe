import { createContext, useContext, useState, useEffect } from 'react'
import { getLanguage, setLanguage as saveLanguage } from '@utils/storage'
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from '@constants'

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

  // Get multilingual content from object
  const getMultilingualContent = (content, field = 'name') => {
    if (!content) return ''
    
    // If content is already a string, return it
    if (typeof content === 'string') return content
    
    // If content is an object with language codes
    if (typeof content === 'object') {
      // Try current language
      if (content[currentLanguage]) {
        return typeof content[currentLanguage] === 'object' 
          ? content[currentLanguage][field] 
          : content[currentLanguage]
      }
      
      // Try English as fallback
      if (content.en) {
        return typeof content.en === 'object' 
          ? content.en[field] 
          : content.en
      }
      
      // Return first available language
      const firstLang = Object.keys(content)[0]
      if (firstLang) {
        return typeof content[firstLang] === 'object' 
          ? content[firstLang][field] 
          : content[firstLang]
      }
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
