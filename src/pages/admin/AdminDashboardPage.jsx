import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '@context/LanguageContext'
import { adminApi } from '@services/api/adminApi'
import LoadingSpinner from '@components/common/LoadingSpinner'
import { Store, UtensilsCrossed, Users, TrendingUp, Activity } from 'lucide-react'

const AdminDashboardPage = () => {
  const { t } = useLanguage()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi
      .getDashboardStats()
      .then((res) => {
        const raw = res?.data ?? res
        const data = raw?.data ?? raw?.stats ?? raw
        setStats(data && typeof data === 'object' ? data : null)
      })
      .catch(() => {
        setStats(null)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  const statCards = [
    {
      key: 'total_restaurants',
      label: t('admin.manageRestaurants'),
      value: stats?.total_restaurants ?? stats?.restaurants_count ?? 0,
      icon: Store,
      color: 'bg-blue-500',
      link: '/admin/restaurants',
    },
    {
      key: 'total_food_items',
      label: t('admin.manageFoodItems'),
      value: stats?.total_food_items ?? stats?.food_items_count ?? 0,
      icon: UtensilsCrossed,
      color: 'bg-green-500',
      link: null,
    },
    {
      key: 'total_users',
      label: 'Total Users',
      value: stats?.total_users ?? stats?.users_count ?? 0,
      icon: Users,
      color: 'bg-purple-500',
      link: null,
    },
    {
      key: 'active_restaurants',
      label: 'Active Restaurants',
      value: stats?.active_restaurants ?? stats?.active_restaurants_count ?? 0,
      icon: Activity,
      color: 'bg-amber-500',
      link: '/admin/restaurants?status=active',
    },
  ]

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('admin.title')}</h1>
        <p className="text-gray-600 mt-1">{t('admin.statistics')}</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon
          const viewLink = card.link ? (
            <span className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              {t('common.view')} →
            </span>
          ) : null
          const content = (
            <div className="card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                {viewLink}
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">{card.label}</h3>
              <p className="text-3xl font-bold text-gray-900">{Number(card.value).toLocaleString()}</p>
            </div>
          )

          if (card.link) {
            return (
              <Link key={card.key} to={card.link} className="block">
                {content}
              </Link>
            )
          }

          return <div key={card.key}>{content}</div>
        })}
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/admin/restaurants"
            className="btn btn-outline flex items-center justify-center gap-2"
          >
            <Store size={20} />
            {t('admin.manageRestaurants')}
          </Link>
          <Link
            to="/admin/categories"
            className="btn btn-outline flex items-center justify-center gap-2"
          >
            <UtensilsCrossed size={20} />
            {t('admin.manageCategories')}
          </Link>
          <Link
            to="/admin/news/create"
            className="btn btn-outline flex items-center justify-center gap-2"
          >
            <TrendingUp size={20} />
            {t('admin.manageNews')}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardPage
