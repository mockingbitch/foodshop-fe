import { useParams } from 'react-router-dom'
import { useLanguage } from '@context/LanguageContext'

const NewsDetailPage = () => {
  const { id } = useParams()
  const { t } = useLanguage()

  return (
    <div className="container-custom py-12">
      <h1 className="text-3xl font-bold mb-8">News Detail</h1>
      <p className="text-gray-600">News ID: {id} - To be implemented</p>
    </div>
  )
}

export default NewsDetailPage
