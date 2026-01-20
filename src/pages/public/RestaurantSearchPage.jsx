import { useLanguage } from '@context/LanguageContext'

const RestaurantSearchPage = () => {
  const { t } = useLanguage()

  return (
    <div className="container-custom py-12">
      <h1 className="text-3xl font-bold mb-8">{t('restaurant.search')}</h1>
      <p className="text-gray-600">Restaurant search page - To be implemented</p>
    </div>
  )
}

export default RestaurantSearchPage
