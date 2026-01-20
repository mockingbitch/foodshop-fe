import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Store, UtensilsCrossed, FolderTree, Newspaper } from 'lucide-react'
import { useLanguage } from '@context/LanguageContext'

const AdminSidebar = () => {
  const location = useLocation()
  const { t } = useLanguage()

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: t('common.dashboard') },
    { path: '/admin/restaurants', icon: Store, label: t('admin.manageRestaurants') },
    { path: '/admin/categories', icon: FolderTree, label: t('admin.manageCategories') },
    { path: '/admin/news/create', icon: Newspaper, label: t('admin.manageNews') },
  ]

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">{t('admin.title')}</h2>
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

export default AdminSidebar
