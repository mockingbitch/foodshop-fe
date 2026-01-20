import { useLanguage } from '@context/LanguageContext'

const CategoryManagementPage = () => {
  const { t } = useLanguage()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">{t('admin.manageCategories')}</h1>
      <p className="text-gray-600">Category management page - To be implemented</p>
    </div>
  )
}

export default CategoryManagementPage
