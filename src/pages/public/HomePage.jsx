import { useLanguage } from '@context/LanguageContext'

const HomePage = () => {
  const { t } = useLanguage()

  return (
    <div className="container-custom py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Welcome to Food Shop
        </h1>
        <p className="text-xl text-gray-600">
          Discover amazing restaurants and delicious food near you
        </p>
      </div>

      {/* Featured Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="card text-center">
          <h3 className="text-2xl font-semibold mb-2">{t('common.restaurants')}</h3>
          <p className="text-gray-600 mb-4">Browse restaurants in your area</p>
          <a href="/restaurants" className="btn btn-primary">
            {t('common.view')}
          </a>
        </div>

        <div className="card text-center">
          <h3 className="text-2xl font-semibold mb-2">{t('common.food')}</h3>
          <p className="text-gray-600 mb-4">Explore delicious food items</p>
          <a href="/food-items" className="btn btn-primary">
            {t('common.view')}
          </a>
        </div>

        <div className="card text-center">
          <h3 className="text-2xl font-semibold mb-2">{t('common.news')}</h3>
          <p className="text-gray-600 mb-4">Latest news and courses</p>
          <a href="/news" className="btn btn-primary">
            {t('common.view')}
          </a>
        </div>
      </div>
    </div>
  )
}

export default HomePage
