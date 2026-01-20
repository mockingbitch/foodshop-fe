import { useLanguage } from '@context/LanguageContext'

const NewsListPage = () => {
  const { t } = useLanguage()

  return (
    <div className="container-custom py-12">
      <h1 className="text-3xl font-bold mb-8">{t('common.news')}</h1>
      <p className="text-gray-600">News/Course/Chef list page - To be implemented</p>
    </div>
  )
}

export default NewsListPage
