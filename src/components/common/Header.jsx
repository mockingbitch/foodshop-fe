import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, Search, User, LogOut, Globe } from 'lucide-react'
import { useAuth } from '@context/AuthContext'
import { useLanguage } from '@context/LanguageContext'
import { LANGUAGE_LABELS } from '@constants'

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()
  const { currentLanguage, changeLanguage, t } = useLanguage()
  const navigate = useNavigate()

  const handleLanguageChange = (lang) => {
    changeLanguage(lang)
    setLanguageMenuOpen(false)
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">FS</span>
            </div>
            <span className="font-bold text-xl text-gray-900 hidden sm:block">
              Food Shop
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/restaurants" className="text-gray-700 hover:text-primary-600 transition">
              {t('common.restaurants')}
            </Link>
            <Link to="/food-items" className="text-gray-700 hover:text-primary-600 transition">
              {t('common.food')}
            </Link>
            <Link to="/food-categories" className="text-gray-700 hover:text-primary-600 transition">
              {t('common.categories')}
            </Link>
            <Link to="/news" className="text-gray-700 hover:text-primary-600 transition">
              {t('common.news')}
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {/* Search Button */}
            <button 
              className="p-2 text-gray-600 hover:text-primary-600 transition"
              onClick={() => navigate('/restaurants/search')}
            >
              <Search size={20} />
            </button>

            {/* Language Selector */}
            <div className="relative">
              <button
                className="p-2 text-gray-600 hover:text-primary-600 transition flex items-center space-x-1"
                onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
              >
                <Globe size={20} />
                <span className="text-sm">{currentLanguage.toUpperCase()}</span>
              </button>

              {languageMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg py-2 border border-gray-200">
                  {Object.entries(LANGUAGE_LABELS).map(([code, label]) => (
                    <button
                      key={code}
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

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link
                  to={user?.role === 'admin' ? '/admin/dashboard' : '/owner/profile'}
                  className="hidden md:flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-primary-600 transition"
                >
                  <User size={20} />
                  <span>{user?.name || user?.email}</span>
                </Link>
                <button
                  onClick={logout}
                  className="p-2 text-gray-600 hover:text-red-600 transition"
                  title={t('common.logout')}
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link to="/owner/login" className="btn btn-outline">
                  {t('auth.loginTitle')}
                </Link>
                <Link to="/owner/register" className="btn btn-primary">
                  {t('auth.registerTitle')}
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/restaurants"
                className="text-gray-700 hover:text-primary-600 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('common.restaurants')}
              </Link>
              <Link
                to="/food-items"
                className="text-gray-700 hover:text-primary-600 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('common.food')}
              </Link>
              <Link
                to="/food-categories"
                className="text-gray-700 hover:text-primary-600 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('common.categories')}
              </Link>
              <Link
                to="/news"
                className="text-gray-700 hover:text-primary-600 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('common.news')}
              </Link>

              {!isAuthenticated && (
                <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                  <Link to="/owner/login" className="btn btn-outline w-full">
                    {t('auth.loginTitle')}
                  </Link>
                  <Link to="/owner/register" className="btn btn-primary w-full">
                    {t('auth.registerTitle')}
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
