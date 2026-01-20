import { useLanguage } from '@context/LanguageContext'

const CategoryCreatePage = () => {
  const { t } = useLanguage()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Create Category</h1>
      <p className="text-gray-600">Category create page - To be implemented</p>
    </div>
  )
}

export default CategoryCreatePage
