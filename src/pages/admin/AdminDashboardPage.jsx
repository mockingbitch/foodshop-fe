import { useLanguage } from '@context/LanguageContext'

const AdminDashboardPage = () => {
  const { t } = useLanguage()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">{t('admin.title')}</h1>
      <p className="text-gray-600">Admin dashboard page - To be implemented</p>
    </div>
  )
}

export default AdminDashboardPage
