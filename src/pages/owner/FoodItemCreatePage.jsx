import { useLanguage } from '@context/LanguageContext'

const FoodItemCreatePage = () => {
  const { t } = useLanguage()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">{t('owner.addFoodItem')}</h1>
      <p className="text-gray-600">Food item create page - To be implemented</p>
    </div>
  )
}

export default FoodItemCreatePage
