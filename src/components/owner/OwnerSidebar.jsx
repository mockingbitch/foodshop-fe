import { Link, useLocation } from 'react-router-dom'
import { User, BookOpen, UtensilsCrossed, X, LogOut } from 'lucide-react'
import { useLanguage } from '@context/LanguageContext'
import { useAuth } from '@context/AuthContext'

const OwnerSidebar = ({ open = false, onClose }) => {
  const location = useLocation()
  const { t } = useLanguage()
  const { user, logout } = useAuth()

  const menuItems = [
    { path: '/owner/profile', icon: User, label: t('common.profile') },
    { path: '/owner/dashboard', icon: BookOpen, label: t('owner.myRestaurants') },
    { path: '/owner/restaurant/register', icon: UtensilsCrossed, label: t('owner.addRestaurant') },
    { path: '/owner/food-items/create', icon: UtensilsCrossed, label: t('owner.addFoodItem') },
  ]

  const isActive = (path) => {
    if (path === '/owner/dashboard') return location.pathname === path
    return location.pathname.startsWith(path)
  }

  const handleNavClick = () => {
    if (onClose) onClose()
  }

  const sidebarContent = (
    <div className="p-4 sm:p-6 sticky top-0">
      <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200 md:justify-start md:mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden flex-shrink-0">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <User size={24} className="text-primary-600" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 truncate">
              {user?.name || user?.email || 'Owner'}
            </p>
            <Link
              to="/owner/profile"
              className="text-sm text-primary-600 hover:text-primary-700"
              onClick={handleNavClick}
            >
              {t('common.edit')} {t('common.profile')}
            </Link>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>
      <nav className="space-y-1">
        {menuItems.map(({ path, icon: Icon, label }) => (
          <Link
            key={path}
            to={path}
            onClick={handleNavClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              isActive(path)
                ? 'bg-primary-50 text-primary-600 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Icon size={20} className="flex-shrink-0" />
            <span>{label}</span>
          </Link>
        ))}
        <button
          onClick={() => { handleNavClick(); logout() }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition mt-4"
        >
          <LogOut size={20} className="flex-shrink-0" />
          <span>{t('common.logout')}</span>
        </button>
      </nav>
    </div>
  )

  return (
    <>
      {/* Backdrop mobile */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity md:hidden ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Sidebar: drawer on mobile, fixed left on desktop */}
      <aside
        className={`
          w-64 flex-shrink-0 bg-white border-r border-gray-200 min-h-full
          fixed md:relative inset-y-0 left-0 z-50 md:z-auto
          transform transition-transform duration-200 ease-out
          md:transform-none
          ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {sidebarContent}
      </aside>
    </>
  )
}

export default OwnerSidebar
