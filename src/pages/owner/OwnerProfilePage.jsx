import { useLanguage } from '@context/LanguageContext'

const OwnerProfilePage = () => {
  const { t } = useLanguage()

  return (
    <div className="w-full">
      <div className="container-custom py-6">
        <div>
          <h1 className="text-3xl font-bold mb-8">{t('common.profile')}</h1>
          <p className="text-gray-600">Owner profile page - To be implemented</p>
        </div>
      </div>
    </div>
  )
}

export default OwnerProfilePage
