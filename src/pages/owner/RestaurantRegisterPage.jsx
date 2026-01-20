import { useLanguage } from '@context/LanguageContext'

const RestaurantRegisterPage = () => {
  const { t } = useLanguage()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">{t('owner.addRestaurant')}</h1>
      <p className="text-gray-600">Restaurant registration page - To be implemented</p>
    </div>
  )
}

export default RestaurantRegisterPage
