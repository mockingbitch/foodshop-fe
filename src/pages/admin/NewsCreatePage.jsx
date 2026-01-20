import { useLanguage } from '@context/LanguageContext'

const NewsCreatePage = () => {
  const { t } = useLanguage()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Create News/Course/Chef</h1>
      <p className="text-gray-600">News create page - To be implemented</p>
    </div>
  )
}

export default NewsCreatePage
