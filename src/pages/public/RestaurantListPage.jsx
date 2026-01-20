import { useLanguage } from '@context/LanguageContext'

const RestaurantListPage = () => {
  const { t } = useLanguage()

  return (
    <div className="container-custom py-12">
      <h1 className="text-3xl font-bold mb-8">{t('restaurant.title')}</h1>
      <p className="text-gray-600">Restaurant list page - To be implemented</p>
    </div>
  )
}

export default RestaurantListPage
