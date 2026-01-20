import { Link, useLocation } from 'react-router-dom'
import { Home, Store, UtensilsCrossed, User } from 'lucide-react'
import { useLanguage } from '@context/LanguageContext'

const OwnerSidebar = () => {
  const location = useLocation()
  const { t } = useLanguage()

  const menuItems = [
    { path: '/owner/profile', icon: User, label: t('common.profile') },
    { path: '/owner/restaurant/register', icon: Store, label: t('owner.addRestaurant') },
    { path: '/owner/food-items/create', icon: UtensilsCrossed, label: t('owner.addFoodItem') },
  ]

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">{t('owner.title')}</h2>
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? 'bg-primary-50 text-primary-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}

export default OwnerSidebar
