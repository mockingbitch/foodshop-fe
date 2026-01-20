import { useParams } from 'react-router-dom'
import { useLanguage } from '@context/LanguageContext'

const AdminFoodItemListPage = () => {
  const { id } = useParams()
  const { t } = useLanguage()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">{t('admin.manageFoodItems')}</h1>
      <p className="text-gray-600">Restaurant ID: {id} - Food items management - To be implemented</p>
    </div>
  )
}

export default AdminFoodItemListPage
