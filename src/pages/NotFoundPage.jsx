import { Link } from 'react-router-dom'
import { useLanguage } from '@context/LanguageContext'

const NotFoundPage = () => {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary-600">404</h1>
        <h2 className="text-3xl font-semibold text-gray-900 mt-4 mb-2">Page Not Found</h2>
        <p className="text-gray-600 mb-8">The page you are looking for does not exist.</p>
        <Link to="/" className="btn btn-primary">
          {t('common.home')}
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage
