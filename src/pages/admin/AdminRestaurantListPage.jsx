import { useLanguage } from '@context/LanguageContext'

const AdminRestaurantListPage = () => {
  const { t } = useLanguage()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">{t('admin.manageRestaurants')}</h1>
      <p className="text-gray-600">Admin restaurant management page - To be implemented</p>
    </div>
  )
}

export default AdminRestaurantListPage
