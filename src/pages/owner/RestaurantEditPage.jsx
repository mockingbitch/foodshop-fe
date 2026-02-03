import { useParams } from 'react-router-dom'
import { useLanguage } from '@context/LanguageContext'

const RestaurantEditPage = () => {
  const { id } = useParams()
  const { t } = useLanguage()

  return (
    <div className="w-full">
      <div className="container-custom py-6">
        <div>
          <h1 className="text-3xl font-bold mb-8">Edit Restaurant</h1>
          <p className="text-gray-600">Restaurant ID: {id} - Edit page - To be implemented</p>
        </div>
      </div>
    </div>
  )
}

export default RestaurantEditPage
