import { Link, useLocation } from 'react-router-dom'
import { User, BookOpen, UtensilsCrossed, X, LogOut } from 'lucide-react'
import { useLanguage } from '@context/LanguageContext'
import { useAuth } from '@context/AuthContext'

const OwnerSidebar = ({ open = false, onClose }) => {
  const location = useLocation()
  const { t } = useLanguage()
  const { user, logout } = useAuth()

  const menuItems = [
    { path: '/owner/dashboard', icon: BookOpen, label: t('owner.myRestaurants') },
    { path: '/owner/restaurant/register', icon: UtensilsCrossed, label: t('owner.addRestaurant') },
  ]

  const isActive = (path) => {
    if (path === '/owner/dashboard') return location.pathname === path
    return location.pathname.startsWith(path)
  }

  const handleNavClick = () => {
    if (onClose) onClose()
  }

  const sidebarContent = (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200 md:justify-start md:mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden flex-shrink-0">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <User size={24} className="text-primary-600" />
            )}
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="font-semibold text-gray-900 truncate" title={user?.name || user?.email || undefined}>
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
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition min-w-0 ${
              isActive(path)
                ? 'bg-primary-50 text-primary-600 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Icon size={20} className="flex-shrink-0" />
            <span className="truncate">{label}</span>
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
      {/* Backdrop: không dùng trên mobile (sidebar ẩn), chỉ cần trên md nếu có drawer */}
      <div
        className="hidden fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Sidebar: ẩn trên mobile; desktop = fixed bên trái, không cuộn theo body */}
      <aside
        className={`
          hidden md:flex md:flex-col
          w-64 bg-white border-r border-gray-200
          fixed left-0 top-14 md:top-16 bottom-0 z-10
          overflow-y-auto overflow-x-hidden
        `}
      >
        {sidebarContent}
      </aside>
    </>
  )
}

export default OwnerSidebar
