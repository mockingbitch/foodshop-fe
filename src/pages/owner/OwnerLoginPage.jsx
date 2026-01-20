import { useLanguage } from '@context/LanguageContext'

const OwnerLoginPage = () => {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full">
        <div className="card">
          <h1 className="text-3xl font-bold mb-8 text-center">{t('auth.loginTitle')}</h1>
          <p className="text-gray-600 text-center">Owner login page - To be implemented</p>
        </div>
      </div>
    </div>
  )
}

export default OwnerLoginPage
