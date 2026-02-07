import { Link, useLocation } from 'react-router-dom'
import { User, BookOpen, UtensilsCrossed } from 'lucide-react'
import { useLanguage } from '@context/LanguageContext'

/**
 * Menu owner dùng trong OwnerHeader (và đồng bộ với OwnerSidebar).
 * Các mục: Profile, My Restaurants (dashboard), Add Restaurant, Add Food Item.
 */
const OwnerHeaderNav = ({ onNavigate, variant = 'desktop' }) => {
  const location = useLocation()
  const { t } = useLanguage()

  const menuItems = [
    { path: '/owner/profile', icon: User, label: t('common.profile') },
    { path: '/owner/dashboard', icon: BookOpen, label: t('owner.myRestaurants') },
    { path: '/owner/restaurant/register', icon: UtensilsCrossed, label: t('owner.addRestaurant') },
  ]

  const isActive = (path) => {
    if (path === '/owner/dashboard') return location.pathname === path
    return location.pathname.startsWith(path)
  }

  const baseClass = variant === 'mobile'
    ? 'flex items-center gap-3 px-4 py-3 rounded-lg transition'
    : 'flex items-center gap-2 px-3 py-2 rounded-lg transition text-sm font-medium'

  const activeClass = 'bg-primary-50 text-primary-600'
  const inactiveClass = 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'

  return (
    <>
      {menuItems.map(({ path, icon: Icon, label }) => (
        <Link
          key={path}
          to={path}
          onClick={onNavigate}
          className={`${baseClass} min-w-0 ${isActive(path) ? activeClass : inactiveClass}`}
        >
          <Icon size={variant === 'mobile' ? 20 : 18} className="flex-shrink-0" />
          <span className="truncate">{label}</span>
        </Link>
      ))}
    </>
  )
}

export default OwnerHeaderNav
