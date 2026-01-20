import { useParams } from 'react-router-dom'
import { useLanguage } from '@context/LanguageContext'

const FoodItemEditPage = () => {
  const { id } = useParams()
  const { t } = useLanguage()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Edit Food Item</h1>
      <p className="text-gray-600">Food ID: {id} - Edit page - To be implemented</p>
    </div>
  )
}

export default FoodItemEditPage
