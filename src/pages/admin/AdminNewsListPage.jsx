import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '@context/LanguageContext'
import { newsApi } from '@services/api/newsApi'
import { toast } from 'react-toastify'
import LoadingSpinner from '@components/common/LoadingSpinner'
import ConfirmModal from '@components/common/ConfirmModal'
import { Newspaper, Search, Edit, Plus, Trash2 } from 'lucide-react'

const ensureArray = (value) => {
  if (Array.isArray(value)) return value
  if (!value || typeof value !== 'object') return []
  const raw = value.data ?? value.news ?? value.items ?? value.results ?? value.list
  if (Array.isArray(raw)) return raw
  if (raw && typeof raw === 'object') {
    const nested = raw.data ?? raw.news ?? raw.items ?? raw.results ?? raw.list
    return Array.isArray(nested) ? nested : []
  }
  return []
}

const DEBOUNCE_MS = 350
const NEWS_TYPES = { news: 'News', course: 'Course', chef: 'Chef' }

const AdminNewsListPage = () => {
  const { t } = useLanguage()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [deleting, setDeleting] = useState(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  const fetchNews = useCallback(async () => {
    setLoading(true)
    try {
      const params = { per_page: 100 }
      if (searchQuery?.trim()) params.search = searchQuery.trim()
      if (typeFilter) params.type = typeFilter
      const res = await newsApi.getNews(params)
      const raw = res?.data ?? res
      const list = ensureArray(raw)
      setItems(Array.isArray(list) ? list : [])
    } catch (error) {
      console.error('Error fetching news:', error)
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNews()
    }, DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [searchQuery, typeFilter, fetchNews])

  const handleDeleteClick = (id) => {
    setItemToDelete(id)
    setShowConfirm(true)
  }

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return
    setDeleting(itemToDelete)
    try {
      await newsApi.deleteNews(itemToDelete)
      setItems((prev) => prev.filter((item) => item.id !== itemToDelete))
      toast.success(t('common.success'))
    } catch (error) {
      console.error('Error deleting news:', error)
      toast.error(t('common.error'))
    } finally {
      setDeleting(null)
      setItemToDelete(null)
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('admin.manageNews')}</h1>
        <Link
          to="/admin/news/create"
          className="btn btn-primary inline-flex items-center gap-2 shrink-0"
        >
          <Plus size={20} />
          {t('common.add')}
        </Link>
      </div>

      <div className="card p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
              placeholder={t('common.search')}
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="input sm:w-48"
          >
            <option value="">{t('common.all')}</option>
            <option value="news">{t('common.news')}</option>
            <option value="course">{t('common.courses')}</option>
            <option value="chef">{t('common.chefs')}</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      ) : items.length === 0 ? (
        <div className="card p-8 text-center">
          <Newspaper size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">{t('common.noData')}</p>
          <Link to="/admin/news/create" className="btn btn-primary">
            {t('common.add')}
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">#</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Type</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Title</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item, index) => {
                  const isDeleting = deleting === item.id
                  const typeLabel = NEWS_TYPES[item.type] || item.type
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{typeLabel}</td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900 truncate block max-w-[200px]">
                          {item.title || t('common.noData')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {item.status === 'active' ? t('common.active') : t('common.inactive')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/news/${item.id}/edit`}
                            className="btn btn-outline text-sm inline-flex items-center gap-1"
                          >
                            <Edit size={16} />
                            {t('common.edit')}
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(item.id)}
                            disabled={isDeleting}
                            className="btn btn-outline text-sm text-red-600 border-red-200 hover:bg-red-50 inline-flex items-center gap-1 disabled:opacity-50"
                          >
                            <Trash2 size={16} />
                            {t('common.delete')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => {
          setShowConfirm(false)
          setItemToDelete(null)
        }}
        onConfirm={handleDeleteConfirm}
        title={t('common.confirmDelete')}
        message={t('common.confirmDelete')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="danger"
      />
    </div>
  )
}

export default AdminNewsListPage
