import { useParams } from 'react-router-dom'
import { useLanguage } from '@context/LanguageContext'

const RestaurantDetailPage = () => {
  const { id } = useParams()
  const { t } = useLanguage()

  return (
    <div className="container-custom py-12">
      <h1 className="text-3xl font-bold mb-8">{t('restaurant.detail')}</h1>
      <p className="text-gray-600">Restaurant ID: {id} - To be implemented</p>
    </div>
  )
}

export default RestaurantDetailPage
