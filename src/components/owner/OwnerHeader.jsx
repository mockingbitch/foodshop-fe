import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, User, BookOpen, UtensilsCrossed, LogOut, Globe } from 'lucide-react'
import { useAuth } from '@context/AuthContext'
import { useLanguage } from '@context/LanguageContext'
import { LANGUAGE_LABELS } from '@constants'
import OwnerHeaderNav from './OwnerHeaderNav'

/**
 * Header dùng cho Owner Dashboard.
 * Menu giống sidebar: Profile, My Restaurants, Add Restaurant, Add Food Item, Logout.
 * Không có menu public (Restaurants, Food, Categories, News) — chỉ có ở trang homepage.
 */
const OwnerHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false)
  const languageMenuRef = useRef(null)
  const { user, logout } = useAuth()
  const { currentLanguage, changeLanguage, t } = useLanguage()

  useEffect(() => {
    if (!languageMenuOpen) return
    const handleClickOutside = (e) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(e.target)) {
        setLanguageMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [languageMenuOpen])

  const handleLanguageChange = (lang) => {
    changeLanguage(lang)
    setLanguageMenuOpen(false)
  }

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
      <div className="container-custom">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg md:text-xl">FS</span>
            </div>
            <span className="font-bold text-lg md:text-xl text-gray-900 hidden sm:block">
              Food Shop
            </span>
          </Link>

          {/* Menu header owner: ẩn hết (chỉ dùng sidebar) */}
          <nav className="hidden" aria-hidden="true">
            <OwnerHeaderNav onNavigate={closeMobileMenu} />
          </nav>

          {/* Right: Language + Profile + Logout (+ hamburger mobile) */}
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="relative" ref={languageMenuRef}>
              <button
                type="button"
                className="p-2 text-gray-600 hover:text-primary-600 transition flex items-center space-x-1"
                onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
              >
                <Globe size={20} />
                <span className="text-sm hidden sm:inline">{currentLanguage.toUpperCase()}</span>
              </button>
              {languageMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg py-2 border border-gray-200 z-50">
                  {Object.entries(LANGUAGE_LABELS).map(([code, label]) => (
                    <button
                      key={code}
                      type="button"
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                        currentLanguage === code ? 'text-primary-600 font-medium' : 'text-gray-700'
                      }`}
                      onClick={() => handleLanguageChange(code)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Link
              to="/owner/profile"
              className="hidden sm:flex items-center gap-2 px-2 py-1.5 rounded-lg text-gray-700 hover:bg-gray-100 transition min-w-0"
            >
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                {user?.avatar ? (
                  <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User size={16} className="text-primary-600" />
                )}
              </div>
              <span className="text-sm font-medium truncate max-w-[120px] min-w-0 block" title={user?.name || user?.email || undefined}>
                {user?.name || user?.email || 'Owner'}
              </span>
            </Link>
            <button
              type="button"
              onClick={logout}
              className="hidden sm:block p-2 text-gray-600 hover:text-red-600 transition"
              title={t('common.logout')}
            >
              <LogOut size={20} />
            </button>
            <button
              type="button"
              className="md:hidden p-2 text-gray-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile: gộp hết menu sidebar (Profile, Dashboard, Add Restaurant, Add Food) + Language + Logout */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col gap-1">
              <OwnerHeaderNav onNavigate={closeMobileMenu} variant="mobile" />
              <div className="px-4 py-2 border-t border-gray-100 mt-1">
                <span className="text-xs font-medium text-gray-500 uppercase block mb-2">{t('common.language')}</span>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(LANGUAGE_LABELS).map(([code, label]) => (
                    <button
                      key={code}
                      type="button"
                      className={`px-3 py-1.5 rounded text-sm ${currentLanguage === code ? 'bg-primary-100 text-primary-600 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                      onClick={() => handleLanguageChange(code)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <button type="button" onClick={() => { closeMobileMenu(); logout() }} className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 w-full text-left mt-1">
                <LogOut size={20} />
                <span>{t('common.logout')}</span>
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default OwnerHeader
